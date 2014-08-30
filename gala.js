/* 
			«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 1.2.10
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
@keyframes load{\
	50% {opacity:0}\
}\
@-webkit-keyframes load{\
	50% {opacity:0}\
}';
document.head.appendChild(style);
(function() {
	var postNode = 'td.reply, td.highlight, .pstnode[de-thread] > div',
		wh = 'width="360" height="270"';
	hideMarkupButton = function(e) {
		var val = e.value,
			x = document.getElementById(val),
			h = 'display:none'
			r = getlSValue(val, function() {
				setlSValue(val, '');
				return '';
			});
		if (!r) {
			if (x)
				x.setAttribute('style', h);
			setlSValue(val, h);
		} else {
			if (x)
				x.setAttribute('style', '');
			setlSValue(val, '');
		}
	}
	addMenuButtons = function() {
		var a = '<span class="menubuttons"><label><input onclick="hideMarkupButton(this)" type="checkbox" name="hide_', s = '<span>', sls = '</span></label></span>';
		var buttons = '<div class="hide-buttons-menu">'+
			a +'b" '+ (!getlSValue('bold', '')      ? 'checked' : '') +' value="bold">     '+s+'B'   +sls+
			a +'i" '+ (!getlSValue('italic', '')    ? 'checked' : '') +' value="italic">   '+s+'i'   +sls+
			a +'u" '+ (!getlSValue('underline', '') ? 'checked' : '') +' value="underline">'+s+'U'   +sls+
			a +'s" '+ (!getlSValue('strike', '')    ? 'checked' : '') +' value="strike">   '+s+'S'   +sls+
			a +'sp"'+ (!getlSValue('spoiler', '')   ? 'checked' : '') +' value="spoiler">  '+s+'%%'  +sls+
			a +'c" '+ (!getlSValue('code', '')      ? 'checked' : '') +' value="code">     '+s+'C'   +sls+
			a +'up"'+ (!getlSValue('sup', '')       ? 'checked' : '') +' value="sup">      '+s+'Sup' +sls+
			a +'sb"'+ (!getlSValue('sub', '')       ? 'checked' : '') +' value="sub">      '+s+'Sub' +sls+
			a +'a" '+ (!getlSValue('attent', '')    ? 'checked' : '') +' value="attent">   '+s+'!A'  +sls+
			a +'d" '+ (!getlSValue('dice', '')      ? 'checked' : '') +' value="dice">     '+s+'#D'  +sls+
			a +'q" '+ (!getlSValue('quote', '')     ? 'checked' : '') +' value="quote">    '+s+'&gt;'+sls+
			'</div>';
		return buttons;
	}
	addMarkupButtons = function(el) {
		var textArea = document.getElementById('msgbox');
		if (el.lastChild.id === 'markup-buttons-panel')
			el.lastChild.remove();
		if (el.querySelector('.de-abtn')) {
			b = '<a href="#" onclick="return false;">';
			e = '</a></span>&nbsp;\|&nbsp;';
		} else {
			b = '<input value="';
			e = '" type="button"></span>';
		}
		var c = '<span class="markup-button"'
		el.insertAdjacentHTML('beforeend', '<span id="markup-buttons-panel">'+
			c+' id="bold"      onclick="htmlTag(\'b\')"              style="'+getlSValue('bold', '')      +'" title="Жирный">'        +b+'B'  +e+
			c+' id="italic"    onclick="htmlTag(\'i\')"              style="'+getlSValue('italic', '')    +'" title="Курсивный">'     +b+'i'  +e+
			c+' id="underline" onclick="htmlTag(\'u\')"              style="'+getlSValue('underline', '') +'" title="Подчеркнутый">'  +b+'U'  +e+
			c+' id="strike"    onclick="htmlTag(\'s\')"              style="'+getlSValue('strike', '')    +'" title="Зачеркнутый">'   +b+'S'  +e+
			c+' id="spoiler"   onclick="insTag(\'spoiler\', \'%%\')" style="'+getlSValue('spoiler', '')   +'" title="Спойлер">'       +b+'%%' +e+
			c+' id="code"      onclick="insTag(\'code\', \'    \')"  style="'+getlSValue('code', '')      +'" title="Код">'           +b+'C'  +e+
			c+' id="sup"       onclick="htmlTag(\'sup\')"            style="'+getlSValue('sup', '')       +'" title="Верхний индекс">'+b+'Sup'+e+
			c+' id="sub"       onclick="htmlTag(\'sub\')"            style="'+getlSValue('sub', '')       +'" title="Нижний индекс">' +b+'Sub'+e+
			c+' id="attent"    onclick="wmarkTag(\'!!\')"            style="'+getlSValue('attent', '')    +'" title="!Attention">'    +b+'!A' +e+
			c+' id="dice"      onclick="wmarkTag(\'##\')"            style="'+getlSValue('dice', '')      +'" title="#dice">'         +b+'#D' +e+
			c+' id="quote"     onclick="qlTag(\'>\')"                style="'+getlSValue('quote', '')     +'" title="Цитировать">'    +b+'\>' +e+
			'</span>');
		markText = function(openTag, closeTag, type) {
			var regex = /^(\s*)(.*?)(\s*)$/;
			var len = textArea.value.length;
			var end = textArea.selectionEnd;
			var start = textArea.selectionStart;
			var selected = textArea.value.substring(start, end);
			var getext = start === end ? window.getSelection().toString() : selected;
			var wmark = type === 'wmark';
			var dice = openTag === '##';
			var html = type === 'html';
			var ql = type === 'ql';
			cont = regex.exec(selected);
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
			textArea.value = textArea.value.substring(0, start) + markedText + textArea.value.substring(end);
			textArea.className = 'ta-inact';
			textArea.focus();
			sOfs = '';
			eOfs = markedText.length;
			if (openTag == '[spoiler]' || openTag == '[code]' || cont && !cont[2] && !dice && !ql) {
				sOfs = openTag.length;
				eOfs = sOfs + selected.length;
			}
			if (dice)
				sOfs = eOfs;
			textArea.setSelectionRange(start + sOfs, start + eOfs);
			textArea.onclick = function() { this.removeAttribute('class') }
			window.onkeypress = function() {
				if (textArea.getAttribute('class') == 'ta-inact') {
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
		insTag = function(htag, wtag) {
			count = function (string, substring) { return string.split (substring).length - 1 };
			var s = textArea.value.substring(0, textArea.selectionStart);
			var active = count (s, '['+htag+']') <= count (s, '[/'+htag+']');
			!active ? (htag === 'code' ? qlTag(wtag) : wmarkTag(wtag)) : htmlTag(htag);
		}
	}
	
	parseLinks = function(el) {
		var iframe = '<iframe '+wh+' frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen';
		var href = escapeUrl(el.href);
		var EXT = href.split('.').pop().toLowerCase();
		var VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v'];
		var AF = ["flac", "alac", "wav", "m4a", "m4r", "aac", "ogg", "mp3"];
		var IF = ["jpeg", "jpg", "png", "svg", "gif"];
		var P = getlSValue('mLinks', true), endpoint, regex, embed, fav, i = 1, type = 'video';
		/********* HTML5 Video *********/
		if (VF.indexOf(EXT) >= 0) {
			embed = '<video '+wh+' controls="true" poster=""><source src="$1"></source></video>';
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
		/******************** YouTube (playlist) ********************/
		if (href.indexOf("youtube.com/playlist?") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?youtube\.com\/playlist\?(list=[\w_-]*)/g;
			embed = iframe + ' src="//www.youtube.com/embed/?$1&autohide=1&wmode=opaque&enablejsapi=1&html5=1&rel=0">';
			fav = '//youtube.com/favicon.ico';
		}
		/************************** Coub *************************/
		if (href.indexOf("coub.com/view/") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:coub\.com)\/(?:view)\/([\w_-]*)/g;
			embed = iframe +'="true" src="http://coub.com/embed/$1?muted=false&amp;autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false">';
			fav = "//coub.com/favicon.ico";
		}
		/************************* RuTube *************************/
		if (href.indexOf("rutube.ru/video/") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:rutube\.ru)\/(?:video)\/([\w_-]*)\/?/g;
			embed = iframe +' src="http://rutube.ru/video/embed/$1?autoStart=false&isFullTab=true&skinColor=22547a">';
			fav = "//rutube.ru/static/img/btn_play.png";
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
			i = 3;
		}
		/************************* Pastebin *************************/
		if (href.indexOf("pastebin.com/") >= 0) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:pastebin\.com)\/([\w_-]*)/g;
			embed = '<iframe style="width:98%;height:100%;resize:none" frameborder="0" src="http://pastebin.com/embed_js.php?i=$1">';
			fav = '/test/src/140593041526.png';
			type = 'pastebin';
		}
		/************************* Custom iframe ************************/
		if (href.indexOf("/iframe/") >= 0 || href.indexOf("/embed/") != -1) {
			regex = /(.+)/g;
			embed =  iframe +' src="'+ href +'">';
			el.setAttribute("href", href.replace(/embed\//, ""));
			i = 0;
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
				return html.replace(regex, embed);
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
	function getlSValue(name, def) {
		if (name in localStorage) {
			var v = localStorage.getItem(name);
			v = v == 'false' ? false : 
				v == 'true' ? true : v;
			return v;
		} else return def;
	}
	function setlSValue(name, value) {
		localStorage.setItem(name, value)
	}
	insertListener = function(event){
		if (event.animationName == "load") {
			var et = event.target,
				etp = et.parentNode,
				dnb = etp.querySelector('span[id^="dnb-"]');
			if (etp.id === 'de-txt-panel') {
				addMarkupButtons(etp);
			} else if ($(et).is('.de-imgmenu')) {
				et.insertAdjacentHTML('beforeend', '<a class="de-menu-item de-imgmenu de-src-derpibooru" onclick="revSearch(this);return false;" src="'+ (/url\=(.+)/).exec(et.lastChild.href)[1] +'" target="_blank">Поиск по Derpibooru</a>');
			} else {
				if (dnb && etp.tagName !== 'DIV' && dnb.nextElementSibling.tagName !== 'BR')
					dnb.insertAdjacentHTML('afterend', '<br>');
				$(etp).find('a[href$=".webm"]:not(.filesize > a[href$=".webm"], blockquote > a[href$=".webm"])').replaceWith(function() {
					var file = this.href;
					var vtag = '<video class="webm" '+wh+' controls="true" poster=""><source src="'+ file +'"></source></video>';
					return $(vtag);
				});
				for(i = 0, a = et.querySelectorAll('a[href*="pleer.com/tracks/"], a[href$=".jpg"], a[href$=".png"], a[href$=".gif"], a[href$=".mp3"] '); link = a[i++];) {
					parseLinks(link, '')
				}
				setTimeout(function(){
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
