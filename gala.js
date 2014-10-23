/* 
			«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 1.2.17
								© magicode
	
*/
var style = document.createElement("style");
style.textContent = 'blockquote:before, span[de-bb]:before, .de-menu.de-imgmenu:before{content:"";-webkit-animation:load 1s linear 2;animation:load 1s linear 2}\
.de-video-obj,.postcontent{position:relative;display:inline-block!important}.cm-link{padding:0 16px 0 0;margin:0 4px;cursor:pointer}\
.pastebin-container{overflow:auto;resize:both;background-color:#fefefe}.pastebin-container body{color:transparent}\
.webm, .video-container{display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2}\
.audio-container{margin:5px 0;position:relative;cursor:pointer;z-index:2}\
.markup-button a{font-size:13px;text-decoration:none}span[de-bb]{position:absolute;visibility:hidden}\
.de-src-derpibooru:before{content:"";padding:0 16px 0 0;margin:0 4px;background-image:url(/test/src/140903588031.png)}\
.ta-inact::-moz-selection{background:rgba(99,99,99,.3)}.ta-inact::selection{background:rgba(99,99,99,.3)}\
#hide-buttons-panel > .menubuttons {width: 40px;margin: 0 2px}#vsize-textbox{font-family:monospace;opacity:.6}\
@keyframes load{\
	50% {opacity:0}\
}\
@-webkit-keyframes load{\
	50% {opacity:0}\
}';
document.head.appendChild(style);
var textArea, postNode = 'td.reply, td.highlight, .pstnode[de-thread] > div';
function addGalaSettings() {
	var settings_panel = '<table><tbody><tr><td>Скрывать кнопки разметки:</td><td id="hide-buttons-panel">'+ addMarkupButtons('menu') +'</td></tr>' +
	'<tr><td>Живые ссылки:</td><td class="menubuttons"><label><input onclick="setlSValue(\'LiveLinks\', this.checked ? true : false)" '+ (!getlSValue('LiveLinks', true) ? '' : 'checked') +' type="checkbox" name="disable_ll" value=""><span>&Xi;</span></label></td></tr>'+
	'<tr><td>Размер видеоплеера:</td><td><input onchange="setVSize(this)" min="1" value="'+ getVSize('value') +'" step="1" max="4" type="range" name="v_size"><span id="vsize-textbox">('+getVSize('text')+')</span></td></tr></tbody></table>';
	return settings_panel;
}
function setlSValue(name, value, sess) {
	var stor = sess ? sessionStorage : localStorage;
	if (typeof name === "object") {
		for (var key in name) {
			stor.setItem(key, name[key]);
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
String.prototype.allReplace = function(obj) {
	var retStr = this;
	for (var x in obj) {
		retStr = retStr.replace(new RegExp(x, 'g'), obj[x])
	}
	return retStr
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

(function() {
	hideMarkupButton = function(e) {
		var val = e.value, r = getlSValue(val)
			x = document.getElementById(val);
		if (!r) {
			if (x) x.setAttribute('style', '');
			setlSValue(val, true);
		} else {
			if (x) x.setAttribute('style', 'display:none');
			setlSValue(val, false);
		}
	}
	addMarkupButtons = function(type) {
		var chk, mbuttons, mbutton_tamplate;
		if (type === 'menu') {
			chk = 'checked',
			mbutton_tamplate = '<span class="menubuttons"><label><input onclick="hideMarkupButton(this)" type="checkbox" r{x} name="hide_r{v}" value="r{v}"><span title="r{T}" >r{N}</span></label></span>';
		} else {
			chk = 'display:none', mbutton_tamplate = '<span class="markup-button" id="r{v}" onclick="r{t}Tag(\'r{n}\')" style="r{x}" title="r{T}">'+
				(type === 'text' ? '<a href="#" onclick="return false;">r{N}</a></span>&nbsp;\|&nbsp;' : '<input value="r{N}" type="button"></span>');
		}
		mbuttons = mbutton_tamplate.allReplace({'r{n}': 'b',  'r{N}': 'B', 'r{v}': 'bold',   'r{t}': 'html',  'r{T}': 'Жирный',         'r{x}': (getlSValue('bold', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'i',  'r{N}': 'i',    'r{v}': 'italic',     'r{t}': 'html',  'r{T}': 'Курсивный',      'r{x}': (getlSValue('italic', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'u',  'r{N}': 'U',    'r{v}': 'underline',  'r{t}': 'html',  'r{T}': 'Подчеркнутый',   'r{x}': (getlSValue('underline', true) ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 's',  'r{N}': 'S',    'r{v}': 'strike',     'r{t}': 'html',  'r{T}': 'Зачеркнутый',    'r{x}': (getlSValue('strike', true)    ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'spoiler %%', 'r{N}': '%%', 'r{v}': 'spoiler', 'r{t}': 'ins', 'r{T}': 'Спойлер',       'r{x}': (getlSValue('spoiler', true)   ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'code 		', 'r{N}': 'C',  'r{v}': 'code',    'r{t}': 'ins', 'r{T}': 'Код',           'r{x}': (getlSValue('code', true)      ? '' : chk)}) +
			mbutton_tamplate.allReplace({'r{n}': 'rp •', 'r{N}': 'RP',  'r{v}': 'roleplay',  'r{t}': 'ins',   'r{T}': 'Ролеплей',       'r{x}': (getlSValue('rp', true)        ? '' : chk)}) +
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
			markedText = cont === null ? selected + s + OdT : !cont[2] ? cont[1] + OdT : cont[1] + cont[2] + s + OdT;
		}
		$setup(textArea, {'class': 'ta-inact', 'value': val.substring(0, start) + markedText + val.substring(end)}, {
			'click': function(e) { this.removeAttribute('class') }
		});
		textArea.focus();
		eOfs = markedText.length, sOfs = '';
		if (openTag == '[spoiler]' || openTag == '[code]' || openTag == '[rp]' || cont && !cont[2] && !dice && !ql) {
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
	parseLinks = function(el) {
		var iframe = '<iframe r{wh} frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen';
		var href = escapeUrl(el.href);
		var EXT = href.split('.').pop().toLowerCase();
		var VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v'];
		var AF = ["flac", "alac", "wav", "m4a", "m4r", "aac", "ogg", "mp3"];
		var IF = ["jpeg", "jpg", "png", "svg", "gif"];
		var P = getlSValue('LiveLinks'), endpoint, regex, embed, fav, i = 1, type = 'video';
		/********* HTML5 Video *********/
		if (VF.indexOf(EXT) >= 0) {
			embed = '<video r{wh} controls="true" poster=""><source src="$1"></source></video>';
			P = attachFile(el, 'video', embed);
		}
		/********* HTML5 Audio *********/
		if (AF.indexOf(EXT) >= 0) {
			embed = '<video width="300" height="150" controls="" poster="/test/src/139957920577.png"><source src="$1"></source></video>';
			P = attachFile(el, 'audio', embed);
		}
		/********* Image File *********/
		if (IF.indexOf(EXT) >= 0) {
			var name = getElementName(href);
			var fShN = name.length > 17 ? name.substring(0, 17) + '...' : name;
			embed = '<img style="border:medium none;cursor:pointer" src="$1" class="thumb" alt="'+ name +'" width="290" onclick="this.setAttribute(\'width\', this.getAttribute(\'width\') == \'290\' ? \'85%\' : \'290\')" >';
			P = attachFile(el, 'image', embed);
		}
		/************************** SoundCloud *************************/
		if (href.indexOf("soundcloud.com/") >= 0) {
			if (el.nextElementSibling.tagName === 'BR') el.nextElementSibling.remove();
			var sc = $(el);
			$(el).closest(postNode).find('.postcontent').append(sc);
			$(sc).addClass("sc-player").scPlayer();
		}
		/*************************** Простоплеер **************************/
		if (href.indexOf("pleer.com/tracks/") >= 0) {
			$(el).html(function(i, html) {
				var regex = /(?:https?:)?\/\/(?:www\.)?pleer\.com\/tracks\/([\w_-]*)/g;
				var embed = '<embed class="prosto-pleer" width="410" height="40" type="application/x-shockwave-flash" src="http://embed.pleer.com/track?id=$1"></embed>';
				return html.replace(regex, embed);
			}).replaceWith(function() {
				return $('<object/>', {
					class: 'pleer-track',
					html: this.innerHTML
				});
			});
		}
		/************************* YouTube *************************/
		if (href.indexOf("youtu") >= 0) {
			embed = iframe + ' src="//www.youtube.com/embed/$1$3?$2$4&autohide=1&wmode=opaque&enablejsapi=1&theme=light&html5=1&rel=0&start=$5">';
			if (href.indexOf("youtube.com") >= 0)
				regex = /(?:https?:)?\/\/(?:www\.)?youtube\.com\/(?:watch|playlist)\?.*?(?:v=([\w_-]*)|(list=[\w_-]*))(?:.*?v=([\w_-]*)|.*?(list=[\w_-]*)+)?(?:.*?t=(\d+))?/g;
			if (href.indexOf("youtu.be") >= 0) {
				regex = /(?:https?:)?\/\/(?:www\.)?youtu\.be\/([\w_-]*)\?(list=[\w_-]*)?(?:.*?t=([\w_-]*))?/g;
			}
			if (href.indexOf("playlist?") >= 0)
				i = 2;
			fav = '//youtube.com/favicon.ico'; P = true;
		}
		/************************** Vimeo **************************/
		if (href.indexOf("vimeo") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?vimeo\.com\/(?:.*?\/)?(\d+)(?:.*?t=(\d+))?/g;
			embed = iframe + ' src="//player.vimeo.com/video/$1?badge=0&color=ccc5a7#t=$2"></iframe>';
			fav = '//f.vimeocdn.com/images_v6/favicon_32.ico'; P = true;
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
		/************************* Яндекс.Видео *************************/
		if (href.indexOf("video.yandex.ru/users/") >= 0) {
			if ((/\/view\/(\d+)/).exec(href)) {
				oEmbedMedia('http://video.yandex.ru/oembed.json?url=', "//yastatic.net/islands-icons/_/ScXmk_CH9cCtdXl0Gzdpgx5QjdI.ico", el, 2, 'video', /(.+)/, '');
				P = false;
			}
		}
		/************************* VK.com ************************/
		if (href.indexOf("vk.com/video") >= 0) {
			regex = /(?:https?:)?\/\/vk\.com\/video(?:_ext\.php\?oid=)?(\d+)(?:&id=|_)(\d+).?(hash=[\w_-]*)?(.*?hd=-?\d+)?(.*?t=[\w_-]*)?/g;
			embed = iframe +' src="http://vk.com/video_ext.php?oid=$1&id=$2&$3$4$5">';
			el.setAttribute('href', href.replace(regex, 'https://vk.com/video$1_$2?$3$4$5'));
			i = 3; P = true;
		}
		/************************* Pastebin *************************/
		if (href.indexOf("pastebin.com/") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:pastebin\.com)\/([\w_-]*)/g;
			embed = '<iframe style="width:98%;height:100%;resize:none" frameborder="0" src="http://pastebin.com/embed_js.php?i=$1">';
			fav = '/test/src/140593041526.png';
			type = 'pastebin'; P = true;
		}
		/************************* Custom iframe ************************/
		if (href.indexOf("/iframe/") >= 0 || href.indexOf("/embed/") >= 0) {
			regex = /(.+)/g;
			embed =  iframe +' src="'+ href +'">';
			el.setAttribute("href", href.replace(/embed\//, "").replace(/be\.com/, ".be"));
			i = 0; P = true;
		}
		/****************************************************************/
		if (el.textContent.indexOf('>>') >= 0 || P === false) {
			return;
		}
		var m = !regex ? '' : regex.exec(href);
		if (!m || !m[i]) {
			oEmbedMedia('', '', el, 0, '', '', '');
		} else {
			oEmbedMedia(endpoint, fav, el, 1, type, regex, embed);
		}
	}
	loadMediaContainer = function (obj, type, regex, embed) {
		var src = obj.getAttribute("src");
		var csEl = type+'-container';
		var idEl = type +'_'+ btoa(getElementName(src));
		var cont = '<div class="'+csEl+'" id="'+idEl+'" >'+src+'</div>';
		var contEl = document.getElementsByClassName(csEl)[0];
		if (!contEl || contEl.id != idEl) {
			if (contEl)
				contEl.remove();
			if (type == 'video' || type == 'image') {
				var rp = $(obj).closest(postNode);
				rp.find('.postcontent').prepend(cont);
			} else {
				$(obj).before(cont);
			}
			$('.'+ csEl).html(function(i, html) {
				return html.replace(regex, embed.replace('r{wh}', getVSize('html')));
			});
		} else if (contEl.id == idEl) {
			contEl.remove();
		}
	}
	oEmbedMedia = function (endpoint, fav, obj, arg, type, regex, embed) {
		var mediaUrl = escapeUrl(obj.href);
		var $obj = obj;
		endpoint = !endpoint ? 'http://api.embed.ly/1/oembed?url=' : endpoint;
		$.getJSON(endpoint + mediaUrl + '&format=json', function(data) {
			if (data) {
				var loc = getLocation(mediaUrl),
					slnk = ['tinyurl.com', 'bit.ly', 'goo.gl'],
					host = slnk.indexOf(loc.hostname) >= 0 ? data.provider_url : loc.hostname,
					icon = !fav ? '//www.google.com/s2/favicons?domain='+ host : fav,
					name = !data.title ? getElementName(mediaUrl) +'&nbsp;&middot;&nbsp;❨'+ data.provider_name +'❩' : escapeHtml(data.title).replace(/\ -\ YouTube/, "").replace(/\ -\ Pastebin\.com/, "");
				if (arg == 0 && data.html && data.type != "link")
					arg = 2;
				$($obj).replaceWith(function() {
					if (arg > 0) {
						var src = mediaUrl;
					} else {
						var href = mediaUrl;
					} return $('<a/>', {
						rel: "nofollow",
						class: 'cm-link',
						title: host == 'pastebin.com' ? data.description.split(' | ').pop() : escapeHtml(data.description),
						style: 'background:url('+ icon +')left / 16px no-repeat',
						html: '<u style="margin-left:20px">'+ name +'</u>',
						href: href,
						src: src
					}).on("click", function() {
						if (arg == 1)
							loadMediaContainer(this, type, regex, embed);
						if (arg == 2)
							loadMediaContainer(this, data.type, /(.+)/g, data.html);
					});
				});
			}
		}).fail(function() {
			$(obj).attr('target', "_blank");
		});
	}
	setVSize = function (slider) {
		var p = slider.value;
		function size(w, h) {
			var played = document.querySelector('.video-container > iframe');
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
		function getElName(a) {
			return a.substring(a.lastIndexOf("/") + 1);
		};
		function slcElName(a) {
			var s = a.slice(0, -1);
			return getElName(s);
		};
		var elName = getElName(elUrl) == '' ? slcElName(elUrl) : getElName(elUrl);
		return decodeURIComponent(elName);
	}
	attachFile = function(obj, type, embed) {
		var mediaUrl = escapeUrl(obj.href);
		tryUrl(mediaUrl, function() {
			var result = this.getResponseHeader('content-type');
			if (!result) {
				var fileName = getElementName(mediaUrl);
				$(obj).html('<u style="margin-left:20px;">'+ (type === 'image' ? 'Expand: ' : 'Play: ') + fileName +'</u>').attr({
					src: mediaUrl,
					class: 'cm-link',
					style: 'background:url(/test/src/'+ (type === 'image' ? '140896790568.png' : '139981404639.png') +')left / 16px no-repeat'
				}).removeAttr('href');
				obj.onclick = function() {
					loadMediaContainer(this, type, /(.+)/g, embed);
				}
			} else
				oEmbedMedia('', '', obj, 0, '', '', '');
		});
		return false;
	}
	tryUrl = function(url, Fn) {
		var http = new XMLHttpRequest();
		http.open('HEAD', url, true);
		http.send(null);
		http.onreadystatechange = Fn;
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
		var a = document.createElement("a");
		a.href = url;
		return a;
	}
	//-- Derpibooroo Reverse Search 
	revSearch = function(el) {
		var imgSrc = $(el).attr('src');
		$('<form method="post" action="https://derpibooru.org/search/reverse" target="_blank" enctype="multipart/form-data" hidden><input id="url" name="url" type="text" value="'+imgSrc+'"><input id="fuzziness" name="fuzziness" type="text" value="0.25"></form>').appendTo('body').submit().remove();
	}
	insertListener = function(event){
		if (event.animationName == "load") {
			var et = event.target,
				etp = et.parentNode,
				dnb = etp.querySelector('span[id^="dnb-"]');
			if (etp.id === 'de-txt-panel') {
				textArea = document.getElementById('msgbox');
				var mbp = $setup('span', {'id': 'markup-buttons-panel', 'html': addMarkupButtons(et.querySelector('.de-abtn') ? 'text' : 'btn')}, null);
				if (etp.lastChild.id != 'markup-buttons-panel')
					etp.appendChild(mbp);
			} else if ($(et).is('.de-imgmenu')) {
				et.insertAdjacentHTML('beforeend', '<a class="de-menu-item de-imgmenu de-src-derpibooru" onclick="revSearch(this);return false;" src="'+ (/url\=(.+)/).exec(et.lastChild.href)[1] +'" target="_blank">Поиск по Derpibooru</a>');
			} else {
				if (dnb && etp.tagName !== 'DIV' && dnb.nextElementSibling.tagName !== 'BR')
					dnb.insertAdjacentHTML('afterend', '<br>');
				$(etp).find('a[href$=".webm"]:not(.filesize > a[href$=".webm"], blockquote > a[href$=".webm"])').replaceWith(function() {
					var file = this.href;
					var vtag = '<video class="webm" '+ getVSize('html') +' controls="true" poster=""><source src="'+ file +'"></source></video>';
					return $(vtag);
				});
				for(i = 0, a = et.querySelectorAll('a[href*="pleer.com/tracks/"], a[href$=".jpg"], a[href$=".png"], a[href$=".gif"], a[href$=".mp3"] '); link = a[i++];) {
					parseLinks(link, '')
				}
				setTimeout(function() {
					if (!etp.querySelector('.postcontent'))
						et.insertAdjacentHTML('beforebegin', '<span class="postcontent"></span>');
					for(i = 0, a = et.querySelectorAll('a[href*="//"]:not(.cm-link):not(.de-video-link):not([target="_blank"])'); link = a[i++];) {
						parseLinks(link, '');
					}
				}, 700)
			}
		}
	}
	
	var pfx = ["webkit", "moz", "MS", "o", ""];
	// animation listener events
	PrefixedEvent("AnimationStart", insertListener);
	PrefixedEvent("AnimationIteration", insertListener);
	PrefixedEvent("AnimationEnd", insertListener);
	// apply prefixed event handlers
	function PrefixedEvent(type, callback) {
		for (var p = 0; p < pfx.length; p++) {
			if (!pfx[p]) type = type.toLowerCase();
			document.addEventListener(pfx[p]+type, callback, false);
		}
	}
})();
