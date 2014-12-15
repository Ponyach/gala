/* 
			«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 1.2.88
								© magicode
	
*/
var style = $setup('style', {'text': 'blockquote:after, #de-txt-panel:after, .de-menu.de-imgmenu:after{content:"";-webkit-animation:init 1s linear 2;animation:init 1s linear 2}\
.de-video-obj,.postcontent{position:relative;display:inline-block!important}.cm-link{cursor:pointer;margin:0 4px}.cm-link:before{content:"";margin-left:20px}\
.markup-button.text:after{content:" | "}#quote.markup-button.text:after{content:""}.refOnly:after{content:"Конвертируемые в рефлинки"}.justPlayers:after{content:"Содержащие плееры"}.All:after{content:"Все имеющиеся"}\
.document-container,.content-frame.document{overflow:auto;resize:both;background-color:#fefefe} .document-container > iframe, .full-size, #shadow-box, .content-window{width:100%;height:100%}\
.webm, .video-container{display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2}\
.audio-container{margin:5px 0;position:relative;cursor:pointer;z-index:2}.img-container{display:inline-block}.ta-inact::-moz-selection{background:rgba(99,99,99,.3)}.ta-inact::selection{background:rgba(99,99,99,.3)}\
.markup-button a{font-size:13px;text-decoration:none}span[de-bb]{position:absolute;visibility:hidden}.de-src-derpibooru:before{content:"";padding:0 16px 0 0;margin:0 4px;background-image:url(/test/src/140903588031.png)}\
#hide-buttons-panel > .menubuttons {width: 40px;margin: 0 2px}#vsize-textbox{font-family:monospace;opacity:.6}input[type="range"]{border:0!important;background:none!important}\
.content-window{position:fixed;left:0;top:0;z-index:2999}#shadow-box{position:absolute;background-color:rgba(33, 33, 33, .8);z-index:2999}\
.content-frame{background-color:#fefefe}.content-frame.video{background-color:#000}.content-frame.img{position:background-color:transparent}\
.hidup{top:-9999px!important}.hidout{display:none!important}.content-frame{position:absolute;top:10%;left:12%;right:18%;bottom:20%;box-shadow:5px 5px 10px rgba(0,0,0,.4);z-index:3000}\
#close-content-window,#show-content-window{transition:.5s ease;opacity:.4;width:29px;height:29px;background-image:url(/test/src/141665751261.png);cursor:pointer;position:absolute;top:20px;right:20px;z-index:3000}\
#show-content-window{right:52%;position:fixed;background-image:url(/test/src/141667895174.png);border-radius:100%;box-shadow:0 1px 0 rgba(0,0,0,.4),-1px 1px 0 rgba(0,0,0,.4)}#close-content-window:hover,#show-content-window:hover{opacity:.8}\
.navbar-nav,.dropdown-menu{padding-left:0;list-style:outside none none}.dropdown-toggle:before{content:" ▼ ";padding-right:8px}.dropdown-menu span{padding:0 40px}.dropdown-toggle{display:table;padding:2px 8px;border:1px solid #33B5E5;border-radius:2px;}\
.ins-act,.dropdown-menu{display:table;border:1px solid #222;box-shadow:0 6px 12px rgba(0,0,0,.2);background-clip:padding-box;background-color:#222;}.ins-act{border-radius:4px 4px 0 0}.dropdown-menu{border-radius:0 4px 4px 4px}.navbar-nav span{cursor:pointer}\
.dropdown-menu {color:#eee;position:absolute;z-index:1000;min-width:160px;font-size:14px;line-height:1.8;}.dropdown-menu li:hover{color:#FFF;background:#555;-moz-user-select:none;transition:#6363CE .2s ease,color .2s ease}\
.dropdown-toggle:hover{background:#1c96c3;color:#000}.dropdown-toggle.ins-act{color:#33B5E5}.dropdown-toggle.ins-act:hover{background:#222}\
@keyframes init{50% {opacity:0}} @-webkit-keyframes init{50% {opacity:0}}'}, null);
document.head.appendChild(style);

/*-----[ Utilites ]-----*/
function $each(obj, Fn){
	Array.prototype.slice.call(obj, 0).forEach(Fn)
}
function $setup(obj, attr, events) {
	var el = typeof obj == "string" ? document.createElement(obj) : obj;
	if (attr) {
		for (var key in attr) {
			attr[key] === undefined ? el.removeAttribute(key) :
			key === 'html' ? el.innerHTML = attr[key] :
			key === 'text' ? el.textContent = attr[key] :
			key === 'value' ? el.value = attr[key] :
			el.setAttribute(key, attr[key]);
		}
	}
	if (events) {
		for (var key in events) {
			el.addEventListener(key, events[key], false);
		}
	}
	return el;
}
function $placeNode(p, el, node) {
	var i, To, In = el.parentNode;
	if (p === 'append') {
		for (i = 0, len = node.length; i < len; i++) {
			if (node[i])
				el.appendChild(node[i]);
		}
	} else if (p === 'remove') {
		$each(el, function(node) {
			node.parentNode.removeChild(node);
		});
	} else if (p === 'replace') {
		In.replaceChild(node, el);
	} else {
		if (p === 'after') To = el.nextSibling;
		if (p === 'before') To = el;
		if (p === 'prepend') To = el.childNodes[0], In = el;
		In.insertBefore(node, To);
	}
}
function jumpCont(node) {
	while (node) {
		if (node.tagName === 'BLOCKQUOTE') {
			if (!node.parentNode.querySelector('.postcontent'))
				node.insertAdjacentHTML('beforebegin', '<span class="postcontent"></span>')
			return node.parentNode.querySelector('.postcontent');
		}
		node = node.parentNode;
	}
}
function setlSValue(name, value, sess) {
	var stor = sess ? sessionStorage : localStorage;
	if (typeof name === "object") {
		for (var key in name) {
			stor.setItem(key, (name[key] === null ? value : name[key]));
		}
	} else {
		stor.setItem(name, value);
	}
}
function getlSValue(name, def, sess) {
	var stor = sess ? sessionStorage : localStorage;
	if (name in stor) {
		var v = stor.getItem(name);
		v = v == 'false' ? false : 
			v == 'true' ? true : v;
		return v;
	} else {
		stor.setItem(name, def);
		return def;
	}
}
function getDataResponse(uri, Fn) {
	var xhReq = new XMLHttpRequest();
	xhReq.open('GET', uri, true);
	xhReq.send(null);
	xhReq.onreadystatechange = function() {
		if(xhReq.readyState !== 4)
			return;
		if(xhReq.status === 304) {
			alert('304 ' + xhReq.statusText);
		} else {
			try {
				var json = JSON.parse(xhReq.responseText);
			} catch(e) {
				Fn(1, e.toString(), null, this);
			} finally {
				Fn(xhReq.status, xhReq.statusText, (!json ? xhReq.responseText : json), this);
				Fn = null;
			}
		}
	}
}
String.prototype.allReplace = function(obj, r) {
	var retStr = this;
	for (var x in obj) {
		retStr = retStr.replace((r ? x : new RegExp(x, 'g')), obj[x]);
	}
	return retStr;
}
//-- Get Page name from Url
function getPageName(url) {
	var a = url.split('/'), p = a.pop();
	return decodeURIComponent((!p ? a.pop() : p));
}
//-- Replace special characters from text
function escapeHtml(text) {
	return text.allReplace({'\"': "&#34;", '\'': "&#39;", '\<': "&lt;", '\>': "&gt;"});
}
//-- Remove Zero whitespaces and invalid characters (like ") from Url Links
function escapeUrl(url) {
	var eUrl = encodeURI(url).allReplace({'%2?5?E2%2?5?80%2?5?8B': '', '%2?5?3C/?\\w*%2?5?3E': '', '%2?5?22': ''});
	return decodeURI(eUrl);
}
//-- Convert UTF8 charcodes to symbols
function escapeUChar(char) {
	return char.allReplace({'U+0021': '!', 'U+0022': '"', 'U+0025': '%', 'U+0028': '(', 'U+002A': '*', 'U+0033': '#', 'U+003E': '>', 'U+005C': '\\', 'U+005E': '^'}, true);
}
//-- Get host name {getLocation(url).hostname} and path name {getLocation(url).pathname} from Url Links
function getLocation(url) {
	return $setup('a', {'rel': 'nofollow', 'href': url});
}
//-- Universal Imageboard Url Parser
function parseUrl(url) {
	m = (url || document.location.href).match(/(?:https?:\/\/([^\/]+))?\/([^\/]+)\/(?:(\d+)|res\/(\d+)|(\w+))(?:\.x?html)?(#i?(\d+))?/);
	return m ? {host: m[1], board: m[2], page: m[3], thread: m[4], desk: m[5], pointer: m[6], pid: m[7]} : {};
}
//-- Derpibooroo Reverse Search 
function revSearch(imgSrc) {
	var form = $setup('form', {'method': "post", 'action': "https://derpibooru.org/search/reverse", 'target': "_blank", 'enctype': "multipart/form-data", 'hidden': "",
		'html': '<input id="url" name="url" type="text" value="'+ imgSrc +'"><input id="fuzziness" name="fuzziness" type="text" value="0.25">'}, null);
	document.body.appendChild(form).submit();
	return form.remove();
}

(function() {
	var Gala = {
		MC: ['windowFrame', 'postContent'].indexOf(getlSValue('EmbedIn', 'postContent')),
		deCfg: JSON.parse(getlSValue('DESU_Config'))[window.location.host],
		Embeds: getlSValue('EmbedLinks', 'All'),
		VActive: [],
		LastKey: null,
		LinksMap: JSON.parse(getlSValue('LinksCache', '{}', true)),
		URL: parseUrl()},
	KeyCodes = {
		symbs: ['"', '^', '*', '(', '\\'],
		doubs: ['!', '#', '%'],
		quots: ['@', '>'],
		specl: [8, 86]},
	textArea, contentFrame = $setup('div', {'class': 'content-window hidup', 'html':
		'<div id="shadow-box"></div><label id="close-content-window"></label>'}, {
		'click': function(e) {
			var et = e.target, hide = et.id === 'shadow-box', 
				close = et.id === 'close-content-window';
			if (close || hide) contentFrame.classList.add('hidup');
			if (hide) contMarker.classList.remove('hidout');
			if (close) {
				et.nextElementSibling.remove();
				Gala.VActive = [];
			}
		}
	}),
	contMarker = $setup('label', {'id': 'show-content-window', 'class': 'hidout'}, {
		'click': function(e) {
			contentFrame.classList.remove('hidup');
			this.classList.add('hidout');
		}
	});
	
/*-----[ GLOBAL Functions ]-----*/
	addGalaSettings = function() {
		return '<table><tbody><tr><td>Скрывать кнопки разметки:</td><td id="hide-buttons-panel">'+ addMarkupButtons('menu') +
		'<span class="menubuttons"><label><input onclick="setupOption(this, \'KeyMarks\')" '+ (!getlSValue('KeyMarks', true) ? '' : 'checked') +
		' type="checkbox" name="set_km" value=""><span title="Вкл/Выкл Gala KeyMarks &middot; % ^ * ( &quot; @ &#92; ! # &gt;">&Xi;</span></label></span>'+
		'</td></tr><tr><td>Обробатывать ссылки:</td><td><ul class="nav navbar-nav" onclick="setPMode(event)"><li class="dropdown"><span class="dropdown-toggle '+
			Gala.Embeds +'"></span><ul class="dropdown-menu hidout"><li><span class="set refOnly"></span></li><li><span class="set justPlayers"></span></li><li><span class="set All"></span></li></ul></li></ul></td></tr>'+
		'<tr><td>Положение видеоплеера:</td><td><span onchange="placeMedia(event)"><input name="cont_p" value="windowFrame" type="radio" '+
			(Gala.MC == 0 ? 'checked' : '') +'>\nВ окне\n<input name="cont_p" value="postContent" type="radio" '+
			(Gala.MC == 1 ? 'checked' : '') +'>\nВ посте</span>\n<label class="vsset'+ (Gala.MC == 0 ? ' hidout' : '') +'"><input onchange="setVSize(this)" min="1" value="'+
			getVSize('value') +'" step="1" max="4" type="range" name="v_size"><span id="vsize-textbox">('+ getVSize('text') +')</span></label></td></tr></tbody></table>';
	}
	hideMarkupButton = function(e) {
		var val = e.value, x = document.getElementById(val);
		if (getlSValue(val)) {
			if (x) x.setAttribute('hidden', '');
			setlSValue(val, false);
		} else {
			if (x) x.removeAttribute('hidden');
			setlSValue(val, true);
		}
	}
	placeMedia = function(e) {
		var val = e.target.value, cont = Gala.VActive[1],
			vsset = e.target.parentNode.nextElementSibling;
		if (val === 'postContent') { Gala.MC = 1;
			vsset.classList.remove('hidout');
			if (cont) {
				$placeNode('prepend', jumpCont(Gala.VActive[0]), $setup(cont, {'class': 'video-container', 'id': 'video_'+cont.id.split('_')[1]}, null));
				$setup(cont.firstChild, {'class': '', 'width': getVSize('w'), 'height': getVSize('h')}, null);
				contMarker.classList.add('hidout');
				contentFrame.classList.add('hidup');
			}
		}
		if (val === 'windowFrame') { Gala.MC = 0;
			vsset.classList.add('hidout');
			if (cont) {
				contentFrame.appendChild($setup(cont, {'class': 'content-frame video', 'id': 'content_'+cont.id.split('_')[1]}, null));
				$setup(cont.firstChild, {'width':'100%', 'height': '100%'}, null);
				contMarker.classList.remove('hidout');
			}
		}
		setlSValue('EmbedIn', val)
	}
	setPMode = function(e) {
		var et = e.target, name = et.classList[0];
		if (name == 'dropdown-toggle') {
			et.classList.toggle('ins-act')
			et.nextElementSibling.classList.toggle('hidout');
		}
		if (name == 'set') {
			var txt = et.classList[1], sel = et.parentNode.parentNode;
			sel.previousElementSibling.className = 'dropdown-toggle '+ txt;
			sel.classList.toggle('hidout'); Gala.Embeds = txt;
			if (txt != 'refOnly' && getlSValue('EmbedLinks') != 'All')
				$each(document.querySelectorAll('blockquote a[href*="//"]:not(.cm-link):not(.irc-reflink)'), parseLinks);
			setlSValue('EmbedLinks', txt);
		}
	}
	setVSize = function (slider) {
		var p = slider.value;
		function size(w, h) {
			var played = document.querySelector('.video-container > iframe, #html5_video');
			setlSValue({'VWidth': w, 'VHeight': h});
			slider.nextElementSibling.textContent = '('+w+'x'+h+')';
			if (played) played.width = w, played.height = h;
		}
		p == 1 ? size(360, 270) : p == 2 ? size(480, 360) :
		p == 3 ? size(720, 480) : p == 4 ? size(854, 576) : slider.textContent = 'gay :D';
	}
	setupOption = function (obj, option) {
		if (obj.type === 'checkbox')
			val = obj.checked;
		if (obj.tagName === 'SELECT')
			val = obj.value;
		setlSValue(option, val);
	}
	loadMediaContainer = function (el) {
		var cont, src = el.getAttribute("src"),
			type = Gala.LinksMap[src].Type,
			hash = btoa(getPageName(src));
		if (Gala.MC === 0 && ['img', 'audio'].indexOf(type) < 0) {
			var last = contentFrame.lastChild;
				cont = $setup('div', {'class': 'content-frame '+ type, 'id': 'content_'+ hash,
					'html': Gala.LinksMap[src].Embed.allReplace({'r{wh}': 'class="full-size"', '(width|height)="\\d+"': '$1="100%"'})
				}, null);
			if (last.id != 'content_'+ hash) {
				if (last.classList[0] === 'content-frame') {
					contentFrame.replaceChild(cont, last);
					contMarker.classList.add('hidout');
				} else
					contentFrame.appendChild(cont)
			} else contMarker.classList.add('hidout');
			contentFrame.classList.remove('hidup');
		} else {
			var csEl = type +'-container', idEl = type +'_'+ hash,
				contEl = document.getElementsByClassName(csEl)[0];
				cont = $setup('div', {'id': idEl, 'class': csEl, 'html':
					Gala.LinksMap[src].Embed.replace('r{wh}', getVSize('html'))
				}, null);
			if (type === 'img')
				contEl = document.getElementById(idEl);
			if (!contEl || contEl.id != idEl) {
				if (contEl)
					contEl.remove();
				else if (['document', 'audio'].indexOf(type) >= 0)
					$placeNode('before', el, cont);
				else
					$placeNode('prepend', jumpCont(el), cont);
			} else {
				contEl.remove();
				cont = [];
			}
		}
		if (type === 'video')
			Gala.VActive = [el, cont];
	}
	wmarkTag = function(tag) { markText(tag, tag, 'wmark') }
	htmlTag = function(tag) { markText('['+tag+']', '[/'+tag+']', 'html') }
	qlTag = function(tag) { markText(tag+' ', '\n'+tag+' ', 'ql') }
	insTag = function(tag) {
		var htag = tag.split(/\s/)[0], wtag = tag.split(/\s/)[1],
			count = function(str, sbstr) { return str.split(sbstr).length - 1 },
			s = textArea.value.substring(0, textArea.selectionStart),
			active = count(s, '['+htag+']') <= count(s, '[/'+htag+']');
		!active ? (wtag === '%%' ? wmarkTag(wtag) : qlTag(wtag)) : htmlTag(htag);
	}
	
/*-----[ Local Functions ]-----*/
	function addMarkupButtons(type) {
		var chk, mbutton_tamplate;
		if (type === 'menu') {
			chk = 'checked',
			mbutton_tamplate = '<span class="menubuttons"><label><input onclick="hideMarkupButton(this)" type="checkbox" name="hide_r{v}" value="r{v}" r{x}><span title="r{T}">r{N}</span></label></span>';
		} else {
			chk = 'hidden', mbutton_tamplate = '<span id="r{v}" onclick="r{t}Tag(\'r{n}\')" title="r{T}" r{x} class="markup-button'+
				(type === 'text' ? ' text"><a href="#" onclick="return false;">r{N}</a>' : '"><input value="r{N}" type="button">') +'</span>';
		}
		return mbutton_tamplate.allReplace({'r{n}': 'b', 'r{N}': 'B', 'r{v}': 'bold',    'r{t}': 'html',  'r{T}': 'Жирный',         'r{x}': (getlSValue('bold', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'i',  'r{N}': 'i',    'r{v}': 'italic',     'r{t}': 'html',  'r{T}': 'Курсивный',      'r{x}': (getlSValue('italic', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'u',  'r{N}': 'U',    'r{v}': 'underline',  'r{t}': 'html',  'r{T}': 'Подчеркнутый',   'r{x}': (getlSValue('underline', true) ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 's',  'r{N}': 'S',    'r{v}': 'strike',     'r{t}': 'html',  'r{T}': 'Зачеркнутый',    'r{x}': (getlSValue('strike', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'spoiler %%', 'r{N}': '%%', 'r{v}': 'spoiler', 'r{t}': 'ins', 'r{T}': 'Спойлер',       'r{x}': (getlSValue('spoiler', true)   ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'code 	', 'r{N}': 'C', 'r{v}': 'code',      'r{t}': 'ins',   'r{T}': 'Код',            'r{x}': (getlSValue('code', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'rp',  'r{N}': 'RP',   'r{v}': 'roleplay',  'r{t}': 'html',  'r{T}': 'Ролеплей',       'r{x}': (getlSValue('roleplay', true)  ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'sup', 'r{N}': 'Sup',  'r{v}': 'sup',       'r{t}': 'html',  'r{T}': 'Верхний индекс', 'r{x}': (getlSValue('sup', true)       ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'sub', 'r{N}': 'Sub',  'r{v}': 'sub',       'r{t}': 'html',  'r{T}': 'Нижний индекс',  'r{x}': (getlSValue('sub', true)       ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': '!!',  'r{N}': '!A',   'r{v}': 'attent',    'r{t}': 'wmark', 'r{T}': 'Attention',      'r{x}': (getlSValue('attent', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': '##',  'r{N}': '#D',   'r{v}': 'dice',      'r{t}': 'wmark', 'r{T}': '#dice',          'r{x}': (getlSValue('dice', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': '>',   'r{N}': '&gt;', 'r{v}': 'quote',     'r{t}': 'ql',    'r{T}': 'Цитировать',     'r{x}': (getlSValue('quote', true)     ? '' : chk)});
	}
	function markText(openTag, closeTag, type) {
		var val = textArea.value, 
			end = textArea.selectionEnd,
			start = textArea.selectionStart,
			selected = val.substring(start, end),
			getext = start === end ? window.getSelection().toString() : selected,
			regex = /^(\s*)(.*?)(\s*)$/,
			cont = regex.exec(selected),
			wmark = type === 'wmark',
			dice = closeTag === '##',
			scrn = openTag === '\\',
			html = type === 'html',
			ql = type === 'ql';
		if (ql)
			markedText = openTag + getext.replace(/\n/gm, closeTag);
		if (html)
			markedText = openTag + selected + closeTag;
		if (wmark && !dice && !scrn)
			markedText = selected.replace((cont === null ? /^(\s*)(.*?)(\s*)$/gm : regex), '$1'+ openTag +'$2'+ closeTag +'$3');
		if (scrn)
			markedText = selected.length > 0 ? selected.replace(/(%%|\^|!!|\*)/gm, openTag +'$1') : closeTag;
		if (dice) {
			var s = ' ', d = (/(\d+)(d\d+)?/).exec(getext), OdT = openTag + (d && d[2] ? d[0] : d && d[1] ? '1d'+ d[1] : '1d2') + closeTag + s;
			markedText = cont === null ? selected + s + OdT : !cont[2] ? cont[1] + OdT : (/^\d+|\d+d\d+$/).test(selected) ? OdT : cont[1] + cont[2] + s + OdT;
		}
		var sOfs = 0, eOfs = markedText.length;
		if (dice)
			sOfs = eOfs;
		else if (['[spoiler]', '[code]'].indexOf(openTag) >= 0 || cont && !cont[2] && !ql)
			sOfs = openTag.length, eOfs = sOfs + selected.length;
		$setup(textArea, {'class': 'ta-inact', 'value': val.substring(0, start) + markedText + val.substring(end)}, null).focus();
		textArea.setSelectionRange(start + sOfs, start + eOfs);
	}
	function keyMarks(e) {
		var TA = e.target.tagName === 'TEXTAREA',
			KM = getlSValue('KeyMarks'),
		 	key = String.fromCharCode(e.charCode),
			val = textArea.value, 
			end = textArea.selectionEnd,
			start = textArea.selectionStart,
			selected = val.substring(start, end),
			active = selected.length > 0;
			function autoselect() {
				if (!active) {
					var fw = val.substring(start, val.length).match(/^(.*?)(?:\s|$)/);
					return (fw[1] ? false : true);
				} else return true;
			}
			function callback(e) {
				if (e.preventDefault)
					e.preventDefault();
				else
					e.returnValue = false;
			}
		if (KM && TA && KeyCodes.doubs.indexOf(key) >= 0) {
			if (Gala.LastKey === key || active){
				markText(key + (active ? key : ''), key + key, 'wmark')
				Gala.LastKey = null;
				return callback(e);
			}
		}
		if (KM && TA && KeyCodes.symbs.indexOf(key) >= 0) {
			if (autoselect()) {
				markText(key, (key === '(' ? ')' : key), 'wmark')
				return callback(e)
			}
		}
		if (KM && KeyCodes.quots.indexOf(key) >= 0) {
			selected = val.substring(start - 1, start);
			if (!selected.match(/[^.]/) || selected === '\n') {
				qlTag(key === '@' ? '•' : key);
				return callback(e)
			}
		}
		if (TA && e.keyCode != 8) { Gala.LastKey = key;
			if (textArea.className === 'ta-inact') {
				textArea.setSelectionRange(end, end);
				textArea.removeAttribute('class');
			}
		}
	}
	function parseLinks(link) {
		var iframe = '<iframe r{wh} frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen',
			P = Gala.Embeds === 'refOnly' ? null : Gala.Embeds === 'All' ? true : false,
			endp, file, regex = /.+/, embed = '', fav, i = 1, type = 'video',
			VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v', 'flv', "3gp"],
			AF = ["flac", "alac", "wav", "m4a", "m4r", "aac", "ogg", "mp3"],
			IF = ["jpeg", "jpg", "png", "svg", "gif"],
			href = escapeUrl(link.href),
			EXT = href.split('.').pop().toLowerCase();
		/************************* Reflinks ************************/
		if (href.indexOf("pony") >= 0 && href.indexOf("/res/") >= 0) {
			var targ = parseUrl(href);
			if (targ != null && targ.thread) {
				var brd = targ.board, tid = targ.thread,
					pid = !targ.pid ? tid : targ.pid,
					op = pid === tid ? ' de-opref' : '',
					diffb = brd === Gala.URL.board;
				return $setup(link, {'href': href.replace(/(?:https?:)\/\/pony(?:a)?(?:\.)?ch(?:an)?(?:\.\w+)?/, ''), 'text': '>>'+ (diffb ? '' : '/'+ brd +'/') + pid, 
						'onclick': 'return highlight("'+ pid +'", true)', 'class': 'de-preflink ref|'+ brd +'|'+ tid +'|'+ pid + op}, null);
			}
		}
		if (P === null) {
			return setlSValue('LinksCache', '{}', true);
		} else {
			/********* HTML5 Audio/Video & Images *********/
			if (VF.concat(AF.concat(IF)).indexOf(EXT) >= 0) {
				return attachFile(link, (IF.indexOf(EXT) >= 0 ? 'img' : AF.indexOf(EXT) >= 0 ? 'audio' : 'video'));
			}
			/************************** SoundCloud *************************/
			if (href.indexOf("soundcloud.com/") >= 0) {
				link.className = "sc-player";
				if (link.nextElementSibling.tagName === 'BR')
					link.nextElementSibling.remove();
				jumpCont(link).appendChild(link);
				return $(link).scPlayer();
			}
			/*************************** Простоплеер **************************/
			if (href.indexOf("pleer.com/tracks/") >= 0) {
				regex = /(?:https?:)?\/\/(?:www\.)?pleer\.com\/tracks\/([\w_-]*)/g;
				embed = '<embed class="prosto-pleer" width="410" height="40" type="application/x-shockwave-flash" src="http://embed.pleer.com/track?id=$1">';
				pleer = $setup('object', {'class': 'pleer-track', 'html': href.replace(regex, embed)}, null)
				return $placeNode('replace', link, pleer);
			}
			/************************* YouTube *************************/
			if (href.indexOf("youtu") >= 0) {
				embed = iframe +' src="//www.youtube.com/embed/$1$3?$2$4&autohide=1&enablejsapi=1&theme=light&html5=1&rel=0&start=$5">';
				fav = '//youtube.com/favicon.ico'; P = Gala.deCfg['addYouTube'] ? false : true;
				if (href.indexOf("youtube.com/watch?") >= 0 || href.indexOf("youtube.com/playlist?") >= 0)
					regex = /(?:https?:)?\/\/(?:www\.)?youtube\.com\/(?:watch|playlist)\?.*?(?:v=([\w_-]*)|(list=[\w_-]*))(?:.*?v=([\w_-]*)|.*?(list=[\w_-]*)+)?(?:.*?t=(\d+))?/g;
				if (href.indexOf("youtu.be") >= 0)
					regex = /(?:https?:)?\/\/(?:www\.)?youtu\.be\/([\w_-]*)(?:.*?(list=[\w_-]*))?(?:.*?t=([\w_-]*))?/g;
				if (href.indexOf("playlist?") >= 0)
					P = true, i = 2;
			}
			/************************** Vimeo **************************/
			if (href.indexOf("vimeo") >= 0) {
				regex = /(?:https?:)?\/\/(?:www\.)?vimeo\.com\/(?:.*?\/)?(\d+)(?:.*?t=(\d+))?/g;
				embed = iframe +' src="//player.vimeo.com/video/$1?badge=0&color=ccc5a7#t=$2">';
				fav = '//f.vimeocdn.com/images_v6/favicon_32.ico'; P = Gala.deCfg['addVimeo'] ? false : true;
			}
			/************************** Coub *************************/
			if (href.indexOf("coub.com/view/") >= 0) {
				regex = /(?:https?:)?\/\/(?:www\.)?(?:coub\.com)\/(?:view)\/([\w_-]*)/g;
				embed = iframe +'="true" src="http://coub.com/embed/$1?muted=false&autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false">';
				fav = "//coub.com/favicon.ico"; P = true;
			}
			/************************* RuTube *************************/
			if (href.indexOf("rutube.ru/video/") >= 0) {
				regex = /(?:https?:)?\/\/(?:www\.)?(?:rutube\.ru)\/(?:video)\/([\w_-]*)\/?/g;
				embed = iframe +' src="http://rutube.ru/video/embed/$1?autoStart=false&isFullTab=true&skinColor=fefefe">';
				fav = "//rutube.ru/static/img/btn_play.png"; P = true;
			}
			/************************* Видео m@il.ru  *************************/
			if (href.indexOf("mail.ru/") >= 0 && href.indexOf("/video/") >= 0) {
				regex = /(?:https?:)?\/\/(?:my\.)?(?:mail\.ru\/mail\/)([\w_-]*)(?:\/video)\/([\w_-]*\/\d+\.html)/g;
				embed = iframe +' src="http://videoapi.my.mail.ru/videos/embed/mail/$1/$2">'; P = true;
			}
			/************************* Яндекс.Видео *************************/
			if (href.indexOf("video.yandex.ru/users/") >= 0) {
				if ((/\/view\/(\d+)/).exec(href)) {
					endp = 'http://video.yandex.ru/oembed.json?url='; P = true;
					fav = '//yastatic.net/islands-icons/_/ScXmk_CH9cCtdXl0Gzdpgx5QjdI.ico';
				}
			}
			/************************* VK.com ************************/
			if (href.indexOf("vk.com/video") >= 0) {
				regex = /(?:https?:)?\/\/vk\.com\/video(?:_ext\.php\?oid=)?(-?\d+)(?:&id=|_)(\d+).?(hash=[\w_-]*)?(.*?hd=-?\d+)?(.*?t=[\w_-]*)?/g;
				embed = iframe +' src="http://vk.com/video_ext.php?oid=$1&id=$2&$3$4$5">';
				link.setAttribute('href', href.replace(regex, 'https://vk.com/video$1_$2?$3$4$5'));
				fav = '//vk.com/images/faviconnew.ico'; i = 3; P = true;
			}
			/************************* Pastebin *************************/
			if (href.indexOf("pastebin.com/") >= 0) {
				regex = /(?:https?:)?\/\/(?:www\.)?(?:pastebin\.com)\/([\w_-]*)/g;
				embed = '<iframe frameborder="0" src="http://pastebin.com/embed_js.php?i=$1">';
				fav = '/test/src/140593041526.png';
				type = 'document'; P = true;
			}
			/************************* Custom iframe ************************/
			if (href.indexOf("/iframe/") >= 0 || href.indexOf("/embed/") >= 0) {
				embed =  iframe +' src="'+ href +'">';
				if (href.indexOf("/html/") < 0)
					link.setAttribute("href", href.allReplace({'embed/': "", 'be.com': ".be"}));
				i = 0; P = true;
			}
			/****************************************************************/
			if (P && Gala.LinksMap[href]) {
				if (Gala.LinksMap[href].Embed)
					$setup(link, {'href': undefined, 'src': href, 'onclick': 'loadMediaContainer(event.target)'}, null);
				$setup(link, {'class': 'cm-link', 'title': Gala.LinksMap[href].Title, 'text': Gala.LinksMap[href].Name,
					'rel': 'nofollow', 'style': 'background:url('+ Gala.LinksMap[href].Favicon +')left / 16px no-repeat'
				}, null);
			} else if (P)
				oEmbedMedia(link, type, href.replace(regex, embed), fav, endp, (regex.exec(href)[i] != undefined));
		}
	}
	function attachFile(el, type, lR) {
		var fileUrl = escapeUrl(el.href),
			fileName = (type === 'img' ? 'Expand: ' : 'Play: ') + getPageName(fileUrl),
			fileIcon = '/test/src/'+ (type === 'img' ? '140896790568.png' : '139981404639.png'),
			embed = type === 'img' ? '<img style="border:medium none;cursor:pointer" src="'+ fileUrl +'" class="thumb" alt="'+ fileName +
				'" width="290" onclick="this.setAttribute(\'width\', this.getAttribute(\'width\') == \'290\' ? \'85%\' : \'290\')" >' :
				'<video '+ (type === 'audio' ? 'width="300" height="150" poster="/test/src/139957920577.png"' : 'r{wh}') +
			' controls><source src="'+ fileUrl +'"></source></video>',
			attach = function(e) {
				$setup(el, {'class': 'cm-link', 'rel': 'nofollow', 'href': undefined, 'src': fileUrl, 
					'style':'background:url('+ fileIcon +')left / 16px no-repeat', 'text': fileName,
					'onclick': 'loadMediaContainer(event.target)'}, null);
				Gala.LinksMap[fileUrl] = {Name: fileName, Title: '', Embed: embed, Favicon: fileIcon, Type: type};
				setlSValue('LinksCache', JSON.stringify(Gala.LinksMap), true);
			};
		$setup(type, {'src': fileUrl, 'width': getVSize('w'), 'height': getVSize('h'), 'controls': ''}, {'load': attach,
			'loadeddata': function(e){ lR ? $placeNode('replace', el, this) : attach(e)},
			'error': function(e) { lR ? el.setAttribute('target', '_blank') : oEmbedMedia(el) }
		});
	}
	function oEmbedMedia(link, type, embed, fav, endpoint, arg) {
		var mediaUrl = escapeUrl(link.href);
		getDataResponse((!endpoint ? 'http://api.embed.ly/1/oembed?url=' : endpoint) + mediaUrl +'&format=json',
		function(status, sText, data, xhr) {
			if (status !== 200 || !data) {
				$setup(link, {'target': '_blank'}, null);
			} else {
				var loc = getLocation(mediaUrl),
					slnk = ['tinyurl.com', 'bit.ly', 'goo.gl'],
					host = slnk.indexOf(loc.hostname) >= 0 ? data.provider_url : 'http://'+ loc.hostname,
					icon = !fav ? '//www.google.com/s2/favicons?domain='+ host : fav,
					title = host == 'pastebin.com' ? data.description.split(' | ').pop() : data.description,
					name = !data.title ? getPageName(mediaUrl) +' ・ ❨'+ data.provider_name +'❩' : data.title.allReplace({' - YouTube': "", ' - Pastebin.com': ""}, true);
				if (arg || !arg && data.html && data.type != "link") {
					if (!embed && data.html)
						embed = data.html;
					if (data.provider_name === "Google Docs")
						type = 'document';
					$setup(link, {'href': undefined, 'src': mediaUrl, 'onclick': 'loadMediaContainer(event.target)'}, null);
				}
				$setup(link, {'class': 'cm-link', 'rel': 'nofollow', 'title': title, 'text': name,
					'style': 'background:url('+ icon +')left / 16px no-repeat'}, null);
				Gala.LinksMap[mediaUrl] = {Name: name, Title: title, Embed: embed, Favicon: icon, Type: type};
				setlSValue('LinksCache', JSON.stringify(Gala.LinksMap), true);
			}
		});
	}
	function getVSize(i) {
		var w = getlSValue('VWidth', 360), h = getlSValue('VHeight', 270),
			val = w == 360 ? 1 : w == 480 ? 2 : w == 720 ? 3 : w == 854 ? 4 : 0;
		if (i === 'html') return 'width="'+w+'" height="'+h+'"';
		if (i === 'value') return val;
		if (i === 'text') return w+'x'+h;
		return (i == 'w' ? w : i == 'h' ? h : 0);
	}
	function insertListenerS(event){
		if (event.animationName == "init") {
			var et = event.target, etp = et.parentNode,
				dnb = etp.querySelector('span[id^="dnb-"]'),
				mbp = $setup('span', {'id': 'markup-buttons-panel', 'html':
					addMarkupButtons(et.querySelector('.de-abtn') ? 'text' : 'btn')}, null);
			if (et.id === 'de-txt-panel') {
				if(!textArea) {
					textArea = $setup(document.getElementById('msgbox'), {}, {
						'click': function(e) {this.removeAttribute('class')},
						'keydown': function(e) {
							if (KeyCodes.specl.indexOf(e.keyCode) >= 0)
								keyMarks(e)}
					});
					window.addEventListener('keypress', keyMarks, false);
				}
				if (et.lastChild.id != 'markup-buttons-panel')
					et.appendChild(mbp);
			}
			if (et.className.split(' ').indexOf('de-imgmenu') >= 0)
				et.insertAdjacentHTML('beforeend', '<a class="de-menu-item de-imgmenu de-src-derpibooru" onclick="revSearch(\''+ et.lastChild.href.split('=')[1] +'\')" target="_blank">Поиск по Derpibooru</a>');
			if (et.tagName === 'BLOCKQUOTE') {
				$each(etp.querySelectorAll('td > a[href$=".webm"]:not([target="_blank"]), div > a[href$=".webm"]:not([target="_blank"])'), function(el) { attachFile(el, 'video', true) });
				if (dnb && etp.tagName !== 'DIV' && dnb.nextElementSibling.tagName !== 'BR' && dnb.nextElementSibling.tagName !== 'LABEL')
					dnb.insertAdjacentHTML('afterend', '<label style="display:block">');
				$each(et.querySelectorAll('a[href*="//"]:not(.cm-link):not(.irc-reflink):not([href*="soundcloud.com/"])'), parseLinks);
			}
			if(!document.querySelector('.content-window'))
				$placeNode('append', document.body, [contentFrame, contMarker]);
		}
	}
	function insertListenerE(event) {
		if (event.animationName == "init") {
			var et = event.target;
			if (et.tagName === 'BLOCKQUOTE') {
				setTimeout(function() { $each(et.querySelectorAll('a[href*="soundcloud.com/"]'), parseLinks) }, 700)
			}
		}
	}
	var pfx = ["webkit", "moz", "MS", "o", ""];
	// animation listener events
	PrefixedEvent("AnimationStart", insertListenerS);
	//PrefixedEvent("AnimationIteration", insertListener);
	PrefixedEvent("AnimationEnd", insertListenerE);
	// apply prefixed event handlers
	function PrefixedEvent(type, callback) {
		for (var p = 0; p < pfx.length; p++) {
			if (!pfx[p]) type = type.toLowerCase();
			document.addEventListener(pfx[p]+type, callback, false);
		}
	}
})();
