/* 
			«Gala the Boardscript»
	: Special for Ponyach imageboard
	: based on friendscripts https://github.com/OpenA/Friendscripts/tree/master/Ponyach
	: version 0.9
								© magicode
	
*/
(function() {
	var postNode = 'td.reply, td.highlight, div[de-post]';
	addMarkupButtons = function(val) {
		var textArea = $('textarea#msgbox[name="message"]');
		if (val == 2) {
			b = '<a href="#" onclick="return false;" style="font-size:13px;text-decoration:none">';
			e = '</a></span>\ \|\ ';
		} else {
			b = '<input value="';
			e = '" type="button"></span>';
		}
		var c = 'class="markup-button"'
		$('#de-txt-panel').html('<span class="markup-buttons-panel">'+
			'<span '+c+' id="bold"    onclick="htmlTag(\'b\')"              title="Жирный">'        +b+'B'  +e+
			'<span '+c+' id="italic"  onclick="htmlTag(\'i\')"              title="Курсивный">'     +b+'i'  +e+
			'<span '+c+' id="u"       onclick="htmlTag(\'u\')"              title="Подчеркнутый">'  +b+'U'  +e+
			'<span '+c+' id="strike"  onclick="htmlTag(\'s\')"              title="Зачеркнутый">'   +b+'S'  +e+
			'<span '+c+' id="spoiler" onclick="insTag(\'spoiler\', \'%%\')" title="Спойлер">'       +b+'%%' +e+
			'<span '+c+' id="code"    onclick="insTag(\'code\', \'\	\')"    title="Код">'           +b+'C'  +e+
			'<span '+c+' id="sup"     onclick="htmlTag(\'sup\')"            title="Верхний индекс">'+b+'Sup'+e+
			'<span '+c+' id="sub"     onclick="htmlTag(\'sub\')"            title="Нижний индекс">' +b+'Sub'+e+
			'<span '+c+' id="attent"  onclick="wmarkTag(\'!!\')"            title="!Attention">'    +b+'!A' +e+
			'<span '+c+' id="roll"    onclick="wmarkTag(\'##\')"            title="#roll">'         +b+'#R' +e+
			'<span '+c+' id="quote"   onclick="qlTag(\'>\')"                title="Цитировать">'    +b+'\>' +e+
			'</span>');
		markText = function(openTag, closeTag) {
			var len = textArea.val().length;
			var end = textArea[0].selectionEnd;
			var start = textArea[0].selectionStart;
			var selected = textArea.val().substring(start, end);
			cont = new RegExp(/^(\s*)(.*?)(\s*)$/gm).exec(selected);
			textArea.addClass('ta-inact').on('click', function() {
				$(this).removeAttr('class');
			});
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
			textArea.val(
				textArea.val().substring(0, start) + markedText + textArea.val().substring(end)
			).focus();
			sOfs = '';
			eOfs = markedText.length;
			if (openTag == '[spoiler]' || openTag == '[code]' || cont[2] == '' && openTag != '##' && closeTag.slice(0, 1) != '\n') {
				sOfs = openTag.length;
				eOfs = sOfs + selected.length;
			} else if (openTag == '##')
				sOfs = eOfs - 1;
			textArea[0].setSelectionRange(start + sOfs, start + eOfs);
			$(window).on('keypress', function() {
				if (textArea.is('.ta-inact')) {
					textArea[0].setSelectionRange(textArea[0].selectionEnd, textArea[0].selectionEnd);
					textArea.removeAttr('class');
				} else
					return;
			});
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
			var s = textArea.val().substring(0, textArea[0].selectionStart);
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
	addEmbedPlayers = function(el, wh) {
		var embedly = 'http://api.embed.ly/1/oembed?url=';
		var icoSizeS = 'padding:0 16px 0 0;margin:0 4px;background:url(', icoSizeE = ')left / 16px no-repeat;cursor:pointer;';
		var iframe = '<iframe '+wh+' frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen';
		var fext = el.href.split('.').pop();
		/********* HTML5 Video *********/
		if (fext == "webm" || fext == "ogv" || fext == "ogm" || fext == "mp4" || fext == "m4v") {
			$(el).each(function() {
				getFileName(icoSizeS+"/test/src/139981404639.png"+icoSizeE, this);
			}).on("click", function() {
				var embed = '<video '+wh+' controls="true" poster=""><source src="$1"></source></video>';
				loadVideoContainer(/(.+)/g, embed, this);
			});
		}
		/********* HTML5 Audio *********/
		if (fext == "flac" || fext == "alac" || fext == "wav" || fext == "m4a" || fext == "m4r" || fext == "aac" || fext == "ogg" || fext == "mp3") {
			$(el).each(function() {
				getFileName(icoSizeS+"/test/src/139981404639.png"+icoSizeE, this);
			}).on("click", function() {
				$('div.audio-container').remove();
				var link = $(this).attr("src");
				$(this).before('<div class="audio-container" style="margin:5px 0;position:relative;cursor:pointer;z-index:2;"><video width="300" height="150" controls="" poster="/test/src/139957920577.png"><source src="'+link+'"></source></video></div>');
			});
		}
		/************************** SoundCloud *************************/
		if (el.href.contains("soundcloud.com/")) {
			$(el).each(function() {
				var sc = $(this);
				$(this).closest(postNode).find('.postcontent').append(sc);
				$(sc).addClass("sc-player").scPlayer();
			});
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
		}
		/******************** YouTube (playlist) ********************/
		if (el.href.contains("youtube.com/playlist?")) {
			$(el).each(function() {
				getMediaName(embedly, icoSizeS+"//youtube.com/favicon.ico"+icoSizeE, this);
			}).on("click", function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com)\/(?:playlist)\?(?:(list=[\w_-]*))/g;
				var embed = iframe + ' src="http://www.youtube.com/embed/?$1&autohide=1&wmode=opaque&enablejsapi=1&html5=1"></iframe>';
				loadVideoContainer(regex, embed, this);
			});
		}
		/************************** Vimeo *************************/
		if (el.href.contains("vimeo.com/")) {
			$(el).each(function() {
				getMediaName('http://vimeo.com/api/oembed.json?url=', icoSizeS+"http://f.vimeocdn.com/images_v6/favicon_32.ico"+icoSizeE, this);
			}).on("click", function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?(?:vimeo\.com).*?\/(\d+)/g;
				var embed = iframe + ' src="//player.vimeo.com/video/$1"></iframe>';
				loadVideoContainer(regex, embed, this);
			});
		}
		/************************** Coub *************************/
		if (el.href.contains("coub.com/view/")) {
			$(el).each(function() {
				getMediaName(embedly, icoSizeS+"http://coub.com/favicon.ico"+icoSizeE, this);
			}).on("click", function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?(?:coub\.com)\/(?:view)\/([\w_-]*)/g;
				var embed = iframe + '="true" src="http://coub.com/embed/$1?muted=false&amp;autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false"></iframe>';
				loadVideoContainer(regex, embed, this);
			});
		}
		/************************* RuTube *************************/
		if (el.href.contains("rutube.ru/video/")) {
			$(el).each(function() {
				getMediaName(embedly, icoSizeS+"http://rutube.ru/static/favicon.ico"+icoSizeE, this);
			}).on("click", function() {
				var regex = /(?:https?:)?\/\/(?:www\.)?(?:rutube\.ru)\/(?:video)\/([\w_-]*)\/?/g;
				var embed = iframe + ' src="http://rutube.ru/video/embed/$1?autoStart=false&isFullTab=true&skinColor=22547a"></iframe>';
				loadVideoContainer(regex, embed, this);
			});
		}
		/************************* Яндекс.Видео *************************/
		if (el.href.contains("video.yandex.ru/users/")) {
			var yv_oembed = 'http://video.yandex.ru/oembed.json?url=';
			$('a[href*="//video.yandex.ru/users/"]').each(function() {
				getMediaName(yv_oembed, icoSizeS+"http://yastatic.net/lego/_/Uk8wMlO6kp7jGPt0n6rTPeL77QE.ico"+icoSizeE, this);
			}).on("click", function() {
				var $this = this;
				$.getJSON(yv_oembed + $(this).attr('src') + '&format=json', function(data) {
					loadVideoContainer(/(.+)/g, data.html, $this);
				});
			});
		}
		/************************* VK.com ************************/
		if (el.href.contains("vk.com/video")) {
			$(el).each(function() {
				var regex = /(\d+)(?:&id=|_)(\d+).?(hash=[\w_-]*)?/g;
				var url = cleanUrl(this.href);
				var m = regex.exec(url);
				if (m == null || m[3] == null) {
					return;
				} else {
					var mediaUrl = 'https://vk.com/video'+m[1]+'_'+m[2]+'?'+m[3];
					var embedUrl = 'http://vk.com/video_ext.php?oid='+m[1]+'&id='+m[2]+'&'+m[3];
					$(this).attr("href", mediaUrl);
					getMediaName(embedly, icoSizeS+"//www.google.com/s2/favicons?domain=vk.com"+icoSizeE, this);
					$(this).on("click", function() {
						loadVideoContainer(/(.+)/g, iframe + ' src="' + embedUrl +'"></iframe>', this);
					});
				}
			});
		}
		/************************* Pastebin *************************/
		if (el.href.contains("pastebin.com/")) {
			$(el).each(function() {
				getMediaName(embedly, icoSizeS+"//www.google.com/s2/favicons?domain=pastebin.com"+icoSizeE, this);
			}).on("click", function(event) {
				var prev = $(this).parent().find('div#pastebin');
				if (prev.is('#pastebin')) {
					$(prev).remove();
				} else {
					var link = $(this).attr("src");
					var regex = /(?:https?:)?\/\/(?:www\.)?(?:pastebin\.com)\/([\w_-]*)/g;
					var embed = '<iframe style="width:98%;height:100%" frameborder="0" src="http://pastebin.com/embed_js.php?i=$1"></iframe>'
					$(this).before($('<div id="pastebin" style="z-index:2;overflow:auto;resize:both;background-color:white">'+ link +'</div>').html(function(i, html) {
						return html.replace(regex, embed);
					}));
				}
			});
		}
	}
	getMediaName = function (endpoint, provider, obj) {
		var mediaUrl = $(obj).attr("href");
		var $obj = obj;
		$.getJSON(endpoint + mediaUrl + '&format=json', function(data) {
			$($obj).html('<u style="margin-left:20px;">' + data.title + '</u>');
		});
		$(obj).attr({
			src: mediaUrl,
			style: provider
		}).removeAttr("href");
	}
	getFileName = function (file, obj) {
		var mediaUrl = obj.href;
		var fileName = mediaUrl.substring(mediaUrl.lastIndexOf('/') + 1);
		$(obj).html('<u style="margin-left:20px;"> Play: ' + decodeURIComponent(fileName) + '</u>').attr({
			src: mediaUrl,
			style: file
		}).removeAttr("href");
	}
	loadVideoContainer = function (regex, embed, obj) {
		$('div.video-container').remove();
		var link = $(obj).attr("src");
		var vcnt = '<div class="video-container" style="display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2;"></div>';
		$(obj).closest(postNode).find('.postcontent').prepend(vcnt);
		$('.video-container').html(link.replace(regex, embed));
	}
	addYTWList = function (yl, el, vt, wh, hd) {
		if (vt == 2) {
			vt = '1';
		}
		var regex = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com)\/(?:watch|playlist)\?.*?(?:v=([\w_-]*)|(list=[\w_-]*))(?:.*?v=([\w_-]*)|.*?(list=[\w_-]*)+)?(?:.*?t=(\d+))?/g;
		var embed = '<iframe '+wh+' frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen src="//www.youtube.com/embed/$1$3?$2$4&autohide=1&wmode=opaque&enablejsapi=1&html5='+vt+'&hd='+hd+'&start=$5"></iframe>';
		$(el).html(yl[0].replace(regex, embed));
	}
	insets = function(post) {
		if (!post)
			post = 'td.reply';
		else if ($(post).is('div[de-post]'))
			return;
		$('div[de-post] > a[href$=".webm"], td.reply > a[href$=".webm"]').replaceWith(function() {
			var file = this.href;
			var vtag = '<video width="360" height="270" controls="true" poster="" style="display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2;"><source src="'+file+'"></source></video>';
			return $(vtag);
		});
		$('div[de-post]').each(function() {
			var $op = $(this);
				$op.find('blockquote').before('<span class="postcontent"></span>');
				$op.find('.de-ytube-obj').attr('style', "display:inline-block");
		});
		$(post).each(function() {
			var $t = $(this);
			var fix = localStorage.getItem('moco-modifications');
			if (!fix || fix.search("Dast") < 0)
				$t.prepend('<div class="postheader"></div>').find('label, .reflink, .de-ppanel, .extrabtns, span[id^="dnb-"]').appendTo($t.find('.postheader'));
			$t.find('a[href$=".webm"]:not(.filesize > a[href$=".webm"], blockquote > a[href$=".webm"])').replaceWith(function() {
				var file = this.href;
				var vtag = '<video width="360" height="270" controls="true" poster="" style="display:inline-block;background-color:black;margin:0 9px;margin-bottom:5px;position:relative;cursor:pointer;z-index:2;"><source src="'+file+'"></source></video>';
				return $(vtag);
			});
			$t.find('blockquote').before('<span class="postcontent"></span>');
			$t.find('.de-ytube-obj').attr('style', "display:inline-block");
			$t.find('br:nth-child(3):not(blockquote > br)').remove();
			$t.attr('ins', "");
		});
	}
	//-- Clean Zero whitespaces and invalid characters (like ") from Url Links
	cleanUrl = function(url) {
		var curl = encodeURI(url).replace(/%E2%80%8B/gi, "").replace(/%3Cb%3E/gi, "").replace(/%22/gi, "");
		return decodeURI(curl);
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
})();
