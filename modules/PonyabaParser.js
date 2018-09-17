//@import PHPLayer

function PonyabaParser() {
	/* Markdown Text Parser (ported from PHP code) */
	const $this = {
		
		textElements, setUrlsLinked, setSafeMode, setStrictMode, lines, linesElements, extractElement, isBlockContinuable, isBlockCompletable, blockCode, blockCodeContinue, blockCodeComplete, blockFencedCode, blockFencedCodeContinue, blockFencedCodeComplete, blockList, blockListContinue, blockListComplete, blockQuote, blockTable, blockTableContinue, paragraph, paragraphContinue, lineElements, inlineText, inlineCode, inlineDice, inlinePonyabaMark, inlineEmphasis, inlineReplyLink, inlineLink, inlineBBCode, inlineUrl, inlineSpecialCharacter, inlineEscapeSequence, unmarkedText, handle, handleElementRecursive, handleElementsRecursive, elementApplyRecursive, elementApplyRecursiveDepthFirst, elementsApplyRecursive, elementsApplyRecursiveDepthFirst, element, elements, li, sanitiseElement, filterUnsafeUrlInAttribute, globalBBTags
		
	};
	
	this.parsePost = text;
	this.parseLine = line;
	
	// ~
	function text($text)
	{
		try {
			const $Elements = $this.textElements($text);
			
			// convert to markup
			let $markup = $this.elements($Elements);
			
			// render global BBTags
			$markup = $this.globalBBTags($markup);
			
			// trim line breaks
			$text = trim($markup, "\n");
		} catch (trace) {
			$text = `<code style="background: lightcoral; padding: 2px 8px; color: darkred;">${trace.lineNumber}:${trace.columnNumber} ${trace.message}</code>`;
		} finally {
			return $text;
		}
	}
	
	function textElements($text)
	{
		// make sure no definitions are set
		$this.DefinitionData = {'Reference': {}};
		$this.OpenedBBTags   = [];
		$this.ClosedBBTags   = {};
		
		// standardize line breaks
		$text = str_replace(array("\r\n", "\r"), "\n", $text);
		
		// replace code blocks
		$text = $text.replace(/\[code=?([^\]]*)?\]((?:.|\n)*?)\[\/code\]/ig, ($mc, $mc1 = '', $mc2) => "\n```"+$mc1+"\n"+$mc2+"\n```\n");
		
		// remove surrounding line breaks
		$text = trim($text, "\n");
		
		// split text into lines
		let $lines = explode("\n", $text);
		
		// iterate through lines to identify blocks
		return $this.linesElements($lines);
	}
	
	//
	// Setters
	//
	/* protected */ $this.urlsLinked = true;
	
	function setUrlsLinked($urlsLinked)
	{
		$this.urlsLinked = $urlsLinked;
		
		return $this;
	}
	
	/* protected */ $this.safeMode;
	
	function setSafeMode($safeMode)
	{
		$this.safeMode = $safeMode;
	
		return $this;
	}
	
	/* protected */ $this.strictMode;
	
	function setStrictMode($strictMode)
	{
		$this.strictMode = $strictMode;
	
		return $this;
	}
	
	/* protected */ $this.safeLinksWhitelist = array(
		'http://',
		'https://',
		'ftp://',
		'ftps://',
		'mailto:',
		'data:image/png;base64,',
		'data:image/gif;base64,',
		'data:image/jpeg;base64,',
		'irc:',
		'ircs:',
		'git:',
		'ssh:',
		'news:',
		'steam:'
	);
	
	//
	// Lines
	//
	/* protected */ $this.BlockTypes = {
		'*': array('List'),
		'-': array('Table'),
		'0': array('List'),
		'1': array('List'),
		'2': array('List'),
		'3': array('List'),
		'4': array('List'),
		'5': array('List'),
		'6': array('List'),
		'7': array('List'),
		'8': array('List'),
		'9': array('List'),
		':': array('Table'),
		'>': array('Quote'),
		'`': array('FencedCode'),
		'|': array('Table')
	};
	
	// ~
	/* protected */ $this.unmarkedBlockTypes = array(
		'Code'
	);
	
	//
	// Blocks
	//
	function lines($lines)
	{
		return $this.elements($this.linesElements($lines));
	}
	
	function linesElements($lines)
	{
		var $Elements = array();
		var $CurrentBlock = null;
		
		_2:
		for (let $line of $lines)
		{
			if (chop($line) === '')
			{
				if (isset($CurrentBlock))
				{
					switch($CurrentBlock['type'])
					{
						case 'Paragraph':
							$CurrentBlock['element']['elements'][0]['handler']['argument'] += "\n";
							break;
						case 'Table':
							$CurrentBlock['interrupted'] += 1;
							break;
						default:
							$CurrentBlock['interrupted'] = (isset($CurrentBlock['interrupted'])
								? $CurrentBlock['interrupted'] + 1 : 0
							);
					}
				}
				continue;
			}
			
			if (strpos($line, "\t") !== false)
			{
				let $parts = explode("\t", $line);
				
				$line = $parts[0];
				
				$parts.splice(0, 1);
				
				for (let $part of $parts)
				{
					let $shortage = 4 - $line.length % 4;
					
					$line += str_repeat(' ', $shortage);
					$line += $part;
				}
			}
			
			let $indent = 0;
			
			while (isset($line[$indent]) && $line[$indent] === ' ')
			{
				$indent++;
			}
			
			let $text = $indent > 0 ? substr($line, $indent) : $line;
			
			// ~
			let $Line = { 'body': $line, 'indent': $indent, 'text': $text };
			
			// ~
			let $Block;
			
			if ($CurrentBlock && isset($CurrentBlock['continuable']))
			{
				$Block = $this['block'+$CurrentBlock['type']+'Continue']($Line, $CurrentBlock);
				
				if (isset($Block))
				{
					$CurrentBlock = $Block;
					
					continue;
				}
				else
				{
					if ($this.isBlockCompletable($CurrentBlock['type']))
					{
						$CurrentBlock = $this['block'+$CurrentBlock['type']+'Complete']($CurrentBlock);
					}
				}
			}
			
			// ~
			let $marker = $text[0];
			
			// ~
			let $blockTypes = [];
			
			if (isset($this.BlockTypes[$marker]))
			{
				for (let $blockType of $this.BlockTypes[$marker])
				{
					$blockTypes.push( $blockType );
				}
			}
			
			// ~
			for (let $blockType of $blockTypes)
			{
				$Block = $this['block'+$blockType]($Line, $CurrentBlock);
				
				if (isset($Block))
				{
					if ($blockType === 'Table' && $Block['type'] === 'Paragraph' && isset($Block['interrupted'])) {
						$CurrentBlock = $Block;
						break;
					}
					
					$Block['type'] = $blockType;
					
					if (!isset($Block['identified']))
					{
						if (isset($CurrentBlock))
						{
							$Elements.push( $this.extractElement($CurrentBlock) );
						}
						
						$Block['identified'] = true;
					}
					
					if ($this.isBlockContinuable($blockType))
					{
						$Block['continuable'] = true;
					}
					
					$CurrentBlock = $Block;
					
					continue _2;
				}
			}
			
			// ~
			if (isset($CurrentBlock) && $CurrentBlock['type'] === 'Paragraph')
			{
				$Block = $this.paragraphContinue($Line, $CurrentBlock);
			}
			
			if (isset($Block))
			{
				$CurrentBlock = $Block;
			}
			else
			{
				if (isset($CurrentBlock))
				{
					$Elements.push( $this.extractElement($CurrentBlock) );
					$Line['text'] = str_repeat("\n", $CurrentBlock['interrupted']) + $Line['text'];
				}
				
				$CurrentBlock = $this.paragraph($Line);
				
				$CurrentBlock['identified'] = true;
			}
		}
		
		// ~
		if (isset($CurrentBlock['continuable']) && $this.isBlockCompletable($CurrentBlock['type']))
		{
			$CurrentBlock = $this['block'+$CurrentBlock['type']+'Complete']($CurrentBlock);
		}
		
		// ~
		if (isset($CurrentBlock))
		{
			$Elements.push( $this.extractElement($CurrentBlock) );
		}
		
		return $Elements;
	}
	
	function extractElement($Component)
	{
		if ( ! isset($Component['element']) && isset($Component['markup']))
		{
			$Component['element'] = { 'rawHtml': $Component['markup'] };
		}
		
		return $Component['element'];
	}
	
	function isBlockContinuable($Type)
	{
		return method_exists($this, 'block'+$Type+'Continue');
	}
	
	function isBlockCompletable($Type)
	{
		return method_exists($this, 'block'+$Type+'Complete');
	}
	
	//
	// Code
	//
	function blockCode($Line, $Block)
	{
		if (true || isset($Block) && $Block['type'] === 'Paragraph' && !isset($Block['interrupted']))
		{
			return;
		}
		
		if ($Line['indent'] >= 4)
		{
			const $text = substr($Line['body'], 4);
			
			const $Block = {
				'element': {
					'name': 'pre',
					'element': {
						'name': 'code',
						'text': $text
					}
				}
			};
			
			return $Block;
		}
	}
	
	function blockCodeContinue($Line, $Block)
	{
		if ($Line['indent'] >= 4)
		{
			if (isset($Block['interrupted']))
			{
				$Block['element']['element']['text'] += str_repeat("\n", $Block['interrupted']);
				
				delete $Block['interrupted'];
			}
			
			$Block['element']['element']['text'] += "\n";
			
			let $text = substr($Line['body'], 4);
			
			$Block['element']['element']['text'] += $text;
			
			return $Block;
		}
	}
	
	function blockCodeComplete($Block)
	{
		let $text = $Block['element']['element']['text'];
		
		$Block['element']['element']['text'] = $text;
		
		return $Block;
	}
	
	//
	// Fenced Code
	//
	function blockFencedCode($Line)
	{
		let $matches = [];
		let $marker  = $Line['text'][0];
		
		if (preg_match(new RegExp ('^(['+ $marker +']{3,})[ ]*([^`]+)?[ ]*$'), $Line['text'], $matches))
		{
			const $Element = {
				'name': 'code',
				'text': ''
			};
			
			const $Block = {
				'char': $marker,
				'openerLength': mb_strlen($matches[1]),
				'attributes': {
					'class': isset($matches[2]) ? "language-"+ $matches[2] : 'codehigh'
				},
				'element': {
					'name': 'pre',
					'element': $Element
				}
			};
			
			return $Block;
		}
	}
	
	function blockFencedCodeContinue($Line, $Block)
	{
		if (isset($Block['complete']))
		{
			return;
		}
		
		if (isset($Block['interrupted']))
		{
			$Block['element']['element']['text'] += str_repeat("\n", $Block['interrupted']);
			
			delete $Block['interrupted'];
		}
		
		let $matches = [];
		
		if (
			preg_match(new RegExp ('^(['+preg_quote($Block['char'])+']{3,})[ ]*$'), $Line['text'], $matches)
			&& mb_strlen($matches[1]) >= $Block['openerLength']
		) {
			$Block['element']['element']['text'] = substr($Block['element']['element']['text'], 1);
			
			$Block['complete'] = true;
			
			return $Block;
		}
		
		$Block['element']['element']['text'] += "\n"+$Line['body'];
		
		return $Block;
	}
	
	function blockFencedCodeComplete($Block)
	{
		let $text = $Block['element']['element']['text'];
		
		$Block['element']['element']['text'] = $text;
		
		return $Block;
	}
	
	//
	// List
	//
	function blockList($Line, $CurrentBlock)
	{
		let [$name, $pattern] = String.charCodeAt($Line['text'][0]) <= String.charCodeAt('-') ? array('ul', '[*+-]') : array('ol', '[0-9]{1,9}[.\)]');
		let $matches          = [];
		
		if (preg_match(new RegExp ('^('+$pattern+'([ ]+|$))(.*)'), $Line['text'], $matches))
		{
			let $contentIndent = strlen($matches[2]);
			
			if ($contentIndent >= 5)
			{
				$contentIndent -= 1;
				$matches[1] = substr($matches[1], 0, -$contentIndent);
				$matches[3] = str_repeat(' ', $contentIndent) + $matches[3];
			}
			else if ($contentIndent === 0)
			{
				$matches[1] += ' ';
			}
			
			const $Block = {
				'indent': $Line['indent'],
				'pattern': $pattern,
				'data': {
					'type': $name,
					'marker': $matches[1],
					'markerType': ($name === 'ul' ? strstr($matches[1], ' ', true) : substr(strstr($matches[1], ' ', true), -1))
				},
				'element': {
					'name': $name,
					'elements': array()
				}
			};
			
			if ($name === 'ol')
			{
				let $listStart = ltrim(strstr($matches[1], $Block['data']['markerType'], true), '0') || '0';
				
				if ($listStart !== '1')
				{
					$Block['element']['attributes'] = { 'start': $listStart };
				}
			}
			/*elseif ($Line['text'][0] !== '*')
			{
				$Block['element']['attributes'] = array( 'style' => "list-style-type: none; list-style-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='0 0 16 16' text-anchor='middle' alignment-baseline='central'><text x='8' y='8' font-size='20'>". $Line['text'][0] ."</text></svg>\");" );
			}*/
			
			$Block['li'] = {
				'name': 'li',
				'handler': {
					'function': 'li',
					'argument': !empty($matches[3]) ? array($matches[3]) : array(),
					'destination': 'elements'
				}
			};
			
			$Block['element']['elements'].push( $Block['li'] );
			
			return $Block;
		}
	}
	
	function blockListContinue($Line, $Block)
	{
		if (isset($Block['interrupted']) && empty($Block['li']['handler']['argument']))
		{
			return null;
		}
		
		let $requiredIndent = ($Block['indent'] + strlen($Block['data']['marker']));
		let $matches        = [];
		
		if ($Line['indent'] < $requiredIndent
			&& (
				(
					$Block['data']['type'] === 'ol'
					&& preg_match(new RegExp ('^[0-9]+'+preg_quote($Block['data']['markerType'])+'(?:[ ]+(.*)|$)'), $Line['text'], $matches)
				) || (
					$Block['data']['type'] === 'ul'
					&& preg_match(new RegExp ('^'+preg_quote($Block['data']['markerType'])+'(?:[ ]+(.*)|$)'), $Line['text'], $matches)
				)
			)
		) {
			if (isset($Block['interrupted']))
			{
				$Block['li']['handler']['argument'].push( '' );
				
				$Block['loose'] = true;
				
				delete $Block['interrupted'];
			}
			
			delete $Block['li'];
			
			let $text = isset($matches[1]) ? $matches[1] : '';
			
			$Block['indent'] = $Line['indent'];
			
			$Block['li'] = {
				'name': 'li',
				'handler': {
					'function': 'li',
					'argument': array($text),
					'destination': 'elements'
				}
			};
			
			$Block['element']['elements'].push( $Block['li'] );
			
			return $Block;
		}
		else if ($Line['indent'] < $requiredIndent && $this.blockList($Line))
		{
			return null;
		}
		
		if ($Line['indent'] >= $requiredIndent)
		{
			if (isset($Block['interrupted']))
			{
				$Block['li']['handler']['argument'].push( '' );
				
				$Block['loose'] = true;
				
				delete $Block['interrupted'];
			}
			
			let $text = substr($Line['body'], $requiredIndent);
			
			$Block['li']['handler']['argument'].push( $text );
			
			return $Block;
		}
		
		if (!isset($Block['interrupted']))
		{
			let $text = preg_replace(new RegExp ('^[ ]{0,'+$requiredIndent+'}'), '', $Line['body']);
			
			$Block['li']['handler']['argument'].push( $text );
			
			return $Block;
		}
	}
	
	function blockListComplete($Block)
	{
		if (isset($Block['loose']))
		{
			for (let $li of $Block['element']['elements'])
			{
				if (end($li['handler']['argument']) !== '')
				{
					$li['handler']['argument'].push( '' );
				}
			}
		}
		
		return $Block;
	}
	
	//
	// Quote
	//
	function blockQuote($Line)
	{
		let $matches = [];
		
		if (!preg_match($this.ReplyRegex, $Line['text']) && preg_match(/^(>(?:[> ]+)?)(.*)/, $Line['text'], $matches))
		{
			let $Quots = $matches[1].replace(/[\s\t\n\r\x00\x0B]+/g, '').length;
			
			return {
				'interrupted': 0,
				'element': {
					'name': 'div',
					'attributes': {
						'class': 'unkfunc'+ Math.min($Quots - 1, 5)
					},
					'handler': {
						'function': 'lineElements',
						'argument': str_repeat('&gt;', $Quots) + $matches[2],
						'destination': 'elements'
					}
				}
			};
		}
	}
	
	//
	// Table
	//
	function blockTable($Line, $Block = null)
	{
		if (!isset($Block) || $Block['type'] !== 'Paragraph' || isset($Block['interrupted']))
		{
			return;
		}
		
		let $header = $Block['element']['elements'][0]['handler']['argument'];
		
		if (
			strpos($header         , '|') === false
			&& strpos($Line['text'], '|') === false
			&& strpos($Line['text'], ':') === false
			|| strpos($header      , "\n")!== false
		) {
			$Block['interrupted'] = false;
			return $Block;
		}
		
		if (chop($Line['text'], ' -:|') !== '')
		{
			return;
		}
		
		let $alignments = array();
		
		let $divider = $Line['text'];
		
		$divider = trim($divider);
		$divider = trim($divider, '|');
		
		let $dividerCells = explode('|', $divider);
		
		for (let $dividerCell of $dividerCells)
		{
			$dividerCell = trim($dividerCell);
			
			if ($dividerCell === '')
			{
				return;
			}
			
			let $alignment = null;
			
			if ($dividerCell[0] === ':')
			{
				$alignment = 'left';
			}
			
			if (substr($dividerCell, -1) === ':')
			{
				$alignment = $alignment === 'left' ? 'center' : 'right';
			}
			
			$alignments.push( $alignment );
		}
		
		// ~
		let $HeaderElements = array();
		
		$header = trim($header);
		$header = trim($header, '|');
		
		let $headerCells = explode('|', $header);
		
		if (count($headerCells) !== count($alignments))
		{
			return;
		}
		
		for (let $index = 0; $index < $headerCells.length; $index++)
		{
			let $headerCell = trim($headerCells[$index]);
			
			let $HeaderElement = {
				'name': 'th',
				'handler': {
					'function': 'lineElements',
					'argument': $headerCell,
					'destination': 'elements'
				}
			};
			
			if (isset($alignments[$index]))
			{
				let $alignment = $alignments[$index];
				
				$HeaderElement['attributes'] = {
					'style': 'text-align: '+$alignment+';'
				};
			}
			
			$HeaderElements.push( $HeaderElement );
		}
		
		// ~
		$Block = {
			'alignments': $alignments,
			'identified': true,
			'element': {
				'name': 'table',
				'elements': array()
			}
		};
		
		$Block['element']['elements'].push({
			'name': 'thead',
			'elements': array()
		});
		
		$Block['element']['elements'].push({
			'name': 'tbody',
			'elements': array()
		});
		
		$Block['element']['elements'][0]['elements'].push({
			'name': 'tr',
			'elements': $HeaderElements
		});
		
		return $Block;
	}
	
	function blockTableContinue($Line, $Block)
	{
		if (isset($Block['interrupted']))
		{
			return;
		}
		
		if (count($Block['alignments']) === 1 || $Line['text'][0] === '|' || strpos($Line['text'], '|'))
		{
			let $Elements = array();
			let $matches  = [];
			
			let $row = $Line['text'];
			$row = trim($row);
			$row = trim($row, '|');
			
			preg_match(/(?:(\\\\[|])|[^|`]|`[^`]+`|`)+/g, $row, $matches);
			
			let $cells = array_slice($matches, 0, count($Block['alignments']));
			
			for (let $index = 0; $index < $cells.length; $index++)
			{
				let $cell = $cells[$index];
				
				let $Element = {
					'name': 'td',
					'handler': {
						'function': 'lineElements',
						'argument': trim($cell),
						'destination': 'elements'
					}
				};
				
				if (isset($Block['alignments'][$index]))
				{
					$Element['attributes'] = {
						'style': 'text-align: '+$Block['alignments'][$index]+';'
					};
				}
				
				$Elements.push( $Element );
			}
			
			let $Element = {
				'name': 'tr',
				'elements': $Elements
			};
			
			$Block['element']['elements'][1]['elements'].push( $Element );
			
			return $Block;
		}
	}
	
	//
	// Paragraph
	//
	function paragraph($Line)
	{
		return {
			'type': 'Paragraph',
			'element': {
				'elements': array(
					{//'name': 'p',
						'handler': {
							'function': 'lineElements',
							'argument': $Line['text'],
							'destination': 'elements'
						}
					},
					{ 'name': 'br' }
				)
			}
		};
	}
	
	function paragraphContinue($Line, $Block)
	{
		if (isset($Block['interrupted']))
		{
			return;
		}
		
		$Block['element']['elements'][0]['handler']['argument'] += "\n"+$Line['text'];
		
		return $Block;
	}
	
	//
	// Inline Elements
	//
	/* protected */ $this.InlineTypes = {
		'!': array('PonyabaMark'),
		'%': array('PonyabaMark'),
		'&': array('SpecialCharacter'),
		'*': array('Emphasis'),
		'#': array('Dice'),
		'[': array('Link', 'BBCode'),
		'`': array('Code'),
		':': array('Url'),
		'>': array('ReplyLink'),
		'^': array('Emphasis'),
		'\\': array('EscapeSequence')
	};
	
	// ~
	/* protected */ $this.inlineMarkerList = '!*&[:`%#^\\>';
	
	// ~
	function line($text, $nonNestables = [])
	{
		return $this.elements($this.lineElements($text, $nonNestables));
	}
	
	function lineElements($text, $nonNestables = [])
	{
		let $Elements = array();
		let $excerpt;
		
		// $excerpt is based on the first occurrence of a marker
		_2:
		while ($excerpt = strpbrk($text, $this.inlineMarkerList))
		{
			let $marker = $excerpt[0];
			
			let $markerPosition = strpos($text, $marker);
			
			let $Excerpt = { 'text': $excerpt, 'context': $text };
			
			for ( let $inlineType of $this.InlineTypes[$marker])
			{
				// check to see if the current inline type is nestable in the current context
				if ( ! empty($nonNestables) && in_array($inlineType, $nonNestables))
				{
					continue;
				}
				
				let $Inline = $this['inline'+$inlineType]($Excerpt);
				
				if ( ! isset($Inline))
				{
					continue;
				}
				
				// makes sure that the inline belongs to "our" marker
				if (isset($Inline['position']) && $Inline['position'] > $markerPosition)
				{
					continue;
				}
				
				// sets a default inline position
				if ( ! isset($Inline['position']))
				{
					$Inline['position'] = $markerPosition;
				}
				
				// cause the new element to 'inherit' our non nestables
				for (let $non_nestable of $nonNestables)
				{
					$Inline['element']['nonNestables'].push( $non_nestable );
				}
				
				// the text that comes before the inline
				let $unmarkedText = substr($text, 0, $Inline['position']);
				
				// compile the unmarked text
				let $InlineText = $this.inlineText($unmarkedText);
				$Elements.push( $InlineText['element'] );
				
				// compile the inline
				$Elements.push( $this.extractElement($Inline) );
				
				// remove the examined text
				$text = substr($text, $Inline['position'] + $Inline['extent']);
				
				continue _2;
			}
			
			// the marker does not belong to an inline
			let $unmarkedText = substr($text, 0, $markerPosition + 1);
			
			let $InlineText = $this.inlineText($unmarkedText);
			$Elements.push( $InlineText['element'] );
			
			$text = substr($text, $markerPosition + 1);
		}
		
		let $InlineText = $this.inlineText($text);
		$Elements.push( $InlineText['element'] );
		
		$Elements = array_map(
			function ($Element) {
				$Element['autobreak'] = isset($Element['autobreak'])
					? $Element['autobreak'] : false;
				return $Element;
			},
			$Elements
		);
		
		return $Elements;
	}
	
	// ~
	function inlineText($text)
	{
		return {
			'extent': strlen($text),
			'element': {
				'elements': pregReplaceElements(
					/[ ]*\n/,
					array(
						{'name': 'br'},
						{'text': "\n"}
					),
					$text
				)
			}
		};
	}
	
	//
	// Code
	//
	function inlineCode($Excerpt)
	{
		let $marker  = $Excerpt['text'][0];
		let $matches = [];
		
		if (preg_match(new RegExp ("^("+$marker+"+)[ ]*(.+?[ ]*"+$marker+"*?)\\1(?!"+$marker+")"), $Excerpt['text'], $matches))
		{
			let $text = $matches[2];
			
			return {
				'extent': strlen($matches[0]),
				'element': {
					'name': 'code',
					'text': preg_replace(/[ ]*\n/, ' ', $text)
				}
			};
		}
	}
	
	//
	// Dice
	//
	function inlineDice($Excerpt)
	{
		if ( ! isset($Excerpt['text'][1]))
		{
			return;
		}
		
		let $marker  = $Excerpt['text'][0];
		let $matches = [];
	
		if ($Excerpt['text'][1] === $marker && preg_match(/##([0-9]+)d([0-9]+)##/, $Excerpt['text'], $matches))
		{
			if ( $matches[1] == 0 || $matches[2] == 0 )
			{
				var $result = "Прекрати! Я так могу сломаться. "+ $matches[0];
			}
			else if ( $matches[1] > 100 || $matches[2] > 2000)
			{
				var $result = "Я, конечно, умна, но не настолько! "+ $matches[0];
			}
			else
			{
				var $result = $matches[1]+"d"+$matches[2]+" (?) = ?";
			}
			return {
				'extent': strlen($matches[0]),
				'element': {
					'name': 'span',
					'attributes': { 'class': 'dice' },
					'text': $result
				}
			};
		}
	}
	
	//
	// PonyabaMark
	//
	/* protected */ $this.CutieMark = { '%': 'spoiler', '!': 'rcv', '*': 'bi', '^': array('u', 'del') };
	
	function inlinePonyabaMark($Excerpt)
	{
		if ( ! isset($Excerpt['text'][1]))
		{
			return;
		}
		
		let $marker  = $Excerpt['text'][0];
		let $matches = [];
		
		if ($Excerpt['text'][1] === $marker && preg_match(
			new RegExp ("^["+$marker+"]{2}((?:\\\\"+$marker+"|[^"+$marker+"]|["+$marker+"][^"+$marker+"]*)+?)["+$marker+"]{2}(?!["+$marker+"])", "u"), $Excerpt['text'], $matches
		))
		{
			return {
				'extent': strlen($matches[0]),
				'element': {
					'name': 'span',
					'attributes': { 'class': $this.CutieMark[$marker] },
					'handler': {
						'function': 'lineElements',
						'argument': $matches[1],
						'destination': 'elements'
					}
				}
			};
		}
	}

	function inlineEmphasis($Excerpt)
	{
		if ( ! isset($Excerpt['text'][1]))
		{
			return;
		}
		
		let $marker  = $Excerpt['text'][0];
		let $matches = [];
		
		if ($Excerpt['text'][1] === $marker && preg_match(
			new RegExp ("^\\"+$marker+"{2}((?:\\\\\\"+$marker+"|[^"+$marker+"]|[\\"+$marker+"][^"+$marker+"]*\\"+$marker+")+?)\\"+$marker+"{2}(?!\\"+$marker+")", "u"), $Excerpt['text'], $matches))
		{
			var $emphasis = $this.CutieMark[$marker][0];
		}
		else if (preg_match(
			new RegExp ("^\\"+$marker+"((?:\\\\\\"+$marker+"|[^"+$marker+"]|[\\"+$marker+"][^"+$marker+"]*\\"+$marker+")+?)\\"+$marker+"(?!\\"+$marker+")", "u"), $Excerpt['text'], $matches))
		{
			var $emphasis = $this.CutieMark[$marker][1];
		}
		else
		{
			return;
		}
		
		return {
			'extent': strlen($matches[0]),
			'element': {
				'name': $emphasis,
				'handler': {
					'function': 'lineElements',
					'argument': $matches[1],
					'destination': 'elements'
				}
			}
		};
	}
	
	//
	// ReplyLink
	//
	/* protected */ $this.ReplyRegex = /^>>(?:\/?([a-z]+)\/)?([0-9]+)/;
	
	function inlineReplyLink($Excerpt)
	{
		let $matches = [];
		
		if ($Excerpt['text'][1] === '>' && preg_match($this.ReplyRegex, $Excerpt['text'], $matches))
		{
			let $Element = {
				'extent': strlen($matches[0]),
				'element': {
					'name': 'a',
					'handler': {
						'function': 'lineElements',
						'argument': htmlspecialchars($matches[0]),
						'destination': 'elements'
					},
					'attributes': {
						'href': "javascript:void(0);"
					}
				}
			};
			
			return $Element;
		}
	}
	
	//
	// MarkdownLink
	//
	function inlineLink($Excerpt)
	{
		let $Element = {
			'name': 'a',
			'handler': {
				'function': 'lineElements',
				'argument': null,
				'destination': 'elements'
			},
			'nonNestables': array('Url', 'Link'),
			'attributes': {
				'href': null,
				'title': null
			}
		};
		
		let $remainder = $Excerpt['text'];
		let $extent    = 0;
		let $matches   = [];
		
		if (preg_match(/\[((?:[^\]\[]+)*)\]/, $remainder, $matches))
		{
			$Element['handler']['argument'] = $matches[1];
			
			$extent   += strlen($matches[0]);
			$remainder = substr($remainder, $extent);
		}
		else
		{
			return;
		}
		
		if (preg_match(/^[(]\s*((?:[^ ()]+|[(][^ )]+[)])+)(?:[ ]+("[^"]*"|\'[^\']*\'))?\s*[)]/, $remainder, ($matches = [])))
		{
			$Element['attributes']['href'] = $matches[1];
			
			if (isset($matches[2]))
			{
				$Element['attributes']['title'] = substr($matches[2], 1, - 1);
			}
			
			$extent += strlen($matches[0]);
		}
		else
		{
			let $definition, $matches = [];
			
			if (preg_match(/^\s*\[(.*?)\]/, $remainder, $matches))
			{
				$definition = strlen($matches[1]) ? $matches[1] : $Element['handler']['argument'];
				$definition = strtolower($definition);
				$extent    += strlen($matches[0]);
			}
			else
			{
				$definition = strtolower($Element['handler']['argument']);
			}
			
			if ( ! isset($this.DefinitionData['Reference'][$definition]))
			{
				return;
			}
			
			$Definition = $this.DefinitionData['Reference'][$definition];
			
			$Element['attributes']['href']  = $Definition['url'];
			$Element['attributes']['title'] = $Definition['title'];
		}
		
		if (preg_match($this.ponyach_preg, $Element['attributes']['href'], ($matches = [])))
		{
			$Element['attributes']['href'] = $matches[1];
		}
		
		return {
			'extent' : $extent,
			'element': $Element
		};
	}
	
	/* protected */ $this.OpenedBBTags;
	
	/* protected */ $this.ClosedBBTags;
	
	/* protected */ $this.BBTypes = 'b|i|s|u|rp|sup|sub|spoiler|code';
	
	//
	// BBCode
	//
	function inlineBBCode($Excerpt)
	{
		let $matches = [];
		
		if (preg_match(new RegExp ("^\\[(?:("+$this.BBTypes+")(?:=([^\\]]*))?|\\/("+$this.BBTypes+"))\\]", "u"), $Excerpt['text'], $matches))
		{
			let $offset = strlen($matches[0]);
			let $closed = isset($matches[3]);
			
			let $Block = {
				'extent': $offset,
				'element': {}
			};
			
			let $name, $text = substr($Excerpt['text'], $offset);
			
			if (!$closed)
			{
				$name   = $matches[1];
				$offset = strpos($text, "[/"+$name+"]")
				
				if ($offset !== false) {
					
					$text = substr($text, 0, $offset);
					
					if (preg_match(/^[ \n]*$/, $text))
					{
						$Block['element']['text'] = $name === 'u' ? str_replace(' ', '_', $text) : ($name === 's' ? str_replace(' ', '‒', $text) : $text);
					}
					else
					{
						$Block['element']['name'] = $name === 's' ? 'del' : $name;
					
						switch ($name)
						{
							case 'code':
								$Block['element']['text'] = $text;
								$Block['element']['attributes'] = { 'class': 'codeline' };
								break;
							case 'spoiler':
								$Block['element']['name'] = 'span';
								$Block['element']['attributes'] = { 'class': $name };
							default:
								$Block['element']['handler'] = {
									'function': 'lineElements',
									'argument': $text,
									'destination': 'elements'
								};
						}
					}
				
					$Block['extent'] += $offset + 3 + strlen($name);
					
					return $Block;
				}
			}
			else
			{
				$name = $matches[3];
			}
			
			let $Element = {
				'search': $matches[0],
				'name': $name
			};
			
			if ($closed)
			{
				$Element['tag'] = '</'+ ($name === 's' ? 'del' : $name === 'spoiler' ? 'span' : $name) +'>';
				($this.ClosedBBTags[$name] || ($this.ClosedBBTags[$name] = [])).push( $Element );
			}
			else {
				$Element['tag'] = '<' + ($name === 's' ? 'del' : $name === 'spoiler' ? 'span class="spoiler"' : $name) +'>';
				$this.OpenedBBTags.push( $Element );
			}
			
			$Block['element']['text'] = $matches[0];
			
			return $Block;
		}
	}
	
	//
	// Automatic Url Linker
	//
	/* protected */ $this.ponyach_preg = /^https?:\/\/(?:www\.)?pony(?:ach\.(?:ru|ga|ml|ch)|chan\.ru|a\.ch)(\/([a-z0-9]+)\/res\/(005|050)?([0-9]+)\.html(?:#([0-9]+))?)$/;
	
	function inlineUrl($Excerpt)
	{
		if ($this.urlsLinked !== true || !isset($Excerpt['text'][2]) || $Excerpt['text'][2] !== '/')
		{
			return;
		}
		
		let $matches = [];
		
		if (preg_match(/\bhttps?:[\/]{2}[^\s<]+\b\/*/ui, $Excerpt['context'], $matches, 'PREG_OFFSET_CAPTURE'))
		{
			let $href = rawurldecode( $matches[0][0] );
			
			let $Link = {
				'name': 'a',
				'text': $href,
				'attributes': {
					'href': $href
				}
			};
			
			let $uri = [];
			
			if (preg_match($this.ponyach_preg, $href, $uri))
			{
				$Link['text'] = ">>"+$uri[2]+"/"+ (!$uri[5] ? $uri[4] : $uri[5]);
				
				$Link['attributes']['class'] = "ref|"+$uri[2]+"|"+$uri[4]+"|"+$uri[5];
				$Link['attributes']['href']  = $uri[1];
			}
			else if (mb_strlen($href) - 68 > 3)
			{
				$Link['text'] = mb_substr($href, 0, 50) +'...'+ mb_substr($href, -17);
			}
			
			return {
				'extent': strlen( $matches[0][0] ),
				'position': $matches[0][1],
				'element': $Link
			};
		}
	}
	
	function inlineSpecialCharacter($Excerpt)
	{
		let $matches = [];
		
		if (preg_match(/^&(#?[0-9a-zA-Z]+);/, $Excerpt['text'], $matches))
		{
			return {
				'element': { 'rawHtml': '&'+$matches[1]+';' },
				'extent': strlen($matches[0])
			};
		}
	}
	
	function inlineEscapeSequence($Excerpt)
	{
		if (isset($Excerpt['text'][1]) && in_array($Excerpt['text'][1], $this.specialCharacters))
		{
			return {
				'element': {'rawHtml': $Excerpt['text'][1] },
				'extent': 2
			};
		}
	}
	
	// ~
	function unmarkedText($text)
	{
		let $Inline = $this.inlineText($text);
		return $this.element($Inline['element']);
	}
	
	//
	// Handlers
	//
	function handle($Element)
	{
		if (isset($Element['handler']))
		{
			if (!isset($Element['nonNestables']))
			{
				$Element['nonNestables'] = array();
			}
			
			if (is_string($Element['handler']))
			{
				var $function = $Element['handler'];
				var $argument = $Element['text'];
				delete $Element['text'];
				var $destination = 'rawHtml';
			}
			else
			{
				var $function = $Element['handler']['function'];
				var $argument = $Element['handler']['argument'];
				var $destination = $Element['handler']['destination'];
			}
			
			$Element[$destination] = $this[$function]($argument, $Element['nonNestables']);
			
			if ($destination === 'handler')
			{
				$Element = $this.handle($Element);
			}
		}
		
		delete $Element['handler'];
		
		return $Element;
	}
	
	function handleElementRecursive( $Element)
	{
		return $this.elementApplyRecursive($this.handle, $Element);
	}
	
	function handleElementsRecursive( $Elements)
	{
		return $this.elementsApplyRecursive($this.handle, $Elements);
	}
	
	function elementApplyRecursive($closure, $Element)
	{
		$Element = call_user_func($closure, $Element);
		
		if (isset($Element['elements']))
		{
			$Element['elements'] = $this.elementsApplyRecursive($closure, $Element['elements']);
		}
		else if (isset($Element['element']))
		{
			$Element['element'] = $this.elementApplyRecursive($closure, $Element['element']);
		}
		
		return $Element;
	}
	
	function elementApplyRecursiveDepthFirst($closure, $Element)
	{
		if (isset($Element['elements']))
		{
			$Element['elements'] = $this.elementsApplyRecursiveDepthFirst($closure, $Element['elements']);
		}
		else if (isset($Element['element']))
		{
			$Element['element'] = $this.elementsApplyRecursiveDepthFirst($closure, $Element['element']);
		}
		
		$Element = call_user_func($closure, $Element);
		
		return $Element;
	}
	
	function elementsApplyRecursive($closure, $Elements)
	{
		for (let $Element of $Elements)
		{
			$Element = $this.elementApplyRecursive($closure, $Element);
		}
		
		return $Elements;
	}
	
	function elementsApplyRecursiveDepthFirst($closure, $Elements)
	{
		for (let $Element of $Elements)
		{
			$Element = $this.elementApplyRecursiveDepthFirst($closure, $Element);
		}
		
		return $Elements;
	}
	
	function element($Element)
	{
		if ($this.safeMode)
		{
			$Element = $this.sanitiseElement($Element);
		}
		
		// identity map if element has no handler
		$Element = $this.handle($Element);
		
		let $hasName = isset($Element['name']);
		let $markup  = '';
		
		if ($hasName)
		{
			$markup += '<'+$Element['name'];
			
			if (isset($Element['attributes']))
			{
				for (let $name in $Element['attributes'])
				{
					let $value = $Element['attributes'][$name];
					
					if ($value === null)
					{
						continue;
					}
					
					$markup += ' '+$name+'="'+escape($value)+'"';
				}
			}
		}
		
		let $permitRawHtml = false;
		let $text;
		
		if (isset($Element['text']))
		{
			$text = $Element['text'];
		}
		// very strongly consider an alternative if you're writing an extension
		else if (isset($Element['rawHtml']))
		{
			$text = $Element['rawHtml'];
			
			let $allowRawHtmlInSafeMode = isset($Element['allowRawHtmlInSafeMode']) && $Element['allowRawHtmlInSafeMode'];
			$permitRawHtml = !$this.safeMode || $allowRawHtmlInSafeMode;
		}
		
		let $hasContent = isset($text) || isset($Element['element']) || isset($Element['elements']);
		
		if ($hasContent)
		{
			$markup += $hasName ? '>' : '';
			
			if (isset($Element['elements']))
			{
				$markup += $this.elements($Element['elements']);
			}
			else if (isset($Element['element']))
			{
				$markup += $this.element($Element['element']);
			}
			else
			{
				$markup += (!$permitRawHtml ? escape($text, true) : $text);
			}
			
			$markup += $hasName ? '</'+$Element['name']+'>' : '';
		}
		else if ($hasName)
		{
			$markup += ' />';
		}
		
		return $markup;
	}
	
	function elements($Elements)
	{
		let $markup = '';
		
		let $autoBreak = true;
		
		for (let $Element of $Elements)
		{
			if (empty($Element))
			{
				continue;
			}
			
			let $autoBreakNext = (isset($Element['autobreak']) && $Element['autobreak']
				|| ! isset($Element['autobreak']) && isset($Element['name'])
			);
			// (autobreak === false) covers both sides of an element
			$autoBreak = !$autoBreak ? $autoBreak : $autoBreakNext;
			
			$markup += ($autoBreak ? "\n" : '') + $this.element($Element);
			$autoBreak = $autoBreakNext;
		}
		
		$markup += $autoBreak ? "\n" : '';
		
		return $markup;
	}
	
	// ~
	function li($lines)
	{
		let $Elements = $this.linesElements($lines);
		
		if ( ! in_array('', $lines)
			&& isset($Elements[0]) && isset($Elements[0]['name'])
			&& $Elements[0]['name'] === 'p'
		) {
			delete $Elements[0]['name'];
		}
		
		return $Elements;
	}
	
	function globalBBTags($text)
	{
		let $Segments = [];
		let $index    = 0;
		
		_2:
		for (let $open of $this.OpenedBBTags)
		{
			let $on     = $open['name'];
			let $offset = strpos($text, $open['search'], $index);
			
			array_push( $Segments, substr($text, $index, $offset - $index) );
			
			$offset += strlen( $open['search'] );
			$index   = $offset;
			
			if (isset($this.ClosedBBTags[$on])) {
			
				for (let $i = 0, $len = count($this.ClosedBBTags[$on]); $i < $len; $i++)
				{
					let $close    = $this.ClosedBBTags[$on][$i];
					let $position = strpos($text, $close['search'], $offset);
					
					if ($position !== false) {
						
						array_push( $Segments, $open['tag'] );
						
						$text = substr($text, 0, $position) + $close['tag'] + substr($text, $position + strlen($close['search']));
						
						array_splice( $this.ClosedBBTags[$on], $i, 1 );
						
						continue _2;
					}
				}
			}
			
			array_push( $Segments,  $open['search'] );
		}
		
		return $index > 0 ? join('', $Segments) + substr($text, $index) : $text;
	}
	
	//
	// AST Convenience
	//
	
	/**
	 * Replace occurrences $regexp with $Elements in $text. Return an array of
	 * elements representing the replacement.
	 */
	function pregReplaceElements($regexp, $Elements, $text)
	{
		let $newElements = array();
		let $matches;
		
		while (preg_match($regexp, $text, ($matches = []), 'PREG_OFFSET_CAPTURE'))
		{
			let $offset = $matches[0][1];
			let $before = substr($text, 0, $offset);
			let $after = substr($text, $offset + strlen($matches[0][0]));
			
			$newElements.push({ 'text': $before });
			
			for (let $Element of $Elements)
			{
				$newElements.push( $Element );
			}
			
			$text = $after;
		}
		
		$newElements.push({ 'text': $text });
		
		return $newElements;
	}
	
	function sanitiseElement($Element)
	{
		const $safeUrlNameToAtt = {
			'a'  : 'href',
			'img': 'src'
		};
		
		if (!isset($Element['name']))
		{
			delete $Element['attributes'];
			return $Element;
		}
		
		if (isset($safeUrlNameToAtt[$Element['name']]))
		{
			$Element = $this.filterUnsafeUrlInAttribute($Element, $safeUrlNameToAtt[$Element['name']]);
		}
		
		if (!empty($Element['attributes']))
		{
			for (let $att in $Element['attributes'])
			{
				// filter out badly parsed attribute
				if (!preg_match(/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/, $att))
				{
					delete $Element['attributes'][$att];
				}
				// dump onevent attribute
				else if (striAtStart($att, 'on'))
				{
					delete $Element['attributes'][$att];
				}
			}
		}
		
		return $Element;
	}
	
	function filterUnsafeUrlInAttribute($Element, $attribute)
	{
		for (let $scheme of $this.safeLinksWhitelist)
		{
			if (striAtStart($Element['attributes'][$attribute], $scheme))
			{
				return $Element;
			}
		}
		
		$Element['attributes'][$attribute] = str_replace(':', '%3A', $Element['attributes'][$attribute]);
		
		return $Element;
	}
	
	//
	// Static Methods
	//
	function escape($text, $allowQuotes)
	{
		return htmlspecialchars($text, $allowQuotes ? 'ENT_NOQUOTES' : 'ENT_QUOTES', 'UTF-8');
	}
	
	function striAtStart($string, $needle)
	{
		$len = strlen($needle);
		
		if ($len > strlen($string))
		{
			return false;
		}
		else
		{
			return strtolower(substr($string, 0, $len)) === strtolower($needle);
		}
	}
	
	//
	// Fields
	//
	/* protected */ $this.DefinitionData;
	
	//
	// Read-Only
	//
	/* protected */ $this.specialCharacters = array(
		'\\', '`', '*', '_', '{', '}', '[', ']', '(', ')', '>', '#', '+', '-', '.', '!', '|',
	);
};
