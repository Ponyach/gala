/* 
			«Gala the Boardscript»
	: Special for Ponyach imageboard
	: based on friendscripts https://github.com/OpenA/Friendscripts/tree/master/Ponyach
	: version 1.0
								© magicode
	
*/
var style = document.createElement("style");
style.textContent = 'blockquote, #de-txt-panel, .de-menu.de-imgmenu{animation:load .6s;-webkit-animation:load .6s}\
.de-video-obj{display:inline-block!important}.cm-link{padding:0 16px 0 0;margin:0 4px;cursor:pointer}\
.pastebin-container{overflow:auto;resize:both;background-color:#fefefe;}\
.webm, .video-container{display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2}\
.audio-container{margin:5px 0;position:relative;cursor:pointer;z-index:2}\
.markup-button a{font-size:13px;text-decoration:none}span[de-bb]{display:none!important}\
.de-src-derpibooru:before{content:"";padding:0 16px 0 0;margin:0 4px;background-image:url(/test/src/140903588031.png)}\
@keyframes load{\
	0% {opacity:0}\
}\
@-webkit-keyframes load{\
	0% {opacity:0}\
}';
document.head.appendChild(style);
(function() {
	var postNode = 'td.reply, td.highlight, div[de-post]',
		wh = 'width="360" height="270"';
	String.prototype.contains = function(s, i) {
		return this.indexOf(s, i) != -1;
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
		var EXT = el.href.split('.').pop().toLowerCase();
		var VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v'];
		var AF = ["flac", "alac", "wav", "m4a", "m4r", "aac", "ogg", "mp3"];
		var IF = ["jpeg", "jpg", "png", "svg", "gif"];
		/********* HTML5 Video *********/
		if (VF.indexOf(EXT) != -1) {
			$(el).each(function() {
				attachFile(this);
			}).on("click", function() {
				var embed = '<video '+wh+' controls="true" poster=""><source src="$1"></source></video>';
				loadMediaContainer(this, 'video', /(.+)/g, embed);
			});
			return true;
		}
		/********* HTML5 Audio *********/
		if (AF.indexOf(EXT) != -1) {
			$(el).each(function() {
				attachFile(this);
			}).on("click", function() {
				var embed = '<video width="300" height="150" controls="" poster="/test/src/139957920577.png"><source src="$1"></source></video>';
				loadMediaContainer(this, 'audio', /(.+)/g, embed);
			});
			return true;
		}
		/********* Image File *********/
		if (IF.indexOf(EXT) != -1) {
			$(el).each(function() {
				attachFile(this, 'img');
			}).on("click", function() {
				var name = getElementName(this.getAttribute('src'));
				var fShN = name.length > 17 ? name.substring(0, 17) + '...' : name;
				var embed = '<img style="border:medium none;cursor:pointer" src="$1" class="thumb" alt="'+ name +'" width="200" onclick="this.setAttribute(\'width\', this.getAttribute(\'width\') == \'200\' ? \'85%\' : \'200\')" >';
				loadMediaContainer(this, 'image', /(.+)/g, embed);
			});
			return true;
		}
		/************************** SoundCloud *************************/
		if (el.href.contains("soundcloud.com/")) {
			$(el).each(function() {
				var sc = $(this);
				$(this).closest(postNode).find('.postcontent').append(sc);
				$(sc).addClass("sc-player").scPlayer();
			});
			return true;
		}
		/*************************** Простоплеер **************************/
		if (el.href.contains("pleer.com/tracks/")) {
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
			return true;
		}
		/******************** YouTube (playlist) ********************/
		if (el.href.contains("youtube.com/playlist?")) {
			$(el).each(function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?youtube\.com\/playlist\?(list=[\w_-]*)/g;
				var embed = iframe + ' src="//www.youtube.com/embed/?$1&autohide=1&wmode=opaque&enablejsapi=1&html5=1&rel=0">';
				if (!regex.exec(this.href)[1]) {
					return false;
				} else {
					oEmbedMedia('', '//youtube.com/favicon.ico', this, 1, 'video', regex, embed);
					return true;
				}
			});
		}
		/************************** Coub *************************/
		if (el.href.contains("coub.com/view/")) {
			$(el).each(function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?(?:coub\.com)\/(?:view)\/([\w_-]*)/g;
				var embed = iframe +'="true" src="http://coub.com/embed/$1?muted=false&amp;autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false">';
				if (!regex.exec(this.href)[1]) {
					return false;
				} else {
					oEmbedMedia('', "//coub.com/favicon.ico", this, 1, 'video', regex, embed);
					return true;
				}
			});
		}
		/************************* RuTube *************************/
		if (el.href.contains("rutube.ru/video/")) {
			$(el).each(function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?(?:rutube\.ru)\/(?:video)\/([\w_-]*)\/?/g;
				var embed = iframe +' src="http://rutube.ru/video/embed/$1?autoStart=false&isFullTab=true&skinColor=22547a">';
				if (!regex.exec(this.href)[1]) {
					return false;
				} else {
					oEmbedMedia('', "//rutube.ru/static/img/btn_play.png", this, 1, 'video', regex, embed);
					return true;
				}
			});
		}
		/************************* Яндекс.Видео *************************/
		if (el.href.contains("video.yandex.ru/users/")) {
			$(el).each(function() {
				if (!(/(\/view\/)/).exec(this.href)[1]) {
					return false;
				} else {
					oEmbedMedia('http://video.yandex.ru/oembed.json?url=', "//yastatic.net/islands-icons/_/ScXmk_CH9cCtdXl0Gzdpgx5QjdI.ico", this, 2, 'video', /(.+)/, '');
					return true;
				}
			});
		}
		/************************* VK.com ************************/
		if (el.href.contains("vk.com/video")) {
			$(el).each(function() {
				var regex = /(\d+)(?:&id=|_)(\d+).?(hash=[\w_-]*)?.?(hd=\d+)?.?(t=\d+)?/g;
				var url = escapeUrl(this.href);
				var m = regex.exec(url);
				if (m == null || m[3] == null) {
					return false;
				} else {
					var mediaUrl = 'https://vk.com/video'+m[1]+'_'+m[2]+'?'+m[3]+'&'+m[4]+'&'+m[5];
					var embed = iframe +' src="http://vk.com/video_ext.php?oid='+m[1]+'&id='+m[2]+'&'+m[3]+'&'+m[4]+'&'+m[5]+'">';
					$(this).attr("href", mediaUrl);
					oEmbedMedia('', '', this, 1, 'video', /(.+)/, embed);
					return true;
				}
			});
		}
		/************************* Pastebin *************************/
		if (el.href.contains("pastebin.com/")) {
			$(el).each(function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?(?:pastebin\.com)\/([\w_-]*)/g;
				var embed = '<iframe style="width:98%;height:100%;resize:none" frameborder="0" src="http://pastebin.com/embed_js.php?i=$1">';
				if (!regex.exec(this.href)[1]) {
					return false;
				} else {
					oEmbedMedia('', '/test/src/140593041526.png', this, 1, 'pastebin', regex, embed);
					return true;
				}
			});
		}
		/************************* Custom iframe ************************/
		if (el.href.contains("/iframe/") || el.href.contains("/embed/")) {
			$(el).each(function() {
				var embedUrl = this.href;
				var mediaUrl = embedUrl.replace(/embed\//, "");
				var embed =  iframe +' src="'+ embedUrl +'">';
				$(this).attr("href", mediaUrl);
				oEmbedMedia('', '', this, 1, 'video', /(.+)/g, embed);
			});
			return true;
		}
		/****************************************************************/
		if (el.textContent.contains('>>'))
			return true;
	}
	loadMediaContainer = function (obj, type, regex, embed) {
		var src = $(obj).attr("src");
		var csEl = type+'-container';
		var idEl = type +'_'+ getElementName(src);
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
		endpoint = endpoint === '' ? 'http://api.embed.ly/1/oembed?url=' : endpoint;
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
	attachFile = function(obj, type) {
		var mediaUrl = escapeUrl(obj.href);
		var fileName = getElementName(mediaUrl);
		$(obj).html('<u style="margin-left:20px;">'+ (type === 'img' ? 'Expand: ' : 'Play: ') + fileName +'</u>').attr({
			src: mediaUrl,
			class: 'cm-link',
			style: 'background:url(/test/src/'+ (type === 'img' ? '140896790568.png' : '139981404639.png') +')left / 16px no-repeat'
		}).removeAttr('href');
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
	var insertListener = function(event){
		if (event.animationName == "load") {
			var et = event.target,
				etp = et.parentNode,
				dnb = etp.querySelector('span[id^="dnb-"]');
			if (et.id === 'de-txt-panel') {
				addMarkupButtons(et);
			} else if ($(et).is('.de-imgmenu')) {
				$(et).append('<a class="de-menu-item de-imgmenu de-src-derpibooru" onclick="revSearch(this);return false;" src="'+ (/url\=(.+)/).exec(et.lastChild.href)[1] +'" target="_blank">Поиск по Derpibooru</a>');
			} else {
				for(i = 0, a = et.querySelectorAll('a[href*="pleer.com/tracks/"]'); link = a[i++];) {
					parseLinks(link, '')
				}
				setTimeout(function(){
					if (!etp.querySelector('.postcontent'))
						$(et).before('<span class="postcontent"></span>');
					if (dnb && etp.tagName !== 'DIV' && dnb.nextElementSibling.tagName !== 'BR')
						$(dnb).after('<br>');
					$(etp).find('a[href$=".webm"]:not(.filesize > a[href$=".webm"], blockquote > a[href$=".webm"])').replaceWith(function() {
						var file = this.href;
						var vtag = '<video class="webm" '+wh+' controls="true" poster=""><source src="'+ file +'"></source></video>';
						return $(vtag);
					});
					for(i = 0, a = et.querySelectorAll('a[href*="//"]:not(.cm-link):not(.de-video-link):not([target="_blank"])'); link = a[i++];) {
						if (parseLinks(link, '') !== true)
							oEmbedMedia('', '', link, 0, '', '', '');
					}
				}, 200)
			}
		}
	}
	document.addEventListener("animationstart", insertListener, false); // standard + firefox
	document.addEventListener("webkitAnimationStart", insertListener, false); // Chrome + Safari
})();
