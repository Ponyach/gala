/* 
			«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 1.2.49
								© magicode
	
*/
var style = document.createElement("style");
style.textContent = 'blockquote:after, #de-txt-panel:after, .de-menu.de-imgmenu:after{content:"";-webkit-animation:load 1s linear 2;animation:load 1s linear 2}\
.de-video-obj,.postcontent{position:relative;display:inline-block!important}.cm-link{padding:0 16px 0 0;margin:0 4px;cursor:pointer}\
.document-container{overflow:auto;resize:both;background-color:#fefefe} .document-container > iframe{width:100%;height:100%;resize:none}\
.webm, .video-container{display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2}\
.audio-container{margin:5px 0;position:relative;cursor:pointer;z-index:2}.image-container{display:inline-block}\
.markup-button a{font-size:13px;text-decoration:none}span[de-bb]{position:absolute;visibility:hidden}\
.de-src-derpibooru:before{content:"";padding:0 16px 0 0;margin:0 4px;background-image:url(/test/src/140903588031.png)}\
.ta-inact::-moz-selection{background:rgba(99,99,99,.3)}.ta-inact::selection{background:rgba(99,99,99,.3)}\
#hide-buttons-panel > .menubuttons {width: 40px;margin: 0 2px}#vsize-textbox{font-family:monospace;opacity:.6}\
@keyframes load{50% {opacity:0}} @-webkit-keyframes load{50% {opacity:0}}';
document.head.appendChild(style);
var textArea, deCfg = JSON.parse(getlSValue('DESU_Config'))[window.location.host];
function addGalaSettings() {
	var settings_panel = '<table><tbody><tr><td>Скрывать кнопки разметки:</td><td id="hide-buttons-panel">'+ addMarkupButtons('menu') +'</td></tr>' +
	'<tr><td>Живые ссылки:</td><td class="menubuttons"><label><input onclick="setlSValue(\'LiveLinks\', this.checked ? true : false)" '+ (!getlSValue('LiveLinks', true) ? '' : 'checked') +' type="checkbox" name="disable_ll" value=""><span>&Xi;</span></label></td></tr>'+
	'<tr><td>Размер видеоплеера:</td><td><input onchange="setVSize(this)" min="1" value="'+ getVSize('value') +'" step="1" max="4" type="range" name="v_size"><span id="vsize-textbox">('+getVSize('text')+')</span></td></tr></tbody></table>';
	return settings_panel;
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
String.prototype.allReplace = function(obj) {
	var retStr = this;
	for (var x in obj) {
		retStr = retStr.replace(new RegExp(x, 'g'), obj[x])
	}
	return retStr
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
	var To, In = el.parentNode;
	if (p === 'append') {
		for(var i = 0, len = node.length; i < len; i++) {
			if (node[i])
				el.appendChild(node[i]);
		}
	} else {
		if (p === 'after') To = el.nextSibling;
		if (p === 'before') To = el;
		if (p === 'prepend') To = el.childNodes[0], In = el;
		In.insertBefore(node, To);
	}
}

(function() {
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
	addMarkupButtons = function(type) {
		var chk, mbuttons, mbutton_tamplate;
		if (type === 'menu') {
			chk = 'checked',
			mbutton_tamplate = '<span class="menubuttons"><label><input onclick="hideMarkupButton(this)" type="checkbox" name="hide_r{v}" value="r{v}"><span title="r{T}" r{x}>r{N}</span></label></span>';
		} else {
			chk = 'hidden', mbutton_tamplate = '<span class="markup-button" id="r{v}" onclick="r{t}Tag(\'r{n}\')" title="r{T}" r{x}>'+
				(type === 'text' ? '<a href="#" onclick="return false;">r{N}</a></span>&nbsp;\|&nbsp;' : '<input value="r{N}" type="button"></span>');
		}
		mbuttons = mbutton_tamplate.allReplace({'r{n}': 'b',  'r{N}': 'B', 'r{v}': 'bold',   'r{t}': 'html',  'r{T}': 'Жирный',         'r{x}': (getlSValue('bold', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'i',  'r{N}': 'i',    'r{v}': 'italic',     'r{t}': 'html',  'r{T}': 'Курсивный',      'r{x}': (getlSValue('italic', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'u',  'r{N}': 'U',    'r{v}': 'underline',  'r{t}': 'html',  'r{T}': 'Подчеркнутый',   'r{x}': (getlSValue('underline', true) ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 's',  'r{N}': 'S',    'r{v}': 'strike',     'r{t}': 'html',  'r{T}': 'Зачеркнутый',    'r{x}': (getlSValue('strike', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'spoiler %%', 'r{N}': '%%', 'r{v}': 'spoiler', 'r{t}': 'ins', 'r{T}': 'Спойлер',       'r{x}': (getlSValue('spoiler', true)   ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'code \	', 'r{N}': 'C',  'r{v}': 'code',    'r{t}': 'ins', 'r{T}': 'Код',           'r{x}': (getlSValue('code', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'rp •', 'r{N}': 'RP',  'r{v}': 'roleplay',  'r{t}': 'ins',   'r{T}': 'Ролеплей',       'r{x}': (getlSValue('roleplay', true)  ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'sup', 'r{N}': 'Sup',  'r{v}': 'sup',       'r{t}': 'html',  'r{T}': 'Верхний индекс', 'r{x}': (getlSValue('sup', true)       ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'sub', 'r{N}': 'Sub',  'r{v}': 'sub',       'r{t}': 'html',  'r{T}': 'Нижний индекс',  'r{x}': (getlSValue('sub', true)       ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': '!!',  'r{N}': '!A',   'r{v}': 'attent',    'r{t}': 'wmark', 'r{T}': 'Attention',      'r{x}': (getlSValue('attent', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': '##',  'r{N}': '#D',   'r{v}': 'dice',      'r{t}': 'wmark', 'r{T}': '#dice',          'r{x}': (getlSValue('dice', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': '>',   'r{N}': '&gt;', 'r{v}': 'quote',     'r{t}': 'ql',    'r{T}': 'Цитировать',     'r{x}': (getlSValue('quote', true)     ? '' : chk)});
		return mbuttons;
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
			dice = openTag === '##',
			html = type === 'html',
			ql = type === 'ql';
		if (ql)
			markedText = openTag + getext.replace(/\n/gm, closeTag);
		if (html)
			markedText = openTag + selected + closeTag;
		if (wmark && !dice)
			markedText = selected.replace((cont === null ? /^(\s*)(.*?)(\s*)$/gm : regex), '$1'+ openTag +'$2'+ closeTag +'$3');
		if (dice) {
			var s = ' ', d = (/(\d+)(d\d+)?/).exec(getext), OdT = openTag + (d && d[2] ? d[0] : d && d[1] ? '1d'+ d[1] : '1d2') + closeTag + s;
			markedText = cont === null ? selected + s + OdT : !cont[2] ? cont[1] + OdT : (/^\d+|\d+d\d+$/).test(selected) ? OdT : cont[1] + cont[2] + s + OdT;
		}
		$setup(textArea, {'class': 'ta-inact', 'value': val.substring(0, start) + markedText + val.substring(end)}, {
			'click': function(e) { this.removeAttribute('class') }
		});
		textArea.focus();
		eOfs = markedText.length, sOfs = '';
		if (['[spoiler]', '[code]', '[rp]'].indexOf(openTag) >= 0 || cont && !cont[2] && !dice && !ql) {
			sOfs = openTag.length;
			eOfs = sOfs + selected.length;
		}
		if (dice)
			sOfs = eOfs;
		textArea.setSelectionRange(start + sOfs, start + eOfs);
		window.onkeypress = function() {
			if (textArea.className === 'ta-inact') {
				var sEn = textArea.selectionEnd;
				textArea.setSelectionRange(sEn, sEn);
				textArea.removeAttribute('class');
			}
		}
	}
	htmlTag = function(tag) {
		markText('['+tag+']', '[/'+tag+']', 'html');
	}
	wmarkTag = function(tag) {
		markText(tag, tag, 'wmark');
	}
	qlTag = function(tag) {
		markText(tag+' ', '\n'+tag+' ', 'ql');
	}
	insTag = function(tag) {
		var htag = tag.split(/\s/)[0], wtag = tag.split(/\s/)[1],
			count = function(str, sbstr) { return str.split(sbstr).length - 1 },
			s = textArea.value.substring(0, textArea.selectionStart),
			active = count(s, '['+htag+']') <= count(s, '[/'+htag+']');
		!active ? (wtag === '%%' ? wmarkTag(wtag) : qlTag(wtag)) : htmlTag(htag);
	}
	initLinks = function(link) {
		var iframe = '<iframe r{wh} frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen',
			endp = 'http://api.embed.ly/1/oembed?url=', file, regex, embed, fav, i = 1, type = 'video';
			href = escapeUrl(link.href),
			EXT = href.split('.').pop().toLowerCase(),
			VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v', 'flv', "3gp"],
			AF = ["flac", "alac", "wav", "m4a", "m4r", "aac", "ogg", "mp3"],
			IF = ["jpeg", "jpg", "png", "svg", "gif"],
			P = getlSValue('LiveLinks');
		/********* HTML5 Video *********/
		if (VF.indexOf(EXT) >= 0) {
			embed = '<video r{wh} id="html5_video" controls="true" poster=""><source src="$1"></source></video>';
			P = attachFile(link, 'video', embed);
		}
		/********* HTML5 Audio *********/
		if (AF.indexOf(EXT) >= 0) {
			embed = '<video width="300" height="150" controls="" poster="/test/src/139957920577.png"><source src="$1"></source></video>';
			P = attachFile(link, 'audio', embed);
		}
		/********* Image File *********/
		if (IF.indexOf(EXT) >= 0) {
			var name = getElementName(href),
				fShN = name.length > 17 ? name.substring(0, 17) + '...' : name;
			embed = '<img style="border:medium none;cursor:pointer" src="$1" class="thumb" alt="'+ name +'" width="290" onclick="this.setAttribute(\'width\', this.getAttribute(\'width\') == \'290\' ? \'85%\' : \'290\')" >';
			P = attachFile(link, 'image', embed);
		}
		/************************** SoundCloud *************************/
		if (href.indexOf("soundcloud.com/") >= 0) {
			link.className = "sc-player";
			if (link.nextElementSibling.tagName === 'BR')
				link.nextElementSibling.remove();
			jumpCont(link).appendChild(link);
			$(link).scPlayer();
			P = false;
		}
		/*************************** Простоплеер **************************/
		if (href.indexOf("pleer.com/tracks/") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?pleer\.com\/tracks\/([\w_-]*)/g;
			embed = '<embed class="prosto-pleer" width="410" height="40" type="application/x-shockwave-flash" src="http://embed.pleer.com/track?id=$1"></embed>';
			pleer = $setup('object', {'class': 'pleer-track', 'html': href.replace(regex, embed)}, null)
			link.parentNode.replaceChild(pleer, link); P = false;
		}
		/************************* YouTube *************************/
		if (href.indexOf("youtu") >= 0) {
			embed = iframe + ' src="//www.youtube.com/embed/$1$3?$2$4&autohide=1&wmode=opaque&enablejsapi=1&theme=light&html5=1&rel=0&start=$5">';
			fav = '//youtube.com/favicon.ico'; P = deCfg['addYouTube'] ? false : true;
			if (href.indexOf("youtube.com/watch?") >= 0 || href.indexOf("youtube.com/playlist?") >= 0)
				regex = /(?:https?:)?\/\/(?:www\.)?youtube\.com\/(?:watch|playlist)\?.*?(?:v=([\w_-]*)|(list=[\w_-]*))(?:.*?v=([\w_-]*)|.*?(list=[\w_-]*)+)?(?:.*?t=(\d+))?/g;
			if (href.indexOf("youtu.be") >= 0)
				regex = /(?:https?:)?\/\/(?:www\.)?youtu\.be\/([\w_-]*)\?(list=[\w_-]*)?(?:.*?t=([\w_-]*))?/g;
			if (href.indexOf("playlist?") >= 0)
				P = true, i = 2;
		}
		/************************** Vimeo **************************/
		if (href.indexOf("vimeo") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?vimeo\.com\/(?:.*?\/)?(\d+)(?:.*?t=(\d+))?/g;
			embed = iframe + ' src="//player.vimeo.com/video/$1?badge=0&color=ccc5a7#t=$2"></iframe>';
			fav = '//f.vimeocdn.com/images_v6/favicon_32.ico'; P = deCfg['addVimeo'] ? false : true;
		}
		/************************** Coub *************************/
		if (href.indexOf("coub.com/view/") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:coub\.com)\/(?:view)\/([\w_-]*)/g;
			embed = iframe +'="true" src="http://coub.com/embed/$1?muted=false&amp;autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false">';
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
			embed = iframe +' src="http://videoapi.my.mail.ru/videos/embed/mail/$1/$2">';
			P = true;
		}
		/************************* Яндекс.Видео *************************/
		if (href.indexOf("video.yandex.ru/users/") >= 0) {
			if ((/\/view\/(\d+)/).exec(href)) {
				endp = 'http://video.yandex.ru/oembed.json?url='
				fav = '//yastatic.net/islands-icons/_/ScXmk_CH9cCtdXl0Gzdpgx5QjdI.ico';
				P = true;
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
			regex = /(.+)/g;
			embed =  iframe +' src="'+ href +'">';
			if (href.indexOf("/html/") < 0)
				link.setAttribute("href", href.allReplace({'embed/': "", 'be.com': ".be"}));
			i = 0; P = true;
		}
		/****************************************************************/
		if (link.textContent.indexOf('>>') >= 0 || ['cm-link', 'irc-reflink'].indexOf(link.classList[0]) >= 0 || href.indexOf("/res/") >= 0 || P === false)
			return;
		var m = !regex ? '' : regex.exec(href);
		oEmbedMedia(endp, fav, link, (!m || !m[i] ? 0 : 1), type, regex, embed);
	}
	loadMediaContainer = function (obj, type, regex, embed) {
		var src = obj.getAttribute("src");
			csEl = type +'-container',
			TYPES = ['document', 'audio'],
			idEl = type +'_'+ btoa(getElementName(src)),
			contEl = document.getElementsByClassName(csEl)[0],
			cont = $setup('div', {'id': idEl, 'class': csEl, 'html': src.replace(
				regex, embed.replace('r{wh}', getVSize('html'))
			)}, null);
		if (type === 'image')
			contEl = document.getElementById(idEl);
		if (!contEl || contEl.id != idEl) {
			if (contEl)
				contEl.remove();
			if (TYPES.indexOf(type) >= 0)
				$placeNode('before', obj, cont);
			else
				$placeNode('prepend', jumpCont(obj), cont);
		} else contEl.remove();
	}
	oEmbedMedia = function (endpoint, fav, link, arg, type, regex, embed) {
		var mediaUrl = escapeUrl(link.href);
		getDataResponse(endpoint + mediaUrl + '&format=json', function(status, sText, data, xhr) {
			if (status !== 200 || !data) {
				$setup(link, {'target': '_blank'}, null);
			} else {
				var loc = getLocation(mediaUrl),
					slnk = ['tinyurl.com', 'bit.ly', 'goo.gl'],
					host = slnk.indexOf(loc.hostname) >= 0 ? data.provider_url : loc.hostname,
					icon = !fav ? '//www.google.com/s2/favicons?domain='+ host : fav,
					name = !data.title ? getElementName(mediaUrl) +'&nbsp;&middot;&nbsp;❨'+ data.provider_name +'❩' : escapeHtml(data.title).replace(/\ -\ YouTube/, "").replace(/\ -\ Pastebin\.com/, ""),
					title = host == 'pastebin.com' ? data.description.split(' | ').pop() : escapeHtml(data.description);
				if (arg > 0 || arg === 0 && data.html && data.type != "link") {
					if (data.provider_name === "Google Docs")
						type = 'document';
					$setup(link, {'href': undefined, 'src': mediaUrl}, {
						'click': function(e) {
							loadMediaContainer(e.target.parentNode, (!type ? data.type : type), (!regex ? /(.+)/g : regex), (!embed ? data.html : embed))
						}
					});
				}
				$setup(link, {'class': 'cm-link', 'rel': 'nofollow', 'title': title, 'style': 'background:url('+ icon +')left / 16px no-repeat',
					'html': '<u style="margin-left:20px">'+ name +'</u>'
				}, null);
			}
		});
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
	getVSize = function (i) {
		var w = getlSValue('VWidth', 360), h = getlSValue('VHeight', 270),
			val = w == 360 ? 1 : w == 480 ? 2 : w == 720 ? 3 : w == 854 ? 4 : 0;
			whtml = 'width="'+w+'" height="'+h+'"';
		if (i === 'html') return whtml;
		if (i === 'value') return val;
		if (i === 'text') return w+'x'+h;
	}
	getElementName = function(elUrl) {
		var getElName = function(a) { return a.substring(a.lastIndexOf("/") + 1) },
			slcElName = function (a) { return getElName(a.slice(0, -1)) },
			elName = getElName(elUrl) === '' ? slcElName(elUrl) : getElName(elUrl);
		return decodeURIComponent(elName);
	}
	attachFile = function(obj, type, embed) {
		var fileUrl = escapeUrl(obj.href),
			fileName = getElementName(fileUrl);
		$setup(obj, {'class': 'cm-link', 'href': undefined, 'src': fileUrl, 
			'style':'background:url(/test/src/'+ (type === 'image' ? '140896790568.png' : '139981404639.png') +')left / 16px no-repeat',
			'html': '<u style="margin-left:20px;">'+ (type === 'image' ? 'Expand: ' : 'Play: ') + fileName +'</u>'}, {'click': function(e) {
				loadMediaContainer(e.target.parentNode, type, /(.+)/g, embed);
			}
		});
		return false;
	}
	getDataResponse = function(uri, Fn) {
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
	//-- Replace special characters from text
	escapeHtml = function(text) {
		if (text)
			return text.replace(/\"/gm, "&#34;").replace(/\'/gm, "&#39;").replace(/\</gm, "&lt;").replace(/\>/gm, "&gt;");
	}
	//-- Remove Zero whitespaces and invalid characters (like ") from Url Links
	escapeUrl = function(url) {
		var eUrl = encodeURI(url).replace(/%E2%80%8B/gi, "").replace(/%3Cb%3E/gi, "").replace(/%22/gi, "");
		return decodeURI(eUrl);
	}
	//-- Get host name {getLocation(url).hostname} and path name {getLocation(url).pathname} from Url Links
	getLocation = function(url) {
		return $setup('a', {'rel': 'nofollow', 'href': url}); 
	}
	//-- Derpibooroo Reverse Search 
	revSearch = function(el) {
		var form = $setup('form', {'method': "post", 'action': "https://derpibooru.org/search/reverse", 'target': "_blank", 'enctype': "multipart/form-data", 'hidden': "",
			'html': '<input id="url" name="url" type="text" value="'+ el.getAttribute('src') +'"><input id="fuzziness" name="fuzziness" type="text" value="0.25">'}, null);
		document.body.appendChild(form).submit(); form.remove();
	}
	insertListenerS = function(event){
		if (event.animationName == "load") {
			var et = event.target, etp = et.parentNode,
				dnb = etp.querySelector('span[id^="dnb-"]'),
				webm = etp.querySelector('td > a[href$=".webm"], div > a[href$=".webm"]');
			if (et.id === 'de-txt-panel') {
				textArea = document.getElementById('msgbox');
				var mbp = $setup('span', {'id': 'markup-buttons-panel', 'html': addMarkupButtons(et.querySelector('.de-abtn') ? 'text' : 'btn')}, null);
				if (et.lastChild.id != 'markup-buttons-panel')
					et.appendChild(mbp);
			}
			if (et.className.split(' ').indexOf('de-imgmenu') >= 0)
				et.insertAdjacentHTML('beforeend', '<a class="de-menu-item de-imgmenu de-src-derpibooru" onclick="revSearch('+ (/url\=(.+)/).exec(et.lastChild.href)[1] +');return false;" target="_blank">Поиск по Derpibooru</a>');
			if (et.tagName === 'BLOCKQUOTE') {
				if (dnb && etp.tagName !== 'DIV' && dnb.nextElementSibling.tagName !== 'BR' && dnb.nextElementSibling.tagName !== 'LABEL')
					dnb.insertAdjacentHTML('afterend', '<label style="display:block">');
				if (webm) {
					webm.insertAdjacentHTML('afterend', '<video class="webm" '+ getVSize('html') +' controls="true" poster=""><source src="'+ webm.href +'"></source></video>');
					webm.remove();
				}
			}
		}
	}
	insertListenerE = function(event){
		if (event.animationName == "load") {
			var a, i, et = event.target;
			if (et.tagName === 'BLOCKQUOTE') {
				for(i = 0, a = et.querySelectorAll('a:not([href*="soundcloud.com/"])'); link = a[i++];) {
					initLinks(link)
				}
				setTimeout(function() {
					for(i = 0, a = et.querySelectorAll('a[href*="soundcloud.com/"]'); link = a[i++];) {
						initLinks(link);
					}
				}, 700)
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
