/* 
			«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 1.2.00
								© magicode
	
*/
var style = document.createElement("style");
style.textContent = 'blockquote:before, #de-txt-panel:before, .de-menu.de-imgmenu:before{content:"";-webkit-animation:load .3s;animation:load .3s}\
.de-video-obj,.postcontent{position:relative;display:inline-block!important}.cm-link{padding:0 16px 0 0;margin:0 4px;cursor:pointer}\
.pastebin-container{overflow:auto;resize:both;background-color:#fefefe}.pastebin-container body{color:transparent}\
.webm, .video-container{display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2}\
.audio-container{margin:5px 0;position:relative;cursor:pointer;z-index:2}\
.markup-button a{font-size:13px;text-decoration:none}span[de-bb]{display:none!important}\
.de-src-derpibooru:before{content:"";padding:0 16px 0 0;margin:0 4px;background-image:url(/test/src/140903588031.png)}\
.ta-inact::-moz-selection{background:rgba(99,99,99,.3)}.ta-inact::selection{background:rgba(99,99,99,.3)}\
@keyframes load{\
	0% {opacity:0}\
}\
@-webkit-keyframes load{\
	0% {opacity:0}\
}';
document.head.appendChild(style);
(function() {
	if (getlSValue('mLinks') === undefined) setlSValue('mLinks', true);
	var postNode = 'td.reply, td.highlight, .pstnode[de-thread] > div',
		wh = 'width="360" height="270"';
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
		var c = 'class="markup-button"'
		el.insertAdjacentHTML('beforeend', '<span id="markup-buttons-panel">'+
			'<span '+c+' id="bold"    onclick="htmlTag(\'b\')"              title="Жирный">'        +b+'B'  +e+
			'<span '+c+' id="italic"  onclick="htmlTag(\'i\')"              title="Курсивный">'     +b+'i'  +e+
			'<span '+c+' id="u"       onclick="htmlTag(\'u\')"              title="Подчеркнутый">'  +b+'U'  +e+
			'<span '+c+' id="strike"  onclick="htmlTag(\'s\')"              title="Зачеркнутый">'   +b+'S'  +e+
			'<span '+c+' id="spoiler" onclick="insTag(\'spoiler\', \'%%\')" title="Спойлер">'       +b+'%%' +e+
			'<span '+c+' id="code"    onclick="insTag(\'code\', \'    \')"  title="Код">'           +b+'C'  +e+
			'<span '+c+' id="sup"     onclick="htmlTag(\'sup\')"            title="Верхний индекс">'+b+'Sup'+e+
			'<span '+c+' id="sub"     onclick="htmlTag(\'sub\')"            title="Нижний индекс">' +b+'Sub'+e+
			'<span '+c+' id="attent"  onclick="wmarkTag(\'!!\')"            title="!Attention">'    +b+'!A' +e+
			'<span '+c+' id="roll"    onclick="wmarkTag(\'##\')"            title="#roll">'         +b+'#R' +e+
			'<span '+c+' id="quote"   onclick="qlTag(\'>\')"                title="Цитировать">'    +b+'\>' +e+
			'</span>');
		markText = function(openTag, closeTag) {
			var len = textArea.value.length;
			var end = textArea.selectionEnd;
			var start = textArea.selectionStart;
			var selected = textArea.value.substring(start, end);
			cont = new RegExp(/^(\s*)(.*?)(\s*)$/gm).exec(selected);
			if (closeTag.slice(0, 1) == '\n')
				markedText = openTag + (start === end ? window.getSelection().toString() : selected).replace(/\n/gm, closeTag);
			else if (cont == null && openTag != '##')
				markedText = openTag + (start === end ? window.getSelection().toString() : selected) + closeTag;
			else if (closeTag.slice(1, 2) == '/')
				markedText = openTag + selected + closeTag;
			else if (openTag == '##') {
				if (isNaN(cont[2]))
					markedText = cont[1] + cont[2] + ' ' + openTag + '1d2' + closeTag + cont[3];
				else if (cont[2] == '')
					markedText = cont[1] + openTag + '1d2' + closeTag + cont[3];
				else
					markedText = cont[1] + openTag + '1d' + cont[2] + closeTag + cont[3];
			} else
				markedText = cont[1] + openTag + cont[2] + closeTag + cont[3];
			textArea.value = textArea.value.substring(0, start) + markedText + textArea.value.substring(end);
			textArea.className = 'ta-inact';
			textArea.focus();
			sOfs = '';
			eOfs = markedText.length;
			if (openTag == '[spoiler]' || openTag == '[code]' || cont != null && cont[2] == '' && openTag != '##' && closeTag.slice(0, 1) != '\n') {
				sOfs = openTag.length;
				eOfs = sOfs + selected.length;
			} else if (openTag == '##')
				sOfs = eOfs - 1;
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
			markText('['+tag+']', '[/'+tag+']');
		}
		wmarkTag = function(tag) {
			markText(tag, tag);
		}
		qlTag = function(tag) {
			markText(tag+' ', '\n'+tag+' ');
		}
		insTag = function(htag, wtag) {
			count = function (string, substring) { return string.split (substring).length - 1 };
			var s = textArea.value.substring(0, textArea.selectionStart);
			var active = count (s, '['+htag+']') <= count (s, '[/'+htag+']');
			if (active)
				htmlTag(htag);
			else if (!active) {
				if (htag == 'code')
					qlTag(wtag);
				else
					wmarkTag(wtag);
			}
		}
	}
	
	parseLinks = function(el) {
		var iframe = '<iframe '+wh+' frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen';
		var href = escapeUrl(el.href);
		var EXT = href.split('.').pop().toLowerCase();
		var VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v'];
		var AF = ["flac", "alac", "wav", "m4a", "m4r", "aac", "ogg", "mp3"];
		var IF = ["jpeg", "jpg", "png", "svg", "gif"];
		var P = getlSValue('mLinks'), endpoint, regex, embed, fav, i = 1, type = 'video';
		/********* HTML5 Video *********/
		if (VF.indexOf(EXT) != -1) {
			embed = '<video '+wh+' controls="true" poster=""><source src="$1"></source></video>';
			P = attachFile(el, 'video', embed);
		}
		/********* HTML5 Audio *********/
		if (AF.indexOf(EXT) != -1) {
			embed = '<video width="300" height="150" controls="" poster="/test/src/139957920577.png"><source src="$1"></source></video>';
			P = attachFile(el, 'audio', embed);
		}
		/********* Image File *********/
		if (IF.indexOf(EXT) != -1) {
			var name = getElementName(href);
			var fShN = name.length > 17 ? name.substring(0, 17) + '...' : name;
			embed = '<img style="border:medium none;cursor:pointer" src="$1" class="thumb" alt="'+ name +'" width="290" onclick="this.setAttribute(\'width\', this.getAttribute(\'width\') == \'290\' ? \'85%\' : \'290\')" >';
			P = attachFile(el, 'image', embed);
		}
		/************************** SoundCloud *************************/
		if (href.indexOf("soundcloud.com/") != -1) {
			if (el.nextElementSibling.tagName === 'BR') el.nextElementSibling.remove();
			var sc = $(el);
			$(el).closest(postNode).find('.postcontent').append(sc);
			$(sc).addClass("sc-player").scPlayer();
		}
		/*************************** Простоплеер **************************/
		if (href.indexOf("pleer.com/tracks/") != -1) {
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
		if (href.indexOf("youtube.com/playlist?") != -1) {
			regex = /(?:https?:)?\/\/(?:www\.)?youtube\.com\/playlist\?(list=[\w_-]*)/g;
			embed = iframe + ' src="//www.youtube.com/embed/?$1&autohide=1&wmode=opaque&enablejsapi=1&html5=1&rel=0">';
			fav = '//youtube.com/favicon.ico';
		}
		/************************** Coub *************************/
		if (href.indexOf("coub.com/view/") != -1) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:coub\.com)\/(?:view)\/([\w_-]*)/g;
			embed = iframe +'="true" src="http://coub.com/embed/$1?muted=false&amp;autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false">';
			fav = "//coub.com/favicon.ico";
		}
		/************************* RuTube *************************/
		if (href.indexOf("rutube.ru/video/") != -1) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:rutube\.ru)\/(?:video)\/([\w_-]*)\/?/g;
			embed = iframe +' src="http://rutube.ru/video/embed/$1?autoStart=false&isFullTab=true&skinColor=22547a">';
			fav = "//rutube.ru/static/img/btn_play.png";
		}
		/************************* Яндекс.Видео *************************/
		if (href.indexOf("video.yandex.ru/users/") != -1) {
			if ((/\/view\/(\d+)/).exec(href)) {
				oEmbedMedia('http://video.yandex.ru/oembed.json?url=', "//yastatic.net/islands-icons/_/ScXmk_CH9cCtdXl0Gzdpgx5QjdI.ico", el, 2, 'video', /(.+)/, '');
				P = false;
			}
		}
		/************************* VK.com ************************/
		if (href.indexOf("vk.com/video") != -1) {
			regex = /(?:https?:)?\/\/vk\.com\/video(?:_ext\.php\?oid=)?(\d+)(?:&id=|_)(\d+).?(hash=[\w_-]*)?(.*?hd=-?\d+)?(.*?t=[\w_-]*)?/g;
			embed = iframe +' src="http://vk.com/video_ext.php?oid=$1&id=$2&$3$4$5">';
			el.setAttribute('href', href.replace(regex, 'https://vk.com/video$1_$2?$3$4$5'));
			i = 3;
		}
		/************************* Pastebin *************************/
		if (href.indexOf("pastebin.com/") != -1) {
			regex = /(?:https?:)?\/\/(?:www\.)?(?:pastebin\.com)\/([\w_-]*)/g;
			embed = '<iframe style="width:98%;height:100%;resize:none" frameborder="0" src="http://pastebin.com/embed_js.php?i=$1">';
			fav = '/test/src/140593041526.png';
			type = 'pastebin';
		}
		/************************* Custom iframe ************************/
		if (href.indexOf("/iframe/") != -1 || href.indexOf("/embed/") != -1) {
			regex = /(.+)/g;
			embed =  iframe +' src="'+ href +'">';
			el.setAttribute("href", href.replace(/embed\//, ""));
			i = 0;
		}
		/****************************************************************/
		if ($(el).text().contains('>>') || P === false) {
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
					host = slnk.indexOf(loc.hostname) != -1 ? data.provider_url : loc.hostname,
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
			if (et.id === 'de-txt-panel') {
				addMarkupButtons(et);
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
	document.addEventListener("animationstart", insertListener, false); // standard + firefox
	document.addEventListener("webkitAnimationStart", insertListener, false); // Chrome + Safari
})();
