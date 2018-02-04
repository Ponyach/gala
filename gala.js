/* 
	«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 4.0.1
	© magicode
*/
var _z = _z();

// основные настройки пользователя
var MAIN_SETTINGS = JSON.parse(localStorage.getItem('main_settings'));

if (MAIN_SETTINGS === null) {
	// общие настройки по умолчанию
	MAIN_SETTINGS = {
		'require_modules': [],
		'userposts_hide': [],
		'dollchanScript_enable': 1,
		'snowStorm_enable': 0,
		'snowStorm_freeze': 0,
		'fixedHeader_enable': 0,
		'UploadRating_default': '',
		'show_de-thread-buttons': 0,
		'show_doubledash': 0,
		'hide_file_multi': 0,
		'hide_roleplay'  : 0,
		'ctrlenoff': 0,
		'keymarks' : 1,
		'cm_image': 0,
		'cm_video': 1,
		'cm_audio': 1,
		'cm_docs': 1
	}
	
	localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
}
// уведомления о новых тредах и постах
var DATA_NOTS = JSON.parse(localStorage.getItem('data_nots')) || { init: true };
// распознавание тач-ориентированных устройств
var IS_TOUCH_DEVICE = 'dast_enable' in MAIN_SETTINGS ? MAIN_SETTINGS['dast_enable'] : 'ontouchstart' in window;

var LOCATION_PATH = parseBoardURL(location.href); // то find { board: w, thread: n, page: n, etc }

var PONY_RATE = { 9: 'S', 10: 'C', 11: 'A', '': 'N' };

var VALID_FILE_TYPES = /video\/webm|image\/(?:jpeg|jpg|png|gif)/i // for the /regexp/.test(file_mime)

var MAX_FILE = {
	SIZE: {
		default: 30000000, // b, and other else
		'r34': 30582912,
		'd': 20000000,
		get: function(b) { return b in this ? this[b] : this.default }
	},
	COUNT: {
		default: 5, // b, r34 and other else
		'test': 20,
		'd': 2,
		get: function(b) { return b in this ? this[b] : this.default }
	}
}
// этот стиль лучше бы перенести в глобальный css
var EXT_STYLE = _z.setup('style', { text: '#tellwhohide { font-size: small; margin-top: 1em; } #tellwhohide > * { display: inline-block; padding: 0 4px;  border: 1px solid; cursor: default; margin: 0 4px 2px 0; border-radius: 3px; } #tellwhohide > *:hover { text-decoration: none; } .post-menu { list-style: outside none none; padding: 0; z-index: 9999; border: 1px solid grey; position: absolute; } .post-menu-item { padding: 3px 10px; font: 13px arial; white-space: nowrap; cursor: pointer; } .post-menu-item:hover { background-color: #222; color: #fff; } .textbutton { cursor: pointer; text-decoration: none; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } .filesize, .file-booru { font-size: .8em; } .file-area-empty + .file-area-empty, .file-area-empty ~ .file-area-empty, .file-booru > *:not(.modal-btn) { display: none; } .file-area + .file-area-empty { display: block!important; } #file_error { position: absolute; left: 0; bottom: 0; background-color: rgba(0,0,0,.3); width: 100%; } #file_error > .e-msg { color: brown; padding: 4px 8px; } .idb-selected { margin: 1px; border: 4px solid #5c0; } .modal { z-index: 100!important; } .de-pview { z-index: 98!important; } .pre-sample { display: inline-block; width: 120px; height: 120px; text-align: center; float: left; margin: 2px 5px; } .file-booru:before { content: attr(rate) attr(title); width: 500px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; vertical-align: middle; display: inline-block; } #dbaskkey ~ *, .de-rpiStub + *, [hidden] { display: none!important; } .modal-btn { width: 16px; height: 16px; display: inline-block; margin-left: 6px; } .de-rpiStub + * + .de-file, .de-rpiStub { display: inline-block!important; } .de-rpiStub { width: 90px; height: 90px; margin: 1px; } .modal-btn, .pre-sample, .de-rpiStub { background: transparent no-repeat top center / 100%; } .post-files > .filesize { margin-left: 10px; } .de-file:after { content: "\xA0"; white-space: pre-line; } .de-rpiStub:before { content: "R:\xA0"; } .de-rpiStub:before, .de-rpiStub:after { font-size: .8em; color: white; }'});

Object.defineProperty(window, 'isCaptchaNeeded', {
	value: function(/* no, yes */) {
		var exec = arguments;
		$GET('/recaptchav2.php?c=isnd', function() {
			(exec = exec[this.responseText]) instanceof Function && exec();
		});
	}
});

!(function() {
	// это изолированное пространство, функции и переменные которые здесь указываем не будут видны левым скриптам (кроме тех что выносим принудительно через window.funct = )
	
	var toggleHeaderOnTop, used_style, postform, old_response, passcode_refresh, _PONY, _HiP = [], t_int = 15, recapt2,
		trashObj = {parentNode:'stb',fn:function(){}}, de_rpiChange = trashObj.fn;
	
	var _BlobStor = [];
	var _SHA512   = [];
	var _DelBtn   = {};
	var _FileArea = {};
	
	var _Count = {
		__m: {}, origTitle: {},
		set: function(desk, display_name, title) {
			var _m = this.__m[desk];
			for (var key in _m) {
				_m[key].textContent = display_name;
				_m[key].title = title;
			}
		},
		get: function(desk, prop) {
			var _m = this.__m[desk];
			for (var key in _m) {
				return _m[key][prop];
			}
		}
	};
		
	// проверяем включена ли кукла в настройках
	if (MAIN_SETTINGS['dollchanScript_enable']) {
		
		// загружаем настройки куклы
		var DESU_Config = localStorage.getItem('DESU_Config');
		
		// если настроек нет, значит требуется первичная инициализация
		if (DESU_Config === null) {
		
			DESU_Config = {};
		
			// создаем наши параметры по умолчанию (сюда можно дописывать любой параметр из возможных, кукла их подхватывает)
			var deParams = {
				captchaLang: 1,
				replyWinDrag: 1,
				replyWinX: 'right: 0',
				replyWinY: 'top: 0',
				textaWidth: 500,
				textaHeight: 240,
				updThrDelay: 20,
				webmVolume: 50,
				linksOut: 300,
				postSameImg: 0,
				removeEXIF: 0,
				spacedQuote: 0,
				favOnReply: 0,
				txtBtnsLoc: 0,
				updScript: 0,
				addMP3: 0
			}
			// подгон плавающей формы по ширине (ширина текстового поля + примерный размер отступов по краям)
			if (window.innerWidth <= deParams.textaWidth + 40) {
				deParams.textaWidth = window.innerWidth - 40;
			} else
				deParams.replyWinX = 'left: '+ Math.floor((window.innerWidth - deParams.textaWidth) / 2 * 100) / 100 +'px';
			// подгон плавающей формы по высоте (высота текстового поля + примерно еще столько же занимают прочие поля вверху и внизу)
			if (window.innerHeight <= deParams.textaHeight * 2) {
				deParams.textaHeight = 100;
			} else
				deParams.replyWinY = 'top: '+ Math.floor((window.innerHeight - deParams.textaHeight) / 2 * 100) / 100 +'px';
			// настройки куклы привязаны к хосту
			DESU_Config[location.host] = deParams;
			// записываем наш конфиг в локальное хранилище
			localStorage.setItem('DESU_Config', JSON.stringify(DESU_Config));
		}
		// собираем куклоскрипт  ~  добавляем на страницу
		document.head.appendChild( _z.setup('script', {
			type : 'text/javascript',
			src  : window.boardscript_ver }, {
			load : function(e) {
		/* Сюда можно поместить то, что необходимо выполнить после загрузки куклы.
		  @note: следует помнить что кукла работает асинхронными методами и срабатывание этого события не значит что она уже полностью отработала,
		         однако все обработчики (напр. $DOMReady) которые мы здесь укажем, уже гарантированно будут добавлены и запущены после кукловых.
		*/
				$DOMReady(function() {
					// регестрируем функции в API куклоскрипта
					window.postMessage('de-request-api-message', '*');
					
					var dbTHMB  = {},
						deFiles = document.getElementsByClassName('de-file'),
						deWHead = document.getElementsByClassName('de-win-head')[0];
					
						deWHead.prepend( passcode_up, dbpic_vi );
						
					EXT_STYLE.append(
						'.modal-btn[for="modal-1"] { left: 20px; position: absolute; }'+
						'.modal-btn[for="modal-2"] { left: 0; position: absolute; }' );
						
					de_rpiChange = function(k, src, title, rate) {
						if (deFiles.length > 0) {
							if (!dbTHMB[k]) {
								dbTHMB[k] = document.createElement('div');
							}
							if (src) {
								dbTHMB[k].style['background-image'] = 'url('+ src +')';
								dbTHMB[k].title = title;
								dbTHMB[k].className = 'de-rpiStub '+ PONY_RATE[rate];
								deFiles[k - 1].parentNode.insertBefore(dbTHMB[k], deFiles[k - 1]);
							} else
								dbTHMB[k].remove();
						}
					}
				});
			}
		}));
	} else {
		// действия которые с включенной куклой делать не требуется
		$DOMReady(function() {
			// check highlight
			if (location.hash) {
				var reply = document.getElementById('reply'+ location.hash.substring(1));
				if (reply) {
					reply.scrollIntoView({ block: 'start', behavior: 'smooth' });
					if (!reply.classList.contains('oppost')) {
						reply.classList.add('highlight');
					}
				}
			}
			// вставляем имя пользователя и адресс почты в поля формы
			if ('postform' in document.forms) {
				postform = document.forms.postform;
				
				postform.elements['message'].onkeydown = function(e) {
					if (!MAIN_SETTINGS['ctrlenoff'] && (e.keyCode == 10 || e.keyCode == 13) && (e.ctrlKey || e.altKey)) {
						postform.submit();
					}
				}
				postform.elements['upload-image-1'].parentNode.append( passcode_up, dbpic_vi );
				// добавляем поле редактирования
				postform.elements['msgbox'].parentNode.appendChild(
					markup_buttons).className       = 'buttons-style-text';
					markup_buttons.style['display'] = 'block';
			}
			if (_PONY) {
				_PONY.genRefmap();
			}
			// на случай если подключена внешняя кукла - регестрируемся в ней
			window.postMessage('de-request-api-message', '*');
		});
		
		if (!MAIN_SETTINGS['ponymapoff']) {
			// востановленные понирефлинки, попытка сделать универсальный интерфейсм всплывающих окон для устройств с тачем и десктопа
			var handler = 'ontouchstart' in window ? {
				over: 'ontouchstart', out: 'ontouchend', down: 'ontouchstart' } : {
				over: 'onmouseenter', out: 'onmouseleave', down: 'onmousedown'
			};
			
			_PONY = {
				zIndex: 3, scrollTop: [], scrollBot: [], showDelay: null,
				clearPopups: function(popup) {
					popup.parentNode.removeAttribute('style');
					popup.classList.remove('PONY_popup');
					popup.onmousedown = popup.style['max-width'] = popup.style['z-index'] = popup.style['left'] = popup.style['top'] = null;
					popup.PONY_buttons.hidden = true;
				},
				openPopup: function(e) {
					e.preventDefault();
					
					var lnk = e.target;
					var map = e.target.className.split('|');
					var reply = document.getElementById('reply'+ map[3]);
					
					if (reply) {
						
						var rect = reply.getBoundingClientRect(),
							rWidth = 'width' in rect ? rect.width : rect.right - rect.left,
							rHeight = 'height' in rect ? rect.height : rect.top - rect.bottom,
							isOutScrn = reply.classList.contains('PONY_popup') || (
								(rect.x + rWidth) < 0 || (rect.y + rHeight) < 0 ||
								(rect.x > window.innerWidth || rect.y > window.innerHeight)
							);
						
						if (isOutScrn) {
							clearTimeout(_PONY.showDelay);
							
							_PONY.showDelay = setTimeout(function() {
							
								if (!reply.classList.contains('PONY_popup')) {
									var elemY = reply.parentNode.getBoundingClientRect().y + pageYOffset;
								
									reply.parentNode.setAttribute('style', 'display: block; padding-top: '+ rHeight +'px');
									reply.classList.add('PONY_popup');
								
									if (pageYOffset < elemY) {
										_PONY.scrollBot.push({ y: Math.round(elemY - window.innerHeight), target: reply });
									} else {
										_PONY.scrollTop.push({ y: Math.round(elemY + rHeight), target: reply });
									}
								
									reply[handler.down] = function() {
										this.style['z-index'] = (_PONY.zIndex++);
									}
								
									if (!reply.PONY_buttons) {
										reply.PONY_buttons = reply.appendChild(_z.setup('div', { html: '<div title="Убрать" class="clos-pop this-popup"></div><div title="Убрать все" class="clos-pop all-popups"></div>', 
											class: 'PONY_buttons'
										},{ click: function(e) {
											switch (e.target.className) {
												case 'clos-pop all-popups':
													$forEachClass('PONY_popup', _PONY.clearPopups);
													_PONY.zIndex = 3;
													break;
												case 'clos-pop this-popup':
													_PONY.clearPopups(reply);
											}
										}}));
									} else
										reply.PONY_buttons.hidden = false;
								}
								
								var pageW = document.documentElement.clientWidth;
								var pageH = document.documentElement.clientHeight;
								var lnkRect = lnk.getBoundingClientRect(),
									lnkTop = Math.round(lnkRect.top),
									fullH = reply.clientHeight,
									offsetX = Math.round(lnkRect.left + pageXOffset + lnk.offsetWidth / 2),
									offsetY = lnkTop + pageYOffset,
									Yd = Math.round(fullH / 3),
									isTop = Yd + lnkTop < pageH && map[0] === 'bot' ||
											Yd * -1 > lnkTop - fullH || pageYOffset === 0 && fullH > lnkTop,
									left = offsetX < Math.round(pageW / 3) ? offsetX : offsetX - Math.min(rWidth, offsetX - 10);
								
								reply.style['max-width'] = (pageW - left - 10) +'px';
								reply.style['z-index']   = _PONY.zIndex++;
								reply.style['left']      = left +'px';
								reply.style['top']       = (isTop ? offsetY + lnk.offsetHeight : offsetY - fullH) +'px';
							
							}, 400);
							
							lnk[handler.out] = function() {
								clearTimeout(_PONY.showDelay);
							}
						} else {
							reply.classList.add('PONY_backlight');
							lnk[handler.out] = function() {
								reply.classList.remove('PONY_backlight');
							}
						}
					}
				},
				genRefmap: function() {
					var refs = document.querySelectorAll('a[class^="ref|"]');
					var maps = {};
					
					for (var i = 0, length = refs.length; i < length; i++) {
						var to = refs[i].className.split('|'),
							data = { diffboard: to[1] !== LOCATION_PATH.board },
							from = (function(ref, dat) {
								while (!(dat.from = ref.getAttribute('data-num')))
									ref = ref.parentNode;
							})(refs[i].parentNode.parentNode.parentNode, data);
							
						(maps[to[3]] || (maps[to[3]] = new Array(0))).push(data);
						
						refs[i].className = 'top|'+ to[1] +'|'+ to[2] +'|'+ to[3];
						refs[i][handler.over] = _PONY.openPopup;
					}
					for (var id in maps) {
						var reply = document.getElementById('reply'+ id);
						if (reply) {
							if (!reply.PONY_refmap) {
								reply.PONY_refmap = reply.querySelector('.post-body').appendChild(document.createElement('div'));
								reply.PONY_refmap.className = 'PONY_refmap';
							}
							maps[id].forEach(function(map) {
								var pony_ref = reply.PONY_refmap.appendChild(document.createElement('a'));
									pony_ref.textContent = '>>'+ (map.diffboard ? LOCATION_PATH.board +'/'+ map.from : map.from);
									pony_ref.className = 'bot|'+ LOCATION_PATH.board +'||'+ map.from;
									pony_ref.href = '#'+ map.from;
									pony_ref[handler.over] = _PONY.openPopup;
									pony_ref.onclick = function(e) { scrollHighlight(e, map.from); }
							});
						}
					}
				},
				css: EXT_STYLE.appendChild(document.createTextNode('.PONY_refmap { margin: 1em 4px 0; font: 80% mlp-font; } .PONY_refmap > a { text-decoration: none; } .PONY_refmap > a:before { color: grey; cursor: default; } .PONY_refmap > a + a:before { content: ","; margin-right: 4px; } .PONY_refmap:before { content: "Ответы:"; margin-right: 4px; } .PONY_backlight, .oppost.PONY_popup { background: cornsilk; color: darkolivegreen; } .PONY_popup { position: absolute; display: block; } .PONY_buttons { clear: both; } .clos-pop { cursor: pointer; display: inline-block; padding: 5px; margin: 0 5px; background: no-repeat center / 100%; } .all-popups {background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiM2NjYiIGQ9Ik0zMS4xNSAyOC45OGwtMi41IDIuNS0xMy4wMi0xMy4wMkwyLjYgMzEuNDhsLTIuNDgtMi41IDEzLjAyLTEzLjAyTC4xMiAyLjk0IDIuNi40NWwxMy4wMyAxMy4wM0wyOC42NS40NWwyLjUgMi40OS0xMy4wMiAxMy4wMiAxMy4wMiAxMy4wMnoiLz48Y2lyY2xlIGN4PSIxNS45MSIgY3k9IjE1LjkxIiByPSIxMSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjMiLz48L2c+PC9zdmc+)} .this-popup {background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSIjNjY2IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zMi4xODggMzJoLTQuNTcyTDE2LjE4OCAyMC43MTQgNC45MDIgMzJILjE4N3YtNC41N0wxMS40NzMgMTYgLjE4NyA0LjcxNFYwaDQuNzE1bDExLjI4NSAxMS4yODZMMjcuNjE3IDBoNC41N3Y0LjcxNEwyMC45MDIgMTZsMTEuMjg1IDExLjI4NlYzMnoiLz48L3N2Zz4=)}'))
			}
			window.addEventListener('scroll', function(e) {
				_PONY.scrollTop.forEach(function($t) {
					if ($t.y >= e.pageY) {
						_PONY.clearPopups($t.target);
						_PONY.scrollTop.splice(_PONY.scrollTop.indexOf($t), 1);
					}
				});
				_PONY.scrollBot.forEach(function($b) {
					if ($b.y <= e.pageY) {
						_PONY.clearPopups($b.target);
						_PONY.scrollBot.splice(_PONY.scrollBot.indexOf($b), 1);
					}
				});
			});
		}
	}
	
//> if (IS_TOUCH_DEVICE) {
		
		/* здесь должен включаться адаптивный дизайн, но его пока нет */
		
//> } else {
		// создаем заглушку и перегораживаем ей экран
		var whitescreen = document.documentElement.appendChild( _z.setup('div', {
			id    : 'whitescreen',
			style : 'position: fixed; top: 0; left: 0; background-color: #fefefe; width: 100%; height: 100%; z-index: 999999;',
			html  : '<p style="position: absolute; width: 100px; height: 50px; top: 50%; left: 50%; margin-left: -50px; margin-top: -25px;">Загружаюсь...</p>'}) );
		// загружаем дополнительные модули
		for (var j = 0, len = MAIN_SETTINGS['require_modules'].length; j < len; j++) {
			var module = document.head.appendChild(document.createElement('script'));
				module.src = '/lib/javascript/modules/'+ MAIN_SETTINGS['require_modules'][j] +'.user.js';
				module.type = 'application/javascript';
		}
		$DOMReady(function() {
			// устанавливаем выбранный пользователем стиль
			document.selectedStyleSheetSet = (localStorage.getItem('main_style') || 'Photon');
			// переделываем панель стилей
			var styles_panel = $(document.getElementById('settings-styles')).draggable({
					snap: '#snapper, .droppable',
					snapMode: 'both',
					snapTolerance: 50 })[0];
			if (styles_panel) {
				used_style = styles_panel.querySelector('a[href="#'+ document.selectedStyleSheetSet +'"]') || trashObj;
				used_style.className = 'used-style';
				used_style.parentNode.className = 'list-item-checked';
				styles_panel.addEventListener('click', setStylesheet, false);
			}
			
			// обрабатываем верхнюю понель
			var fixed_header = document.getElementsByClassName('fixed-header-placeholder')[0];
			if (fixed_header) {
				var logo0 = document.getElementsByClassName('logo')[0];
				var toggleBorderTop = function() {
						fixed_header.style['border-bottom'] = document.documentElement.scrollTop > 10 ? '1px solid' : '';
					};
				(toggleHeaderOnTop = function() {
					if (MAIN_SETTINGS['fixedHeader_enable']) {
						logo0.style = 'margin-top: '+ (logo0.offsetTop - 8) +'px;';
						fixed_header.className = 'fixed-header-placeholder fixed-header';
						fixed_header.style = 'top: 0; padding: 4px 0;';
						toggleBorderTop();
						document.addEventListener('scroll', toggleBorderTop, false);
					} else {
						fixed_header.className = 'fixed-header-placeholder';
						fixed_header.style = logo0.style =  '';
						document.removeEventListener('scroll', toggleBorderTop, false);
					}
				})();
			}
		}, function() {
			// убираем заглушку
			document.documentElement.removeChild(whitescreen);
		});
//> }
	
	// создаем динамически изменяемый стиль
	var apply_msg = '#settings-main:before { content: "требуется перезагрузка"; display: block; text-align: center; color: brown; font-size: small; }',
		inline_style = EXT_STYLE.appendChild(document.createTextNode(
'.hempty { display: none!important; } .hmref { content: "(HIDDEN)"; display: inline!important; opacity: 0.7; } .doubledash { display: '+
			(MAIN_SETTINGS['show_doubledash'] ? 'inline' : 'none') +'!important; } .de-thread-buttons { display: '+
			(MAIN_SETTINGS['show_de-thread-buttons'] ? 'inline' : 'none') +'!important; float: left; } .roleplay { display: '+
			(MAIN_SETTINGS['hide_roleplay'] ? 'none' : 'inline') +'!important; } .file ~ .file { display: '+
			(MAIN_SETTINGS['hide_file_multi'] ? 'none!important; } .clearancent > blockquote { clear: right!important; }' : 'inline!important; }')
		));
	
	var markup_buttons = _z.setup('span', { html: (
		'<span class="markup-button" gmk="b" title="Жирный">'+
			'<input value="B" type="button"><a href="#">B</a></span>'+
		'<span class="markup-button" gmk="i" title="Курсивный">'+
			'<input value="i" type="button"><a href="#">i</a></span>'+
		'<span class="markup-button" gmk="u" title="Подчеркнутый">'+
			'<input value="U" type="button"><a href="#">U</a></span>'+
		'<span class="markup-button" gmk="s" title="Зачеркнутый">'+
			'<input value="S" type="button"><a href="#">S</a></span>'+
		'<span class="markup-button" gmk="spoiler" title="Спойлер">'+
			'<input value="%%" type="button"><a href="#">%%</a></span>'+
		'<span class="markup-button" gmk="code" title="Код">'+
			'<input value="C" type="button"><a href="#">C</a></span>'+
		'<span class="markup-button" gmk="rp" title="Ролеплей">'+
			'<input value="RP" type="button"><a href="#">RP</a></span>'+
		'<span class="markup-button" gmk="sup" title="Верхний индекс">'+
			'<input value="Sup" type="button"><a href="#">Sup</a></span>'+
		'<span class="markup-button" gmk="sub" title="Нижний индекс">'+
			'<input value="Sub" type="button"><a href="#">Sub</a></span>'+
		'<span class="markup-button" gmk="!!" title="Важный">'+
			'<input value="!A" type="button"><a href="#">!A</a></span>'+
		'<span class="markup-button" gmk="##" title="#dice">'+
			'<input value="#D" type="button"><a href="#">#D</a></span>'+
		'<span class="markup-button quote" gmk=">" title="Цитировать">'+
			'<input value=">" type="button"><a href="#">&gt;</a></span>'
		)}, { click: deMarkupButtons });
	
	// добавляем свой код через DollchanAPI
	window.addEventListener('message', function(e) {
		if (e.ports && e.ports.length === 1 && e.data === 'de-answer-api-message') {
			this.removeEventListener('message', arguments.callee, false);
			this.handleFileSelect = this.scrollHighlight = trashObj.fn;
			e.ports[0].onmessage = function(deApi) {
				var result = deApi.data.data;
				switch (deApi.data.name) {
					case 'submitform':
						if (result.success) {
							// clear db file samples
							$forEachClass('pre-sample', function(sl){ sl.dispatchEvent(new Event('dblclick')) });
							// reset file inputs
							for (var i = 1; 'upload-image-'+ i in postform.elements; i++) {
								postform.elements['md5-'+ i].value = '';
								postform.elements['md5passcode-'+ i].value = '';
								postform.elements['upload-image-'+ i].value = '';
								'upload-rating-'+ i in postform.elements && (
									postform.elements['upload-rating-'+ i].value = MAIN_SETTINGS['UploadRating_default']);
								_FileArea[i].className = 'file-area-empty';
							}
							_SHA512 = new Array(0);
							passcode_refresh && passcode_refresh();
							setCookie('name', postform.elements['name'].value, 2e4, '.'+ location.host);
						}
						// check captcha needed
						isCaptchaNeeded(function() {
							postform.elements['go'].disabled = recapt2.hidden = false;
						}, function() {
							postform.elements['go'].disabled = recapt2.hidden = true;
							renderCaptcha(
								recapt2, function(pass) {
									postform.elements['go'].disabled = !pass;
									postform.elements['g-recaptcha-response'].value = pass || '';
								});
						});
						// создаем поле для детекта отправки через кукловский ctrl+enter после отправки поста
						postform.elements['dollchan_send'].value = 1;
						break;
					case 'filechange':
						var i = 0, n = 1;
						var de_btn_del = document.getElementsByClassName('de-file-btn-del')
						var dePostproc = function(file, k, j) {
							fileBinaryCheck(file, k, trashObj.fn, function(msg) {
								_FileArea[k].className = 'file-area-empty';
								postform.elements['md5passcode-'+ k].value = '';
								postform.elements['md5-'+ k].value = '';
								var int = setInterval(function() {
									var c = de_btn_del[j].parentNode.parentNode.querySelector('.de-file-txt-input, img.de-file-img');
									if (c.value || c.src) {
										de_btn_del[j].dispatchEvent(
											new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
										); clearInterval(int);
									}
								}, 200);
								alertify.error(msg);
							})
						}
						do {
							if (!result[i])
								_DelBtn[n].click();
							else if (isBlobDifferent(_BlobStor[i], result[i]))
								dePostproc(result[i], n, i)
							n++; i++;
						} while (i < result.length);
						
						_BlobStor = result//.slice(0);
						//mepr.files = mrFiles = result;
						break;
					case 'newpost':
						_PONY && _PONY.genRefmap();
						MAIN_SETTINGS['userposts_hide'].forEach(hideUserPosts);
						document.dispatchEvent(new CustomEvent('hasNewPostsComing', {
							detail: result.map(function(num) { return document.getElementById('reply'+ num) })
						}));
					/* case '...': */
				}
			};
			// список доступных API функций: https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/wiki/dollchan-api#Список-api
			e.ports[0].postMessage({ name: 'registerapi', data: ['submitform', 'newpost', 'filechange'] });
		}
	});
	
	// кроссбраузерный аналог $(document).ready()
	$DOMReady(function onDocReadyHandler() {
		// скрываем неугодных
		MAIN_SETTINGS['userposts_hide'].forEach(hideUserPosts);
		MAIN_SETTINGS['userposts_hide'].length && EXT_STYLE.append(
			'.de-refmap, .PONY_refmap { overflow: hidden; line-height: 0!important; } .de-refmap > a, .PONY_refmap > a { line-height: 15px; }');
		// подкладываем динамический стиль
		document.body.appendChild(EXT_STYLE);
		// добавляем снегопад ( если включен в настройках )
		if (MAIN_SETTINGS['snowStorm_enable']) {
			snowStormToggle();
		}
		// запуск обновления счетчиков
		var brd_link = document.querySelectorAll('*[id^="board_link_"]'),
			not_sets_html = '';
			
		_Count.online = document.getElementById('online') || trashObj;
		_Count.speed = document.getElementById('speed') || trashObj;
		
		for (var i = 0; i < brd_link.length; i++) {
			var p = brd_link[i].id.substring(11).split('_'),
				position = p[0], desk = p[1];
			if (!(desk in _Count.__m)) {
				_Count.__m[desk] = {};
				if (!/changelog|mail|info/.test(desk)) {
					not_sets_html += '<label class="group-cell"><div>/'+ desk +'/</div><input class="mute-nots" name="'+
						desk +'" type="checkbox" '+ (desk in DATA_NOTS && DATA_NOTS[desk].mute ? 'checked': '') +'></label>\n';
				}
			}
			_Count.__m[desk][position] = brd_link[i];
		}; updateCounter();
		
		// переделываем панель настроек
		var settings_panel = $(document.getElementById('settings-main')).draggable({
				snap: '#snapper, .droppable',
				snapMode: 'both',
				snapTolerance: 50 })[0];
		if (settings_panel) {
			// (это ▼ лучше собирать здесь, а со страницы document.write и прочий лишний код убрать)
			settings_panel.innerHTML = '<div class="settings-section">'+
				'<div class="options-cell">'+
					'<p class="menu-head">Спойлеры и рейтинги</p>'+
					'<br>Рейтинг по умолчанию:'+
						'<select class="set-local" name="UploadRating_default">'+
							'<option value=""></option>'+
							'<option value="9">[S]</option>'+
							'<option value="10">[C]</option>'+
							'<option value="11">[A]</option>'+
						'</select>'+
					'<br>'+
					'<label class="menu-checkboxes"><input class="set-cookie" name="show_spoiler_9" type="checkbox">Показывать [S]</label>'+
					'<label class="menu-checkboxes"><input class="set-cookie" name="show_spoiler_10" type="checkbox">Показывать [C]</label>'+
					'<label class="menu-checkboxes"><input class="set-cookie" name="show_spoiler_11" type="checkbox">Показывать [A]</label><br>'+
					'<label class="menu-checkboxes"><input class="set-local" name="hide_roleplay" type="checkbox">Скрывать тег rp</label>'+
				'</div>'+
			'</div>'+
			'<div class="settings-section">'+
				'<div class="options-cell">'+
					'<p class="menu-head">Модификации</p>'+
					'<label class="menu-checkboxes"><input class="set-module" name="mepr" type="checkbox">Предосмотр постов</label>'+
					'<label class="menu-checkboxes"><input class="set-module" name="coma" type="checkbox">Цветные отметки</label>'+
					'<label class="menu-checkboxes"><input class="set-module" name="typo" type="checkbox">«Оттипографичивание» текста</label>'+
					'<label class="menu-checkboxes"><input class="set-local" name="show_doubledash" type="checkbox">Олдскул стрелки слева у постов</label>'+
				'</div>'+
			'</div>'+
			'<div class="settings-section">'+
				'<div class="options-cell">'+
					'<p class="menu-head" title="Если ссылка не содержит имени файла, то следует его добавить к ней через hash # тэг\nhttps://rocld.com/abcd => https://rocld.com/abcd#хорошая_песня.mp3">Ссылки на файлы</p>'+
					'<div class="menu-group">'+
						'<label class="group-cell"><div>Картинки</div><input class="set-local" name="cm_image" type="checkbox"></label>'+
						'<label class="group-cell"><div>Видео</div><input class="set-local" name="cm_video" type="checkbox"></label>'+
						'<label class="group-cell"><div>Музыка</div><input class="set-local" name="cm_audio" type="checkbox"></label>'+
						'<label class="group-cell"><div>Документы</div><input class="set-local" name="cm_docs" type="checkbox"></label>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div class="settings-section">'+
				'<div class="options-cell">'+
					'<p class="menu-head">Остальное</p>'+
					'<label class="menu-checkboxes"><input class="set-local" name="dollchanScript_enable" type="checkbox">Использовать встроенный Dollchan Script</label>'+
					(MAIN_SETTINGS['dollchanScript_enable'] ? '' :
					'<label class="menu-checkboxes"><input class="set-local" name="ctrlenoff" type="checkbox">Отключить отправку по ctrl+enter</label>'+
					'<label class="menu-checkboxes"><input class="set-local" name="ponymapoff" type="checkbox">Убрать «ответы»</label>') +
					'<label class="menu-checkboxes"><input class="set-local" name="keymarks" type="checkbox"><span title="'+
						'—[ по выделенному тексту в любом месте экрана ]—\n'+
						'&gt; (Цитата) \n'+
						'@ (Список) \n\n'+
						'—[ по выделенному тексту в текстовом поле ]—\n'+
						'% (Однострочный спойлер)\n'+
						'* (Курсив | ** Жирный)\n'+
						'^ (Зачеркнутый)\n'+
						'! (Выделенный текст)\n\n'+
						'# (Ролл) &middot; по выделенным цифрам в текстовом поле\n'+
						'&#92; &middot; экранирование тегов в выделенном тексте\n'+
						'( &quot; &middot; берет выделенный текст в скобки/кавычки\n'+
						'{[]} &middot; автокомплит работающий внутри тега [code]">Горячие клавиши разметки</span></label>'+
					'<label class="menu-checkboxes"><input class="set-local" name="galaform" type="checkbox"><span title="Если вас (как и меня) чем то не устраивает кукловая">Альтернативная форма ответа</span></label>'+
					'<label class="menu-checkboxes"><input class="set-local" name="hide_file_multi" type="checkbox">Не показывать 2-5 картинки в постах</label>'+
					'<label class="menu-checkboxes"><input class="set-local" name="show_de-thread-buttons" type="checkbox">Включить кнопку получения новых постов</label>'+
					'<label class="menu-checkboxes"><input class="set-local" name="fixedHeader_enable" type="checkbox">Зафиксировать хедер</label>'+
					'<label class="menu-checkboxes"><input class="set-local" name="snowStorm_enable" type="checkbox">Включить снег'+
					'<span style="font-style: italic; font-size: 75%; margin-left: 10px;">|<input class="set-local" name="snowStorm_freeze" type="checkbox">Всегда Вкл. |</span></label>'+
					'<p>Скрывать уведомления о новых постах/тредах</p>'+
					'<div class="menu-group">'+ not_sets_html +'</div><br>'+
					'<div>Скрытие по имени</div>'+
					'<input class="no-reload" name="userposts_hide" placeholder="Введите (имена) в скобках (через) (пробелы)" style="width: 98%;" type="text"><br>'+
					'<div id="tellwhohide"></div>'+
				'</div>'+
			'</div>';
			// обработка инпатов
			settings_panel.querySelectorAll('.set-cookie').forEach(function(el) {
				el.checked = getCookie(el.name);
			});
			settings_panel.querySelectorAll('.set-module').forEach(function(el) {
				el.checked = MAIN_SETTINGS['require_modules'].indexOf(el.name) !== -1;
			});
			settings_panel.querySelectorAll('.set-local').forEach(function(el) {
				el[el.type === 'checkbox' ? 'checked' : 'value'] = MAIN_SETTINGS[el.name];
			});
			$forEachClass('rating_select', function(rs) { rs.value = MAIN_SETTINGS['UploadRating_default']; });
			// обработчик изменений настроек
			settings_panel.addEventListener('change', useParamsHandler, false);
			// обработчик изменений настроек
			var ublacklist = settings_panel.querySelector('#tellwhohide');
				ublacklist.onmousedown = ublacklist.onmouseup = function(e) {
					if (e.target !== this && e.button == 0) {
						e.preventDefault();
						if (e.type === 'mouseup') {
							var idx = MAIN_SETTINGS['userposts_hide'].indexOf(e.target.textContent);
							MAIN_SETTINGS['userposts_hide'].splice(idx, 1);
							unhideUserPosts(e.target.textContent);
							this.removeChild(e.target);
							localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
						} else
							e.stopPropagation();
					}
				};
				
			for (var i = 0, len = MAIN_SETTINGS['userposts_hide'].length; i < len; i++) {
				var a = ublacklist.appendChild(document.createElement('a'));
					a.textContent = MAIN_SETTINGS['userposts_hide'][i];
			}
			
			settings_panel.querySelector('input[name="userposts_hide"]').addEventListener('input', function(e) {
				clearTimeout(e.target.timer_id);
				e.target.timer_id = setTimeout(function() {
					var match = e.target.value.match(/\(([^)]+)/g),
						len = match ? match.length : 0;
					for (var i = 0; i < len; i++) {
						var uname = match[i].substring(1).trim();
						if (!!uname && MAIN_SETTINGS['userposts_hide'].indexOf(uname) == -1) {
							MAIN_SETTINGS['userposts_hide'].push(uname);
							hideUserPosts(uname);
							ublacklist.appendChild(document.createElement('a')).textContent = uname;
							localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
						}
					}
				}, 4000);
			}, false);
		}
		
		// окно диалогов (оставлено без изменений)
		var $winDialog = $(document.getElementById('reply-irc')).draggable({
			snap: '#snapper, .droppable',
			snapMode: 'both',
			snapTolerance: 50
		});
		window.view_dialog = function view_dialog(b,p,r) {
			$GET((ku_boardspath +'/discuss.php?b='+b+'&p='+p+'&r='+r), function() {
				$winDialog.html(this.responseText).show();
			});
		}
		window.hide_dialog = function hide_dialog() {
			$winDialog.hide();
		}; //<--
		
		if ('postform' in document.forms) {
			
			postform = document.forms.postform;
			postform.elements['msgbox'].textMark = galamarK;
			
			if ('name' in postform.elements) {
				postform.elements['name'].value = getCookie('name') || '';
			}
			if ('em' in postform.elements) {
				postform.elements['em'].value = getCookie('em') || '';
			}
			
			// уточняем максимальный размер файла на доске
			MAX_FILE.SIZE[postform.elements['board'].value] = Number(postform.elements['MAX_FILE_SIZE'].value);
			
			for (var i = 1; 'upload-image-'+ i in postform.elements; i++) {
				
				var md5      = postform.elements['md5-'+ i];
				var passcode = postform.elements['md5passcode-'+ i];
				var upload   = postform.elements['upload-image-'+ i];
				var rating   = postform.elements['upload-rating-'+ i];
				
				_FileArea[i] = upload.parentNode;
				_DelBtn[i]   = _z.setup('a', { id: 'clear-file-'+ i, class: 'textbutton', text: '\n[X]' }, { click: cleanInputs });
				
				if (upload.files.length) {
					_FileArea[i].className = 'file-area';
					_SHA512.push(passcode.value);
					upload.parentNode.insertBefore(_DelBtn[i], upload);
				} else {
					_FileArea[i].className = 'file-area-empty';
					passcode.value = md5.value = '';
				}
			}
			// вносим уточнение о максимально возможном колличестве файлов для одного поста на этой доске
			MAX_FILE.COUNT[postform.elements['board'].value] = i - 1;
			
			// отслеживание изменений в DOM
			var _throbsv = 'MessageChannel' in window ? '' : ', body > form[action="/board.php"] *[id^="thread"]',
				observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(record, i) {
					if (record.addedNodes.length) {
						var nodes = record.addedNodes;
						if (record.target === document.body && nodes[0].tagName === 'FORM') {
							observer.observe(nodes[0], { childList: true });
							if (_throbsv) {
								nodes[0].querySelectorAll('*[id^="thread"]').forEach(function(thread) {
									observer.observe(thread, { childList: true });
								});
							}
							nodes = nodes[0].querySelectorAll('.oppost[id^="reply"], .psttable *[id^="reply"]');
						}
						if (/psttable|oppost|de-pview/.test(nodes[0].className)) {
							_PONY && _PONY.genRefmap();
							MAIN_SETTINGS['userposts_hide'].forEach(hideUserPosts);
							document.dispatchEvent(new CustomEvent('hasNewPostsComing', {
								detail: nodes
							}));
						}
					}
				});
			});
		
			document.querySelectorAll('body, body > form[action="/board.php"]'+ _throbsv).forEach(function(target) {
				observer.observe(target, { childList: true });
			});
		
			window.handleFileSelect = function(n) {
				var target = postform.elements['upload-image-'+ n],
					file = target.files[0];
				
				fileBinaryCheck(file, n, function() {
					target.parentNode.insertBefore(_DelBtn[n], target);
				}, function(msg) {
					_DelBtn[n].click();
					alertify.error(msg);
				});
			};
			window.submitPostform = function() {
				// убираем поле для детекта отправки через кукловский ctrl+enter
				postform.elements['dollchan_send'].value = 0;
				postform.elements['fake_go'].dispatchEvent(
					new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
				);
			}
			
			// grab free file slots
			var fileSlots = postform.getElementsByClassName('file-area-empty');
			
			// passcode uploader
			var passcode_preview = document.getElementById('preview_passcode_div');
			var passcode_images = document.getElementById('passcodeimages');
				passcode_images.onclick = function(e) {
					if (e.target.className === 'passcode_image' && fileSlots.length > 0) {
						addBoundThumbnail(fileSlots[0], //free file slot
							e.target,                   //selected image
							e.target.id,                //md hash
							passcode_preview,           //preview area
							e.target.title + e.target.src.substring(e.target.src.lastIndexOf('.')), //image title
							'pass' // preview file pattern
						);
					}
				};
			document.getElementById('passcodegetimages').onclick = function() {
				this.style.display = 'none';
				passcode_refresh = arguments.callee.bind(this);
				$GET('/getdb.php?passcodeimages', function() {
					passcode_images.innerHTML = this.responseText.replace(/<script>insertmd5\(\);<\/script>/g, '');
				});
			};
			document.getElementById('passcode_search').oninput = function(e) {
				clearTimeout(e.target.timer_id);
				e.target.timer_id = setTimeout(function() {
					var kword = e.target.value.trim();
					passcode_images.childNodes.forEach(function(img) {
						$(img)[(!kword || img.title.indexOf(kword) != -1 ? 'show' : 'hide')]('slow');
					});
				}, 500);
			}
			
			// derpibooru uploader
			var _db_ = {
				version : '2.8.4',
				apiKey  : localStorage.getItem('derpibooru_api_key') || '',
				timr    : null, page: {}, pic: {},
				save    : function(kword, index, dev) {
					(this.page[kword] || (this.page[kword] = {}))[index] = dev;
				}
			}
			
			var dbPREVIEW = document.getElementById('prepreview');
			var dbASKKEY = _z.setup('center', {
				id: 'dbaskkey',
				html: ('<p>Вы можете ввести свой API Key для использования ваших фильтров или использовать встроенный</p>'+
				   '<br><input type="button" name="set_userkey" value="Использовать мой"><input name="userkey_value" type="text" placeholder="Ваш ключ"><br>'+
				   '<br><input type="button" name="set_defaultkey" value="Использовать встроенный">')
			}, { click: function(e) {
				switch (e.target.name) {
					case 'set_userkey':
						_db_.apiKey = e.target.nextElementSibling.value;
						if (_db_.apiKey.length < 20) {
							alertify.log('Неправильный ключ');
							_db_.apiKey = '';
							break;
						}
					case 'set_defaultkey':
						localStorage['derpibooru_api_key'] = _db_.apiKey;
						dbASKKEY.remove();
						$(dbSEARCH.parentNode).show('slow');
				}
			}});
			
			var dbIMGPLACE = document.getElementById('imagesgoeshere');
				dbIMGPLACE.onclick = function(e) {
					if (e.target.className === 'imagedb' && fileSlots.length > 0) {
						var full_img = _db_.pic[e.target.id.split('_')[2]].representations.full;
						addBoundThumbnail(fileSlots[0], //free file slot
							e.target,                   //selected image
							'[derpi]'+ btoa(full_img.replace(/^\/\/[a-z0-9\.]+\//g,'')), //md hash
							dbPREVIEW,                  //preview area
							full_img.slice(full_img.lastIndexOf('/') + 1), //image title
							'db' // preview file pattern
						);
					}
				};
				
			var dbPAGE = Object.defineProperty(document.getElementById('dbpage'), 'pagesCount', {
					set: function(p) {
						this.max = p.toString().replace(/\d+\.\d+/, Math.floor(p) + 1);
						this.maxAsNumber = Number(this.max);
					}, get: function() {
						return this.maxAsNumber;
					}
				});
				dbPAGE.type = 'number';
				dbPAGE.min = '1';
				dbPAGE.oninput = updatesq;
				
			var dbSEARCH = document.getElementById('dbsearch');
				dbSEARCH.oninput = function(e) {
					this.value = this.value.toLowerCase().replace(/[фФ]/, 'a').replace(/[иИ]/, 'b').replace(/[сС]/, 'c').replace(/[вВ]/, 'd').replace(/[уУ]/, 'e').replace(/[аА]/, 'f').replace(/[пП]/, 'g').replace(/[рР]/, 'h').replace(/[шШ]/, 'i').replace(/[оО]/, 'j').replace(/[лЛ]/, 'k').replace(/[дДжЖ]/, 'l').replace(/[ьЬбБ]/, 'm').replace(/[тТ]/, 'n').replace(/[щЩ]/, 'o').replace(/[зЗхХ]/, 'p').replace(/[йЙ]/, 'q').replace(/[кК]/, 'r').replace(/[ыЫ]/, 's').replace(/[еЕ]/, 't').replace(/[гГ]/, 'u').replace(/[мМ]/, 'v').replace(/[цЦ]/, 'w').replace(/[чЧ]/, 'x').replace(/[нН]/, 'y').replace(/[яЯ]/, 'z').replace(/[;\[\]{}',\.\/`ъЪЭэ]/,'');
					$(dbPAGE).hide('slow');
					dbPAGE.value = 1;
					updatesq();
				}
				
			var dbINFO = document.getElementById('infodb'),
				dbVERS = document.getElementById('versdb');
				dbVERS.lastChild.textContent = '\n \n'+ _db_.version +'\n \n';
				dbVERS.firstElementChild.onclick = function() {
					delete localStorage['derpibooru_api_key'] && alertify.log('Ключ сброшен');
					$(dbSEARCH.parentNode).hide().before(dbASKKEY);
				}
			
			// asking for API key 
			if (!('derpibooru_api_key' in localStorage)) {
				$(dbSEARCH.parentNode).hide().before(dbASKKEY);
			} else
				if (dbSEARCH.value.length > 0 && sessionStorage.db_last_page) {
					dbThumbRender({target: { response: sessionStorage.db_last_page } });
				}
			
			var dbPREV = document.querySelector('.modal__prev');
				dbPREV.onclick = function() { dbPAGE.value = Math.max(1, dbPAGE.valueAsNumber - 1); updatesq(); };
			var dbNEXT = document.querySelector('.modal__next');
				dbNEXT.onclick = function() { dbPAGE.value = Math.min(dbPAGE.pagesCount, dbPAGE.valueAsNumber + 1); updatesq(); };
			
			recapt2 = document.getElementById('recapt-2')
			
			isCaptchaNeeded(function() {
				postform.elements['go'].disabled = false;
			}, function() {
				postform.elements['go'].disabled = true;
				renderCaptcha(
					recapt2, function(pass) {
						postform.elements['go'].disabled = !pass;
						postform.elements['g-recaptcha-response'].value = pass || '';
					});
			});
		}
		// animation listener events
		_z.documentListener.add('AnimationStart', function (event) {
			if (event.animationName == 'init') {
				if (event.target.id == 'de-txt-panel') {
					markup_buttons.className = 'buttons-style-'+ (event.target.querySelector('.de-abtn') ? 'text' : 'standart');
					event.target.appendChild(markup_buttons);
				} else
				if (event.target.classList.contains('de-src-iqdb')) {
					event.target.parentNode.insertBefore(_DerpBtn, event.target.nextSibling);
				}
			}
		});
		// превращаем ссылку в футере в кнопку переключения между адаптивным и классическим интерфейсом
		_z.setup(document.querySelector('.footer > a'), {
			id: 'ponyaba', href: 'javascript:void(0)', title: IS_TOUCH_DEVICE ? 'версия для ПК' : 'мобильная версия',
			onclick: function(event) {
				event.preventDefault();
				MAIN_SETTINGS['dast_enable'] = !MAIN_SETTINGS['dast_enable'] ? 1 : 0;
				localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
				location.reload();
			}
		});
		function updatesq() {
			clearTimeout(_db_.timr);
			_db_.timr = setTimeout(function() {
				var s = dbSEARCH.value.trim();
				var j = dbPAGE.value;
		
				if (s.length === 0) {
					dbINFO.textContent = 'Введите поисковой запрос';
				} else if (s in _db_.page && j in _db_.page[s]) {
					var $page = $(_db_.page[s][j]).hide();
					dbIMGPLACE[(dbIMGPLACE.childNodes.length == 0 ? 'append' : 'replace') +'Child'](
						$page[0], dbIMGPLACE.childNodes[0]
					);
					$(dbPREV)[( dbPAGE.valueAsNumber > 1 ? 'show' : 'hide' )]('slow');
					$(dbNEXT)[( dbPAGE.valueAsNumber < dbPAGE.pagesCount ? 'show' : 'hide' )]('slow');
					$page.show('slow');
				} else {
					dbINFO.textContent = 'Загрузка...';
					$GET('/getdb.php?q='+ s.replace(/\s/g, '%2B') +'&page='+ j +'&apikey='+ _db_.apiKey, dbThumbRender);
				}
			}, 500);
		}
		
		function dbThumbRender(e) {
			try {
				// building preview with thumbs
				var jr = JSON.parse((sessionStorage.db_last_page = e.target.response));
				
				if (jr.total > 0) {
					dbINFO.textContent = '';
					dbPAGE.pagesCount = jr.total / 15;
					
					var imgdev = document.createElement('div');
						imgdev.className = 'imgdiv';
						imgdev.id = 'pagedb_'+ dbPAGE.value;
					
					dbIMGPLACE[(dbIMGPLACE.childNodes.length == 0 ? 'append' : 'replace') +'Child'](
						imgdev, dbIMGPLACE.childNodes[0]
					);
					
					for (var i = 0, jrl = jr.search.length; i < jrl; i++) {
						
						var image = imgdev.appendChild( document.createElement('img') );
							image.className = 'imagedb';
							image.id = 'imgdb_'+ (i + 1) +'_'+ jr.search[i].id;
							image.style.display = 'none';
							image.src = jr.search[i].representations.thumb;
							image.onload = function() {
								$(this).show('slow');
							}
						_db_.pic[jr.search[i].id] = jr.search[i];
					}
					_db_.save(dbSEARCH.value, dbPAGE.value, imgdev);
					
					$(dbPREV)[( dbPAGE.valueAsNumber > 1 ? 'show' : 'hide' )]('slow');
					$(dbNEXT)[( dbPAGE.valueAsNumber < dbPAGE.pagesCount ? 'show' : 'hide' )]('slow');
					$(dbPAGE).show('slow');
				} else {
					$(dbIMGPLACE.childNodes[0]).hide();
					$(dbPREV).hide(); $(dbNEXT).hide();
					dbINFO.textContent = 'Ничего не найдено';
				}
			} catch(trace) {
				// console.error(e.target, trace);
				dbINFO.textContent = 'Некорректный запрос';
			}
		}
	});
	
	function cleanInputs(e) {
		var k = this.id.slice(-1),
			r = postform.elements['upload-rating-'+ k];
			r && (r.value = MAIN_SETTINGS['UploadRating_default']);
		var x = _SHA512.indexOf(postform.elements['md5passcode-'+ k].value);
			x !== -1 && _SHA512.splice(x, 1);
		_FileArea[k].className = 'file-area-empty';
		postform.elements['md5passcode-'+ k].value = '';
		postform.elements['upload-image-'+ k].value = '';
		postform.elements['md5-'+ k].value = '';
		this.remove();
	}
	
	function fileBinaryCheck(file, n, resolve, reject, smax) {
		if (!VALID_FILE_TYPES.test(file.type)) {
			reject('Неподдерживаемый формат\n<br>\n['+ file.name.substring(file.name.lastIndexOf('.') + 1) +' => jpeg, webm, png, gif]');
		} else if (file.size > (smax = MAX_FILE.SIZE.get(postform.elements['board']))) {
			reject('Слишком большой файл\n<br>\n['+ ((file.size / 1024 / 1024).toFixed(2)) +'/'+ ((smax / 1024 / 1024).toFixed(2)) +' MB]');
		} else {
			var reader = new FileReader();
				reader.onload = function() {
					if (this.readyState == FileReader.DONE) {
						var filestring = this.result,
							stringLength = filestring.length - 1;
						
						while (!isNaN( filestring.charAt(stringLength) )) { // is number
							stringLength--;
						}
					
						var passcode = postform.elements['md5passcode-'+ n],
							md5 = rstr2hex(rstr_md5(filestring.substring(0, stringLength))),
							cix = _SHA512.indexOf(passcode.value);
							cix !== -1 && _SHA512.splice(cix, 1);
							
						if (_SHA512.indexOf(md5) !== -1) {
							reject('Уже добавлен точно такой же файл');
						} else {
							// always send sha512 of file for passcode records
							$GET('/chkmd5.php?x='+ md5, function() {
								postform.elements['md5-'+ n].value = this.responseText == 'true' ? md5 : '';
							});
							// field will be sent only if user have cookie with real passcode
							_FileArea[n].className = 'file-area';
							_SHA512.push((passcode.value = md5));
							resolve(md5);
						}
					}
				}
				reader.readAsBinaryString(file);
		}
	}
	
	function addBoundThumbnail(file_slot, img_selected, hash, preview_area, title, _p_) {
		try {
			var n      = file_slot.firstElementChild.name.split('-')[1],
				rating = postform.elements['upload-rating-'+ n], _Rn = '';
		
			postform.elements['md5-'+ n].value = hash;
			
			file_slot.className = 'file-booru';
			file_slot.setAttribute('title', title);
				
			var prepreview = preview_area.children[ _p_ +'-prefile-'+ n ];
		
			if (!prepreview) {
				prepreview = preview_area.appendChild(document.createElement('div'));
				prepreview.className = 'pre-sample';
				prepreview.id = _p_ +'-prefile-'+ n;
				rating && (prepreview.innerHTML = '<select class="rating_select">'+ rating.innerHTML +'</select>');
			}
		
			if (rating) {
				prepreview.firstElementChild.value = rating.value = _Rn = MAIN_SETTINGS['UploadRating_default'];
				prepreview.firstElementChild.onchange = function() {
					file_slot.setAttribute('rate', 'R: '+ this.selectedOptions[0].textContent +'\n');
					de_rpiChange(n, img_selected.src, title, (rating.value = this.value));
				}
				file_slot.setAttribute('rate', 'R: '+ rating.selectedOptions[0].textContent +'\n');
			}
			
			de_rpiChange(n, img_selected.src, title, _Rn);
			
			prepreview.style = 'background-image: url('+ img_selected.src +')';
			prepreview.ondblclick = img_selected.onclick = function(evt) {
				evt.stopPropagation();
				$(prepreview).hide('slow');
				file_slot.className = 'file-area-empty';
				img_selected.classList.remove('idb-selected');
				img_selected.onclick = null;
				postform.elements['md5-'+ n].value = '';
				$(file_slot).removeAttr('title rate');
				de_rpiChange(n);
			}
			img_selected.classList.add('idb-selected');
		} catch(err) {
			console.error(err)
		}
	};
	
	function useParamsHandler(e) {
		try {
			var _Input = e.target, keyW = '', name = e.target.name;
			switch (_Input.className) {
				case 'no-reload':
					keyW = '!';
					break;
				case 'mute-nots':
					(DATA_NOTS[name] || (DATA_NOTS[name] = { posts: 0, threads: 0, mute: 0 })).mute = (_Input.checked + 0);
					localStorage.setItem('data_nots', JSON.stringify(DATA_NOTS));
					keyW = _Input.checked ? ['muteNots'] : '!';
					break;
				case 'set-cookie':
					setCookie(name, (_Input.type === 'checkbox' ? _Input.checked : _Input.value), 2e4);
					break;
				case 'set-module':
					if (_Input.checked) {
						MAIN_SETTINGS['require_modules'].push(name);
					} else {
						MAIN_SETTINGS['require_modules'].splice(MAIN_SETTINGS['require_modules'].indexOf(name), 1);
					}
					localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
					break;
				case 'set-local':
					MAIN_SETTINGS[name] = (_Input.type === 'checkbox' ? _Input.checked + 0 : _Input.value);
					localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
					keyW = name.split('_');
			}
			switch (keyW[0]) {
				case 'cm':
					if (_Input.checked) {
						var _class_ = 'cm-button cm-'+ (keyW[1] == 'docs' ? 'pastebin' : keyW[1] == 'image' ? 'image' : 'play');
						document.querySelectorAll('.cm-link[id^="'+ keyW[1] +'lnk_"]').forEach(function(lnk) {
							lnk.className = _class_;
							lnk.textContent = lnk._text_;
						});
						document.querySelectorAll('.post-body > blockquote a[href*="//"]:not(.cm-link):not(.cm-button):not(.irc-reflink)').forEach(Gala.handleLinks);
					} else {
						document.querySelectorAll('.cm-button[id^="'+ keyW[1] +'lnk_"]').forEach(function(lnk) {
							lnk.className = 'cm-link';
							lnk._text_ = lnk.textContent;
							lnk.textContent = lnk.href;
						});
					}
					break;
				case 'UploadRating':
					$forEachClass('rating_select', function(rs) { rs.value = _Input.value; });
					$forEachClass('de-file-rate', function(dr) {
						var dF = dr.parentNode.parentNode;
							dr.title = _Input.selectedOptions[0].textContent;
						if (
							(dF.classList[0] === 'de-file' ? dF : (dF = dF.querySelector('.de-file-txt-input') || dF)) &&
							!dF.classList.contains('de-file-off')
						) {
							_PonyRateHiglight(dF, _Input.value);
						}
					});
					break;
				case 'fixedHeader':
					toggleHeaderOnTop();
					break;
				case 'snowStorm':
					if (keyW[1] === 'freeze') {
						(snowStorm || trashObj).freezeOnBlur = MAIN_SETTINGS['snowStorm_freeze'];
					} else
						snowStormToggle();
					break;
				case 'muteNots':
					_Count.set(name,
						_Count.get(name, 'textContent').replace(/\+|\*/, ''),
						_Count.origTitle[name]);
					break;
				case 'show':
					inline_style.textContent = inline_style.textContent.replace(
						new RegExp('.'+ keyW[1] +' { display: \\w+'), '.'+ keyW[1] +' { display: '+ (MAIN_SETTINGS[name] ? 'inline' : 'none'));
					break;
				case 'hide':
					inline_style.textContent = inline_style.textContent.replace(
						new RegExp('.'+ keyW[1] +' { display: \\w+'), '.'+ keyW[1] +' { display: '+ (MAIN_SETTINGS[name] ? 'none' : 'inline'));
					if (keyW[1] === 'file') {
						if (MAIN_SETTINGS['hide_file_multi']) {
							inline_style.textContent += '.clearancent > blockquote { clear: right!important; }';
						} else
							inline_style.textContent = inline_style.textContent.replace('.clearancent > blockquote { clear: right!important; }', '');
					}
				case 'ctrlenoff': case 'keymarks': case '!':
					break;
				default:
					// вывод сообщения о необходимости перезагрузки с отслеживанием изменений
					var cix = (this['_changes_'] || (this['_changes_'] = [])).indexOf(name);
					if (cix == -1) {
						this['_changes_'].push(name);
						this['_changes_'].length == 1 && (inline_style.textContent = apply_msg + inline_style.textContent);
					} else {
						this['_changes_'].splice(cix, 1);
						this['_changes_'].length == 0 && (inline_style.textContent = inline_style.textContent.replace(apply_msg, ''));
					}
			}
		} catch (trace) {
			console.error(trace)
		}
	}
	
	function strXpathFix(str) {
		var parts = str.match(/[^'"]+|['"]/g);
			parts = parts.map(function(part) {
				return (part === "'" ? '"\'"' : part === '"' ? "'\"'" : '"'+ part +'"');
			});
		return parts.length > 1 ? 'concat(' + parts.join(',') + ')' : parts[0];
	}
	
	function hideUserPosts(name) {
		var ptn = name.substring(0,1) == '!' ? 'trip' : 'name',
			xpath = document.evaluate('//*[@class="poster'+ ptn +'" and contains(., '+ strXpathFix(name) +')]/ancestor::*[@class="psttable"]', document.body, null, 7, null);
		for (var n = 0; n < xpath.snapshotLength; n++) {
			var psttable = xpath.snapshotItem(n),
				pstid = psttable.firstElementChild.firstElementChild.lastElementChild.id.substring(5);
			psttable.className = 'hempty huser-'+ hashString(name);
			inline_style.textContent = inline_style.textContent
				.replace('.hempty', 'a[href$="#'+ pstid +'"], a[href="#'+ pstid +'"] + :before, a[href="#'+ pstid +'"] + .de-refcomma, .hempty')
				.replace('.hmref', 'a[onclick$=", '+ pstid +');"], a[onclick$=", '+ pstid +');"]:after, .hmref');
			_HiP.push(pstid);
		}
	}
	
	function unhideUserPosts(name) {
		$forEachClass('huser-'+ hashString(name), function(psttable, i) {
			var pstid = psttable.firstElementChild.firstElementChild.lastElementChild.id.substring(5);
				psttable.className = 'psttable';
			inline_style.textContent = inline_style.textContent
				.replace('a[href$="#'+ pstid +'"], a[href="#'+ pstid +'"] + :before, a[href="#'+ pstid +'"] + :not(a), ', '')
				.replace('a[onclick$=", '+ pstid +');"], a[onclick$=", '+ pstid +');"]:after, ', '');
			_HiP.splice(_HiP.indexOf(pstid), 1);
		});
	}
	function setStylesheet(event) {
		switch (event.target.className) {
			case 'set-style':
				var name = event.target.hash.slice(1);
				localStorage.setItem('main_style', (document.selectedStyleSheetSet = name));
				used_style.className = 'set-style';
				used_style.parentNode.className = '';
				event.target.className = 'used-style';
				event.target.parentNode.className = 'list-item-checked';
			case 'used-style':
				used_style = event.target;
				event.preventDefault();
		}
	}
	
	function updateCounter() {
		$GET('/info.php?x=1', function() {
			if (this.readyState !== 4)
				return;
			if (this.status === 200 && this.responseText && this.responseText !== old_response) {
				try {
					var res = this.responseText.split(';');
						
					_Count.online.textContent = res[0];
					_Count.speed.textContent = res[1];
					
					for (var i = 0, arr = res.splice(2), len = arr.length; i < len; i++) {
						var data = arr[i].split(/=|:/g),
							name = display_name = data[0];
						
						if (DATA_NOTS.init) {
							DATA_NOTS[name] = name == 'changelog' ? Number(data[2]) : { posts: Number(data[1]), threads: Number(data[2]), mute: 0 }
						} else
						if (name == 'changelog') {
							var changes = Number(data[2]);
							DATA_NOTS[name] = LOCATION_PATH.board === 'changelog' ? changes : (DATA_NOTS[name] || 0);
							if (changes > DATA_NOTS[name]) {
								_Count.set(name, 'Чейнжлог+', 'изменений:'+ (changes - DATA_NOTS[name]));
							}
							continue;
						} else {
							if (!(name in _Count.__m) || (DATA_NOTS[name] || (DATA_NOTS[name] = { posts: 0, threads: 0, mute: 0 })).mute)
								continue;
								
							var posts = Number(data[1]);
							var threads = Number(data[2]);
							var title = _Count.origTitle[name] || (_Count.origTitle[name] = _Count.get(name, 'title'));
						
							if (name == LOCATION_PATH.board) {
								DATA_NOTS[name].posts = posts;
								DATA_NOTS[name].threads = threads;
							} else {
								if (DATA_NOTS[name].posts < posts) {
									display_name += '+';
									title = 'новых постов: '+ (posts - DATA_NOTS[name].posts);
								}
								if (DATA_NOTS[name].threads < threads) {
									display_name = name +'*';
									title += ', новых тредов: '+ (threads - DATA_NOTS[name].threads);
								}
								_Count.set(name, display_name, title);
							}
						}
					}
					delete DATA_NOTS['init'];
					localStorage.setItem('data_nots', JSON.stringify(DATA_NOTS));
					
					t_int = 15;
					old_response = this.responseText;
					
				} catch(trace) {
					console.error(trace)
				}
			} else if (t_int < 180) {
				t_int += 15;
			}
			setTimeout(updateCounter, t_int * 1000);
		}, 'readystatechange');
		/*
		$GET('/messages.php?m=list', function() {
			$("#messages").html(this.responseText);
		});*/
	}
	
	function deMarkupButtons(e, tag) {
		if ((tag = e.target.parentNode.getAttribute('gmk'))) {
			e.preventDefault();
			switch (tag) {
				case 'spoiler':
				case 'code':
					var o = '['+ tag +']', c = '[/'+ tag +']',
						s = postform.elements['msgbox'].value.substring(0, postform.elements['msgbox'].selectionStart);
					if (!isInsideATag(s, o, c)) {
						postform.elements['msgbox'].textMark(o, c, 'html', true);
					} else if (tag === 'spoiler') {
						postform.elements['msgbox'].textMark('%%', '%%', 'mdwn');
					} else if (tag === 'code')
						postform.elements['msgbox'].textMark('   ', '\n   ', 'ql');
					break;
				case '>':
					postform.elements['msgbox'].textMark(tag, '\n'+ tag, 'ql');
					break;
				case '##':
					postform.elements['msgbox'].textMark(tag, tag, 'dice');
					break;
				case '!!':
					postform.elements['msgbox'].textMark(tag, tag, 'mdwn');
					break;
				default:
					postform.elements['msgbox'].textMark('['+tag+']', '[/'+tag+']', 'html');
			}
		}
	}
	
	//--> Derpibooroo Reverse Search
	var _DerpBtn = _z.setup('a', {class: 'de-menu-item de-src-derpibooru', target: '_blank', text: 'Поиск по Derpibooru', onclick: derpSearch });
	function derpSearch(e) {
		var _DerpForm = document.body.appendChild( _z.setup('form', {
		  'accept-charset': 'UTF-8',
		   enctype : 'multipart/form-data',
		   action  : '//derpibooru.org/search/reverse',
		   target  : '_blank',
		   method  : 'post',
		   hidden  :  true,
		   html    : '<input name="scraper_url" type="url" value=""><input name="fuzziness" value="0.25" type="number"><input name="utf8" value="✓" type="hidden"><input name="authenticity_token" value="BUmHjxWqyqeZ5Sh+rght/aEaL7TyXP89L5v9vlt8tWf7SGiIasN/ctm2Gt4hQVhWDCXunjWXNizSDacWu1Hw3Q==" type="hidden">'}));
		(derpSearch = function(e) {
			_DerpForm.elements['scraper_url'].value = decodeURIComponent(e.target.previousElementSibling.href.split('=')[1]);
			_DerpForm.submit();
		})(e);
		this.onclick = derpSearch;
	} //<---*
	
	// кнопки аплоада картинок с дерпибуры и паскодов (собираем их заранее)
	var dbpic_vi    = _z.setup('label', { class: 'modal-btn', for: 'modal-1', style: 'background-image: url(https://derpicdn.net/favicon.ico)' });
	var passcode_up = _z.setup('label', { class: 'modal-btn', for: 'modal-2', style: 'background-image: url(https://ponyach.ru/images/fsto.ico)' });
	
	// динамически загружаемый снежный буран
	function snowStormToggle() {
		document.head.appendChild(_z.setup('script', {
			type: 'text/javascript', src: '/lib/javascript/snowstorm_20161027223649.js'
		}, {
			load: function(e) {
				snowStorm.freezeOnBlur = MAIN_SETTINGS['snowStorm_freeze'];
				snowStorm.start();
			}
		}));
		snowStormToggle = function() {
			snowStorm[(MAIN_SETTINGS['snowStorm_enable'] ? 'resume' : 'freeze')]();
		};
	}
	
})(function() {
	
	//затычки --X
	window.handleFileSelect = window.submitPostform = function() {return 0;}

	window.ku_boardspath = location.origin;
	// X-- затычки
	
	// полифил для реализации selectedStyleSheetSet - родного метода для переключения html5 стилей link[rel="stylesheet alternate"]
	if (!('selectedStyleSheetSet' in document)) {
		Object.defineProperty(document, 'selectedStyleSheetSet', {
			configurable: true,
			set: function(key) {
				var links = this.head.querySelectorAll('link[title]'),
					length = links.length, sSheets = new Array(length);
				for (var i = 0; i < length; i++) {
					sSheets[i] = links[i].title;
					sSheets[links[i].title] = links[i];
					links[i].disabled = true;
				}
				sSheets[''] = {};
				if (key in sSheets) {
					sSheets[(sSheets._def_ = key)].disabled = false;
				} else
					sSheets._def_ = '';
				Object.defineProperties(this, {
					'styleSheetSet': {
						enumerable: true,
						value: sSheets },
					'selectedStyleSheetSet': {
						configurable: false,
						enumerable: true,
						set: function(name) {
							this.styleSheetSet[ this.styleSheetSet._def_ ].disabled = true;
							if (name in this.styleSheetSet) {
								this.styleSheetSet[(this.styleSheetSet._def_ = name)].disabled = false;
							} else 
								this.styleSheetSet._def_ = '';
						}, get: function() {
							return this.styleSheetSet._def_;
						}
					}
				});
			}
		});
	}
	// полифил c упрощенной реализацией classList
	if (!('classList' in Element.prototype)) {
		Object.defineProperty(Element.prototype, 'classList', {
			configurable: false,
			enumerable: true,
			get: function() {
				var classList = this.className.split(' '), elem = this;
					classList.add = function(/* classes */) {
						for (var c = 0, len = arguments.length; c < len; c++) {
							if (classList.indexOf(arguments[c]) == -1)
								classList.push(arguments[c]);
						}
						elem.className = classList.join(' ');
					}
					classList.remove = function(/* classes */) {
						for (var c = 0, len = arguments.length; c < len; c++) {
							var index = classList.indexOf(arguments[c])
								index != -1 && classList.splice(index, 1);
						}
						elem.className = classList.join(' ');
					}
					classList.toggle = function(c) {
						var index = classList.indexOf(c);
							index != -1 ? classList.splice(index, 1) : classList.push(c);
						elem.className = classList.join(' ');
					}
					classList.contains = function(c) {
						return classList.indexOf(c) !== -1;
					}
				return classList;
			}
		});
	}
	// полифилы для отмены действий по событию
	if (!('preventDefault' in Event.prototype)) {
		Event.prototype.preventDefault = function() {
			this.returnValue = false;
		};
	}
	if (!('stopPropagation' in Event.prototype)) {
		Event.prototype.stopPropagation = function() {
			this.cancelBubble = true;
		};
	}
	if (!Element.prototype.append) {
		Element.prototype.append = Document.prototype.append = DocumentFragment.prototype.append = function() {
			for (var i = 0, arg = arguments; i < arg.length; i++) {
				var node = typeof arg[i] === 'string' ? document.createTextNode(arg[i]) : arg[i];
				this.appendChild( node );
			}
		};
	}
	if (!Element.prototype.prepend) {
		Element.prototype.prepend = Document.prototype.prepend = DocumentFragment.prototype.prepend = function() {
			for (var i = 0, arg = arguments; i < arg.length; i++) {
				var node = typeof arg[i] === 'string' ? document.createTextNode(arg[i]) : arg[i];
				this.insertBefore( node, this.childNodes[i] );
			}
		};
	}
	if (!Element.prototype.before) {
		Element.prototype.before = function() {
			for (var i = 0, arg = arguments; i < arg.length; i++) {
				var node = typeof arg[i] === 'string' ? document.createTextNode(arg[i]) : arg[i];
				this.parentNode.insertBefore( node, this );
			}
		};
	}
	if (!Element.prototype.after) {
		Element.prototype.after = function() {
			for (var i = 0, arg = arguments; i < arg.length; i++) {
				var node = typeof arg[i] === 'string' ? document.createTextNode(arg[i]) : arg[i];
				this.parentNode.insertBefore( node, this.nextSibling );
			}
		};
	}
	if (!String.prototype.includes) {
		String.prototype.includes = function() {
			return String.prototype.indexOf.apply(this, arguments) >= 0;
		};
	}
	if (!Array.prototype.includes) {
		Array.prototype.includes = function(searchElement /*, fromIndex*/) {
			if (this == null) throw new TypeError('Array.prototype.includes called on null or undefined');
		
			var O = Object(this);
			var len = parseInt(O.length, 10) || 0;
			if (len === 0) {
				return false;
			}
			var n = parseInt(arguments[1], 10) || 0;
			var k;
			if (n >= 0) {
				k = n;
			} else {
				k = len + n;
				if (k < 0) {k = 0;}
			}
			var currentElement;
			while (k < len) {
				currentElement = O[k];
				if (searchElement === currentElement ||
					(searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
						return true;
					}
					k++;
			}
			return false;
		};
	}
	if (!NodeList.prototype.forEach) {
		NodeList.prototype.forEach = function(fun) {
			Array.prototype.slice.call(this, 0).forEach(fun);
		}
	}
	if (!('hidden' in HTMLElement.prototype)) {
		Object.defineProperty(HTMLElement.prototype, 'hidden', {
			get: function () {
				return this.hasAttribute('hidden');
			},
			set: function (value) {
				this[(value ? 'set' : 'remove') +'Attribute']('hidden', '');
			}
		})
	}
}());

function getCookie(name) {
	var out = decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*'+ encodeURIComponent(name).replace(/[\-\.\+\*]/g, '\\$&') +'\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || 0;
	switch (out) {
		case 'enabled':
		case 'true':
		case '1':
			out = 1;
			break;
		case 'disabled':
		case 'false':
		case '0':
			out = 0;
	}
	return out;
}

function setCookie(name, value, days, host) {
	if (!name) return;
	
	var expires = (host ? '; domain='+ host : '' ) +'; path=/';
	
	if (!value) {
		expires += '; expires=Thu, 01-Jan-70 00:00:01 GMT';
	} else if (days) {
		expires += '; expires='+ new Date(Date.now() + days * 24 * 60 * 60 * 1000).toGMTString();
	}
	document.cookie = name +'='+ encodeURIComponent(value) + expires;
}

function showPostMenu(/* target, pid */) {
	// переработанное post-menu: при первом вызове создается html элемент, при последующих только перемещаем в нужное место
	var _pmct, postmenu = _z.setup('ul', {
		html: '<li class="show-irc post-menu-item de-menu-item">Диалоги</li><li class="edit-post post-menu-item de-menu-item">Редактировать</li>',
		class: 'post-menu reply de-menu'
	}, {
		mouseleave: function(e) { _pmct = setTimeout(function(){e.target.remove()}, 500) },
		mouseenter: function(e) { clearTimeout(_pmct) }
	});
	!(window.showPostMenu = function(target, pid) {
		var position = target.getBoundingClientRect();
		
		postmenu.setAttribute('data-num', pid);
		postmenu.style['top' ] = (position.top  + pageYOffset  + target.offsetHeight) +'px';
		postmenu.style['left'] = (position.left + pageXOffset) +'px';
		
		document.body.appendChild(postmenu);
	}).apply(this, arguments);
}

//reader need this function and onclick elements on thumbs
function expandimg(/* event, img_src, img_thumb, img_width, img_height, thumb_width, thumb_height */) {
	
	var box_image = new Image;
	var box_video = _z.setup('video', { id: 'v-play', controls: true });
		box_video.style = box_image.style = 'border-radius: 3px; border-width: 0px; position: absolute; display: inline-block;';
	
	var onWinResize, layer = _z.setup('div', {
		style : 'position: fixed; bottom: 0; top: 0; right: 0; left: 0; background-color: rgba(17,17,17,.9); z-index: 99999;',
		html  : '<div style="position: absolute; left: 50%; top: 50%; width: 100%; height: 100%;"><span></span></div>'
	},{ click : function(e) {
		if (e.target.id !== 'v-play') {
			this.remove();
			box_image.src = box_video.src = '';
			window.removeEventListener('resize', onWinResize, false);
		}
	}});
	
	var f = 'innerWidth' in window ? 'window.inner': document.documentElement ? 'document.documentElement.client' : 'document.body.client',
		getWasp = new Function('return { width: '+ f +'Width, height: '+ f +'Height }');
	
	!(expandimg = function(evt, src, thumb, oW, oH, tW, tH) {
		evt.preventDefault();
		
		var ctx = /\.webm$/.test(src) ? box_video : box_image;
			ctx.src = src;
		
		calcScale(ctx, oW, oH);
		
		window.addEventListener('resize', (onWinResize = function() {
			calcScale(ctx, oW, oH)
		}), false);
		
		document.body.appendChild(layer).firstElementChild.replaceChild(
			ctx, layer.firstElementChild.firstElementChild
		);
	}).apply(this, arguments);
	
	function calcScale(i, s, n) {
		var r, w = getWasp();
		if (w.width / w.height < s / n) {
			r = w.width * 0.85;
			r > s && ('high-res' == i.className || i.style.maxWidth) ? (i.width = s, i.height = n)  : (i.height = n * (r / s), i.width = r);
		} else {
			r = 0.85 * w.height;
			r > n && ('high-res' == i.className || i.style.maxHeight) ? (i.width = s, i.height = n)  : (i.width = s * (r / n), i.height = r);
		}
		i.style.left = (0 - i.width / 2) +'px';
		i.style.top = (0 - i.height / 2) +'px';
	}
}

function scrollHighlight(evt, pid) {
	var reply = document.getElementById('reply'+ pid);
	if (reply && !reply.classList.contains('de-pview')) {
		evt.preventDefault();
		if (evt.target.parentNode.className === 'reflink') {
			history.replaceState(null, document.title, location.pathname +'#'+ pid);
			$forEachClass('highlight', function(hl, i) {
				hl.classList.remove('highlight');
			});
			if (!reply.classList.contains('oppost')) {
				reply.classList.add('highlight');
			}
			if (!reply.classList.contains('PONY_popup'))
				return;
		}
		reply.parentNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}
}

function showFileSize(pid, num) {
	var fid = 'fs_'+ pid +'_'+ num;
	$forEachClass('fs_'+ pid, function(fs, i) {
		fs.style['display'] = fs.id === fid ? 'inline' : 'none';
	});
}

window.insertText = new Function('evt', 'txt', 'evt.preventDefault();\
   var msgbox = (document.forms["gala-edit-form"] || document.forms["postform"]).elements["message"],'+
   ('setSelectionRange' in HTMLInputElement.prototype ? '\
        start = msgbox.selectionStart,\
          end = msgbox.selectionEnd,\
          val = msgbox.value;\
   msgbox.value = val.substring(0, start) + txt + val.substring(end);\
   msgbox.selectionStart = msgbox.selectionEnd = start + txt.length;\
   msgbox.focus();' : '\
   c = msgbox.caretPos;\
   if (c) {\
      c.text = c.text.charAt(c.text.length - 1) == " " ? txt +" " : txt;\
   } else\
      msgbox.value += txt + " ";')
);

function _PonyRateHiglight(el, val) {
	el.className = el.className.replace(
		/\s?PONY_rate-(?:\w*)|$/, ' PONY_rate-'+ PONY_RATE[val]
	);
}

function isBlobDifferent($blob, _blob) {
	if (!$blob)
		return true;
	return $blob.size != _blob.size ||
	       $blob.type != _blob.type ||
	       $blob.name != _blob.name ||
	       $blob.lastModified != _blob.lastModified;
}
function $forEachClass(name, func) {
	Array.prototype.slice.call(
		document.getElementsByClassName(name), 0)
	.forEach(func);
}
function highlight(pid, y) {
	var reply = document.querySelector('#reply'+ pid +':not(.de-pview)');
	return !reply || !!reply.parentNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
function show_message_text(id) {
	$GET('/messages.php?m=view&id='+id, function(e) {
		$("#message_text").html('<br><a class="textbutton" title="Скрыть сообщение" onclick="hide_message_text()">[Скрыть]</a>'+
		'<a class="textbutton" title="Удалить сообщение" onclick="del_message('+ id +')">[X]</a><p>' + e.target.responseText +'</p>');
	});
}
function hide_message_text() {
	$("#message_text").html('');
}
function remove_messages() {
	$("#message_text").html('');
	$("#messages").html('');
}
function del_message(id) {
	$GET('/messages.php?m=del&id='+id, remove_messages)
}
function do_token() {
	var xmlHttp = new XMLHttpRequest();
		xmlHttp.open('GET', '/token.php', true);
		xmlHttp.onload = function() {
			var dateObj = new Date();
				dateObj.setTime((dateObj.getTime() + 10800000));
			document.cookie = 'ijslo='+ this.responseText +'; path=/; expires='+ dateObj.toUTCString();
		}
	xmlHttp.send(null);
}
function isInsideATag(str, sp, ep) {
	return (str.split(sp).length - 1) > (str.split(ep).length - 1);
}
function parseBoardURL(path) {
	var m = path.match(/^https?:\/\/[^\/]+\/(\w+)\/?(?:(?:res\/(0\d\d)?(\d+)|(\d+))\.html)?(?:#(\d+)|#.*?)?$/) ||
			path.match(/^https?:\/\/[^\/]+\/html\/(\w+)/);
		m.board = m[1] || ''; m.lastCount = Number(m[2]); m.thread = m[3] || 0; m.page = m[4] || ''; m.post = m[5] || '';
	return m;
}
function hashString(str) {
	var hash = 5381,
		i    = str.length;
		
	while(i) {
		hash = (hash * 33) ^ str.charCodeAt(--i);
	}
	return hash >>> 0;
}
function renderCaptcha(place, reCallback) {
	if (typeof window.grecaptcha === 'undefined') {
		setTimeout(function(){ renderCaptcha(place, reCallback) }, 2000);
	} else
		grecaptcha.render(place, {
			'sitekey' : '6Lfp8AYUAAAAABmsvywGiiNyAIkpymMeZPvLUj30',
			'expired-callback': reCallback,
			'theme'   : 'light',
			'callback': reCallback
		});
}

// аналог jQuery.get()
function $GET(URL, Fn) {
	var xmlHttp = new XMLHttpRequest();
		xmlHttp.open('GET', URL, true);
		xmlHttp['on'+ (arguments[2] || 'load')] = Fn;
		xmlHttp.send(null);
}

// аналог $(document).ready(), срабатывающий даже если вся страница давным давно загружена.
function $DOMReady(exec, final) {
	// проверяем статус страницы
	var eType = document.readyState === 'loading' ? 'DOMContentLoaded' : 'DOMCompleted';
	/* если все еще грузится, будет вызвано стандарное событие "DOMContentLoaded"
	   если же давно загрузилась будет создано несуществующее событие "DOMCompleted" и тут же вызвано вручную
	   отдельное событие нужно для того что бы случайно не вызвать еще раз события понавешанные другими скриптами */
	document.addEventListener(eType, function(event) {
		this.removeEventListener(eType, arguments.callee, false);
		eType = null;
		try      { exec(event) }
		catch(t) { console.error(t) }
		finally  { final && final(event) }
	}, false);

	if (eType === 'DOMCompleted') {
		document.dispatchEvent(new Event('DOMCompleted', { bubbles: true, cancelable: false }));
	}
}

function galamarK(tgOpen, tgClose, tgClass) {
	
	var val    = this.value;
	var end    = this.selectionEnd;
	var start  = this.selectionStart;
	var select = this.value.substring(this.selectionStart, this.selectionEnd);
	
	var offsetS = 0, offsetE, pins, wins, markedText;
	
	switch (tgClass) {
		case 'ql':
			var winSelect = window.getSelection().toString();
			if (winSelect && start == end) {
				select = winSelect;
				wins = true;
				if (val.length > 0) {
					start = end = val.length;
					tgOpen = tgClose;
				}
			}
			markedText = tgOpen + select.replace(/\n/gm, tgClose);
			break;
		case 'mdwn':
			var cont = typex().exec(select);
			markedText = select.replace(typex((cont === null ? 'gm' : '')), '$1'+ tgOpen +'$2'+ tgClose +'$3');
			pins = (arguments[3] || start === end);
			break;
		case 'ijct':
			markedText = tgOpen + (val.substring(start, start - 1) === '\n' ? tgClose : tgClose.slice(0, 1));
			wins = true;
			break;
		case 'scrn':
			markedText = select.length > 0 ? select.replace(/(%%|\^|!!|\*)/gm, tgOpen +'$1') : tgClose;
			break;
		case 'dice':
			var cont = typex().exec(select);
			var d = (/(\d+)(d\d+)?/).exec(
					(start === end ?  window.getSelection().toString() : select)
				),
				OdT = tgOpen + (d && d[2] ? d[0] : d && d[1] ? '1d'+ d[1] : '1d2') + tgClose +' ';
			markedText = cont === null ? select +' '+ OdT : !cont[2] ? cont[1] + OdT :
				(/^\d+|\d+d\d+$/).test(select) ? OdT : cont[1] + cont[2] +' '+ OdT;
			offsetS = markedText.length;
			break;
		case 'html':
		default:
			markedText = tgOpen + select + tgClose;
			pins = (arguments[3] || start === end);
	}
	this.value = val.substring(0, start) + markedText + val.substring(end);
	this.dispatchEvent(new InputEvent('input'));
	if (wins) {
		this.selectionStart = this.selectionEnd = this.value.length;
	} else {
		if (pins) {
			offsetS = tgOpen.length;
			offsetE = tgOpen.length + select.length;
		}
		this.setSelectionRange(start + offsetS, start + (offsetE || markedText.length))
		this.classList.add('ta-inact');
		this.focus();
	}
	function typex(gmi) {
		return new RegExp('^(\\s*)(.*?)(\\s*)$', (gmi || ''))
	}
}

function getDataResponse(uri, Fn) {
	var xhReq = new XMLHttpRequest;
	xhReq.open('GET', uri, true);
	xhReq.onreadystatechange = function() {
		if (this.readyState !== 4)
			return;
		if (this.status === 200) {
			try {
				var json = JSON.parse(this.responseText.trim());
			} finally {
				Fn((json === undefined ? this.responseText : json), this.responseURL);
			}
		} else {
			Fn({
				error: { status: this.status, message: this.statusText }
			}, this.responseURL);
		}
	}
	xhReq.send();
}
function getDataBinary(TYPE, Source, Fn) {
	if (typeof CDDRequest === 'object' && !(new RegExp('^'+ location.protocol +'//'+ location.hostname).test(Source))) {
		CDDRequest.get(TYPE.toLowerCase(), Source, Fn);
	} else {
		var dataReq = new XMLHttpRequest();
		dataReq.responseType = TYPE.toLowerCase();
		dataReq.onload = function() {
			if (this.readyState !== 4)
				return;
			if (this.status === 200) {
				Fn(this.response, this.responseURL);
			} else {
				console.warn('unable to get "'+ TYPE +'" from "'+ Source +'" ('+ this.status + (this.statusText ? ' '+ this.statusText : '') +')');
				Fn(null, this.responseURL);
			}
		};
		dataReq.open('GET', Source, true);
		dataReq.send(null);
	}
}

/* SpelzZ - a lightweight Node Work Tool */
function _z() {
	function __for_each(arr, Fn) {
		Array.prototype.slice.call((typeof arr === 'string' ? document.querySelectorAll(arr) : arr), 0).forEach(Fn);
	}
	function __node_build(el, _Attrs, _Events) {
		if (el) {
			if (typeof el === 'string') {
				el = document.createElement(el);
			}
			if (_Attrs) {
				for (var key in _Attrs) {
					_Attrs[key] === undefined ? el.removeAttribute(key) :
					key === 'html' ? el.innerHTML   = _Attrs[key] :
					key === 'text' ? el.textContent = _Attrs[key] :
					key in el    && (el[key]        = _Attrs[key] ) == _Attrs[key]
					             &&  el[key]       == _Attrs[key] || el.setAttribute(key, _Attrs[key]);
				}
			}
			if (_Events) {
				if ('remove' in _Events) {
					for (var type in _Events['remove']) {
						if (_Events['remove'][type].forEach) {
							_Events['remove'][type].forEach(function(fn) {
								el.removeEventListener(type, fn, false);
							});
						} else {
							el.removeEventListener(type, _Events['remove'][type], false);
						}
					}
					delete _Events['remove'];
				}
				for (var type in _Events) {
					el.addEventListener(type, _Events[type], false);
				}
			}
		}
		return el;
	}
	function __find_node(el, Fn) {
		var pat, tun;
		if (typeof Fn === 'string') {
			var pat = Fn;
			Fn = function() {
				return el.querySelector(pat);
			}
		}
		while (el) {
			if ((tun = Fn(el))) {
				return (tun instanceof Element ? tun : el);
			}
			if ((el = el.parentNode) === document.documentElement) {
				return null;
			}
		}
	}
	// apply prefixed event handlers
	function __prefixed_listener(fun, type, callback) {
		document[fun +'EventListener'](type.toLowerCase(), callback, false);
		document[fun +'EventListener']('webkit'+ type, callback, false);
		document[fun +'EventListener']('moz'+ type, callback, false);
		document[fun +'EventListener']('MS'+ type, callback, false);
	}
	return {
		each : __for_each,
		setup: __node_build,
		route: __find_node,
		documentListener: {
			add: __prefixed_listener.bind(null, 'add'),
			rm: __prefixed_listener.bind(null, 'rm')
		},
		replace: function(elems, nodes /* to replace with */) {
			if (elems && nodes) {
				elems = typeof elems === 'string' ? document.querySelectorAll(elems) : elems instanceof Element ? [elems] : elems;
				nodes = nodes instanceof Element ? [nodes] : nodes;
				for (var i = 0, k = nodes.length - 1; i < elems.length; i++) {
					elems[i].parentNode.replaceChild((nodes[i] || nodes[k].cloneNode(true)), elems[i]);
				}
			}
		},
		remove: function(/* elements to remove */) {
			if (arguments[0]) {
				var elems = arguments[0];
				var funct = function(child) { child.parentNode.removeChild(child) };
				elems instanceof Element ? funct(elems) : __for_each(elems, funct);
			}
		}
	}
} /* ===> end <=== */

/* ---{ Soundcloud Player Engine (Custom build) }--- */
var SCPurePlayer = (function() {
	
	var SC = {
		'APIKey': 'htuiRd1JP11Ww0X72T1C3g',
		'Volume': 1.0,
		'Tracks': {},
		'Object': {}
	}
	
	var _handler = 'ontouchstart' in window ? {
		start: 'touchstart',
		move: 'touchmove',
		end: 'touchend',
		getCoords: function(e) {
			return (e.touches.length === 1 ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } : null);
		}
	} : {
		start: 'mousedown',
		move: 'mousemove',
		end: 'mouseup',
		getCoords: function(e) {
			return (e.button === 0 ? { x: e.clientX, y: e.clientY } : null);
		}
	};
	
	var _Current_ = {
		
		TrackLoaded: null,
		SelectTrack: null,
		PlayerNode : null,
		AudioDevice: createAudioDevice(),
		/* Complex */
		set 'Player Volume' (vol) {
			this.AudioDevice.volume = vol;
			this.PlayerNode['_volume_'].firstElementChild.style['width'] = (vol * 100) +'%';
		},
		get 'Player Volume' () {
			return this.PlayerNode['_volume_'].firstElementChild.style['width'];
		},
		
		set 'Track Duration' (sec) {
			this.TrackLoaded.duration = sec;
			this.PlayerNode['_duration_'].textContent = (sec = timeCalc(sec));
			this.SelectTrack['_duration_'].textContent = sec;
		},
		get 'Track Duration' () {
			return this.SelectTrack['_duration_'].textContent;
		},
		
		set 'Track Progress' (sec) {
			this.PlayerNode['_position_'].textContent = timeCalc(sec);
			this.PlayerNode['_progress_'].style['width'] = (sec / this.TrackLoaded.duration * 100) +'%';
		},
		get 'Track Progress' () {
			return this.PlayerNode['_progress_'].style['width'];
		},
		
		set 'Track Buffered' (buf) {
			this.PlayerNode['_buffer_'].style['width'] = buf +'%';
		},
		get 'Track Buffered' () {
			return this.PlayerNode['_buffer_'].style['width'];
		},
		
		connect: function(player_node, track_node) {
			
			if (player_node && player_node !== this.PlayerNode) {
				if (this.PlayerNode) {
					this.PlayerNode[ '_volume_' ]['on'+_handler.start] = null;
					this.PlayerNode['_waveform_']['on'+_handler.start] = null;
				}
				this.PlayerNode = ('_trackslist_' in player_node ? player_node : catchKeyElements('player', player_node));
				this.PlayerNode[ '_volume_' ]['on'+_handler.start] = barChanger;
				this.PlayerNode['_waveform_']['on'+_handler.start] = barChanger;
				this['Player Volume'] = SC.Volume;
			}
			
			if (!track_node) {
				track_node = this.PlayerNode.querySelector('.sc-track.active') || this.PlayerNode['_trackslist_'].firstElementChild;
			}
				
			if (track_node && track_node !== this.SelectTrack) {
				(this.PlayerNode.querySelector('.sc-track.active') || {}).className = 'sc-track';
				track_node.className = 'sc-track active';
				
				this.SelectTrack = ('_duration_' in track_node ? track_node : catchKeyElements('track', track_node));
				this.TrackLoaded = SC['Tracks'][track_node.id.split('_')[2]];
				
				this['Track Progress'] = 0;
				this['Track Buffered'] = 0;
				
				updateTrackInfo(this.PlayerNode, this.TrackLoaded);
				this['AudioDevice'].src = this.TrackLoaded.stream_url + (this.TrackLoaded.stream_url.indexOf('?') >= 0 ? '&' : '?') +'consumer_key='+ SC.APIKey;
				this['AudioDevice'].play();
			}
		}
	}
	
	function $getTracks(url, callback, errorback) {
		if (!url || typeof callback !== 'function') {
			return;
		}
		var protocol = (location.protocol === 'https:' ? 'https:' : 'http:'),
			resolve = protocol +'//api.soundcloud.com/resolve?url=',
			apiUrl = url.replace(/^https?:/, protocol),
			params = 'format=json&consumer_key='+ SC.APIKey,
			$bound = function(data) {
				if (data.error)
					return errorback(data.error);
				if (data) {
					if (data.tracks) {
						// log('data.tracks', data.tracks);
						callback(data.tracks);
					} else if (Array.isArray(data)) {
						callback(data);
					} else if (data.duration){
						// a secret link fix, till the SC API returns permalink with secret on secret response
						data.permalink_url = url;
						// if track, add to player
						callback([data]);
					} else if (data.creator || data.username) {
						// get user or group tracks, or favorites
						getDataResponse(data.uri + (data.username && url.indexOf('favorites') >= 0 ? '/favorites' : '/tracks') +'?'+ params, $bound);
					}
				}
			}
		// check if it's already a resolved api url
		if ((/api\.soundcloud\.com/).test(url)) {
			apiUrl += '?' + params;
		} else {
			apiUrl = resolve + apiUrl + '&' + params;
		}
		getDataResponse(apiUrl, $bound);
	}
	function _scCreateGroup(links) {
		var hash = genGroupId(),
			node = createPlayerDOM(hash, links.length),
			ibx  = links.length, exp, i;
		
		for (i = 0; i < links.length; i++) {
			exp = { hash: hash, node: node, it: i };
			
			$getTracks(links[i].href, function(tracks) {
				var tNode  = createTrackDOM(tracks[0], this.hash),
					tChild = this.node['_trackslist_'].children['ft_'+ this.hash +'_'+ this.it];
				
				this.node['_trackslist_'].replaceChild(tNode, tChild); ibx--;
				
				if (this.it == 0 || !this.node['_trackslist_'].querySelector('.active') && ibx == 0) {
					updateTrackInfo(this.node, tracks[0]);
					tNode.className += ' active';
				}
				
				for (var n = 1; n < tracks.length; n++) {
					tChild = tNode.nextSibling;
					tNode  = createTrackDOM(tracks[n], this.hash);
					this.node['_trackslist_'].insertBefore(tNode, tChild);
				}
			}.bind(exp), function(error) {
				ibx--;
				this.node['_trackslist_'].children['ft_'+ this.hash +'_'+ this.it].remove();
				if (ibx == 0) {
					if (this.node['_trackslist_'].children.length == 0) {
						this.node.removeAttribute('id');
					} else if (!
						this.node['_trackslist_'].querySelector('.active')) {
						var tNode = this.node['_trackslist_'].firstElementChild;
						updateTrackInfo(this.node, SC['Tracks'][tNode.id.split('_')[2]]);
						tNode.className += ' active';
					}
				}
			}.bind(exp));
		}
		
		return node;
	}
	
	function _scCreate(link) {
		var hash = genGroupId(),
			node = createPlayerDOM(hash),
			exp = { hash: hash, node: node };
		
		$getTracks(link.href, function(tracks){
			var _$ = this;
			tracks.forEach(function(track, j) {
				var tNode = createTrackDOM(track, _$.hash);
				
				_$.node['_trackslist_'].insertBefore(tNode, _$.node['_trackslist_'].childNodes[j]);
				
				if (j == 0) {
					updateTrackInfo(_$.node, track);
					tNode.className += ' active';
				}
			});
		}.bind(exp), function(error) {
			this.node.removeAttribute('id');
		}.bind(exp));
		
		return node;
	}
	function onEnd(e) {
		 var play_next;
		if ((play_next = _Current_.SelectTrack.nextElementSibling)) {
			_Current_.connect(null, play_next);
		} else {
			_Current_.PlayerNode['_button_'].className = 'sc-play';
			_Current_.PlayerNode['_button_'].textContent = 'Play';
			_Current_.PlayerNode.className = 'sc-player';
			_Current_.SelectTrack.className = 'sc-track';
			_Current_.PlayerNode['_trackslist_'].children[0].className = 'sc-track active';
			if ((play_next = _Current_.PlayerNode.nextElementSibling) &&
				 play_next.className.substring(0, 9) === 'sc-player') {
					_Current_.connect(play_next);
			}
		}
	}
	function onTimeUpdate(e) {
		_Current_['Track Progress'] = e.target.currentTime;
	}
	function onBufferLoad(e) {
		if (_Current_['Track Buffered'] !== '100%') {
			_Current_['Track Buffered'] = this.bytesPercent;
		}
	}
	function onPlayerAction(e) {
		for (var i = 0, el = document.querySelectorAll(
			'.sc-pause, .sc-player.played, .sc-player.paused'
		); i < el.length; i++) {
			if (el[i].className === 'sc-pause') {
				el[i].className   = 'sc-play';
				el[i].textContent = 'Play'   ;
			} else {
				el[i].className = 'sc-player';
			}
		}
		var ype = (e.type === 'play' ? 'ause' : 'lay')
		_Current_.PlayerNode['_button_'].className   = 'sc-p'+ ype;
		_Current_.PlayerNode['_button_'].textContent = 'P'   + ype;
		_Current_.PlayerNode.className = 'sc-player '+ e.type + (e.type === 'play' ? 'ed' : 'd');
	}
	function barChanger(e) {
		var coords = _handler.getCoords(e);
		if (!coords) {
			return;
		}
		e.preventDefault();
		
		var barMove, barEnd, seek, maxs, vol;
		var rect = this.getBoundingClientRect(),
			x = (coords.x - rect.left) / ('width' in rect ? rect.width : (rect.width = rect.right - rect.left));
			
		if (this === _Current_.PlayerNode['_waveform_']) {
			maxs = _Current_.TrackLoaded.duration;
			seek = x > 1 ? maxs : x < 0 ? 0 : Math.floor(maxs * x * 1000000) / 1000000;
			barMove = function(eM) {
				maxs = _Current_.TrackLoaded.duration;
				x = (_handler.getCoords(eM).x - rect.left) / rect.width;
				seek = x > 1 ? maxs : x < 0 ? 0 : Math.floor(maxs * x * 1000000) / 1000000;
				_Current_['AudioDevice'].ontimeupdate = null;
				_Current_['Track Progress'] = seek;
			}
			barEnd = function(eE) {
				_Current_['Track Progress'] = seek;
				_Current_['AudioDevice'].currentTime  = seek;
				_Current_['AudioDevice'].ontimeupdate = onTimeUpdate;
				window.removeEventListener(_handler.move, barMove, false);
				window.removeEventListener(eE.type, barEnd, false);
			}
		} else if (this === _Current_.PlayerNode['_volume_']) {
			vol = x > 1 ? 1 : x < 0 ? 0 : Math.round(x * 10) / 10;
			barMove = function(eM) {
				x = (_handler.getCoords(eM).x - rect.left) / rect.width;
				vol = x > 1 ? 1 : x < 0 ? 0 : Math.round(x * 10) / 10;
				_Current_['Player Volume'] = SC.Volume = vol;
			}
			barEnd = function(eE) {
				_Current_['Player Volume'] = SC.Volume = vol;
				window.removeEventListener(_handler.move, barMove, false);
				window.removeEventListener(eE.type, barEnd, false);
			}
		}
		window.addEventListener(_handler.move, barMove, false);
		window.addEventListener(_handler.end, barEnd, false);
	}
	
	function createAudioDevice(url) {
		var audio, html5, flash;
		if (typeof HTMLAudioElement !== 'undefined') {
			audio = new Audio();
			html5 = audio.canPlayType && (/maybe|probably/).test(audio.canPlayType('audio/mpeg'));
		}
		if (!html5) {
			audio = document.createElement('object');
			audio.id     = 'scPlayerEngine';
			audio.height = 1;
			audio.width  = 1;
			audio.type   = 'application/x-shockwave-flash';
			audio.data   = '/lib/javascript/player_mp3_js.swf';
			audio.innerHTML = '<param name="movie" value="/lib/javascript/player_mp3_js.swf" /><param name="AllowScriptAccess" value="always" /><param name="FlashVars" value="listener=flashBack2343191116fr_scEngine&interval=500" />';
			
			flash = (window['flashBack2343191116fr_scEngine'] = new Object());
			flash.onInit = function() {
				Object.defineProperties(audio, {
					play        : { value: function()    {
						flash.status = 'process';
						this.SetVariable('method:play', '');
						this.SetVariable('enabled', 'true');
						onPlayerAction({type: 'play'}); }},
					pause       : { value: function()    {
						flash.status = 'waiting';
						this.SetVariable('method:pause', '');
						onPlayerAction({type: 'pause'}); }},
					src         : { get: function()    { return this.url },
								    set: function(url) { this.SetVariable('method:setUrl', url) }},
					ended       : { get: function()    { return flash.status === 'ended' }},
					playing     : { get: function()    { return JSON.parse(flash.isPlaying); }},
					duration    : { get: function()    { return Number(flash.duration) / 1000 || 0 }},
					currentTime : { get: function()    { return Number(flash.position) / 1000 || 0 },
								    set: function(rel) { this.SetVariable('method:setPosition', (rel * 1000)) }},
					volume      : { get: function()    { return Number(flash.volume) / 100 },
								    set: function(vol) { this.SetVariable('method:setVolume', (vol * 100)) }},
					ontimeupdate: { set: function(fn)  { flash.onTimeUpdate = fn || function(){} }}
				});
				audio['volume'] = SC.Volume;
				this.position = 0;
			};
			flash.onTimeUpdate = onTimeUpdate;
			flash.onBufferLoad = onBufferLoad;
			flash.onUpdate = function() {
				switch (this.status) {
					case 'process':
						this.onTimeUpdate({target: audio});
						if (this.position == '0' && this.isPlaying == 'false') {
							this.status = 'ended';
							onEnd();
						}
					case 'waiting':
						this.onBufferLoad();
				}
			};
		} else {
			Object.defineProperties(audio, {
				bytesPercent: { get: function()    { return ((this.buffered.length && this.buffered.end(0)) / this.duration) * 100; }}
			});
			audio['volume'] = SC.Volume;
			audio['onplay'] = audio['onpause'] = onPlayerAction;
			audio['onended'] = onEnd;
			audio['ontimeupdate'] = onTimeUpdate;
			audio.addEventListener('timeupdate', onBufferLoad, false);
			audio['onprogress'] = onBufferLoad;
			audio['onloadedmetadata'] = function(e) {
				if (_Current_.TrackLoaded.duration !== this.duration) {
					_Current_['Track Duration'] = this.duration;
				}
			};
		}
		return audio;
	}
	function createTrackDOM(track, hash) {
		SC['Tracks'][track.id] = track;
		var li = document.createElement('li');
			li.id = 'sc-t_'+ hash +'_'+ track.id;
			li.className = 'sc-track';
			li.appendChild((
				li['_title_'] = document.createElement('a')));
				li['_title_'].href = track.permalink_url;
				li['_title_'].className = 'sc-track-title';
				li['_title_'].textContent = track.title;
			li.appendChild((
				li['_duration_'] = document.createElement('span')));
				li['_duration_'].className = 'sc-track-duration';
				li['_duration_'].textContent = timeCalc((track.duration /= 1000));
		return  li;
	}
	function _li(h, l) {
		var li ='', i;
		for (i = 0; i < l; i++)
			li += '<span id="ft_'+h+'_'+i+'"></span>';
		return li;
	}
	function createPlayerDOM(hash, len) {
		var div = document.createElement('div');
			div.className = 'sc-player loading';
			div.innerHTML = '<ol class="sc-artwork-list"></ol>\n'+
				'<div class="sc-info"><h3></h3><h4></h4><p></p><a class="sc-download">—=&gt;Download&lt;=—</a>\n'+
				'	<div class="sc-info-close">X</div>\n'+
				'</div>\n'+
				'<div class="sc-controls">\n'+
				'	<div class="sc-play">Play</div>\n'+
				'</div>\n'+
				'<ol class="sc-trackslist">'+ _li(hash, len) +'</ol>\n'+
				'<div class="sc-info-toggle">Info</div>\n'+
				'<div class="sc-time-indicators">\n'+
				'	<span class="sc-position"></span>&nbsp;|&nbsp;<span class="sc-duration"></span>\n'+
				'</div>\n'+
				'<div class="sc-scrubber">\n'+
				'	<div class="sc-volume-slider">\n'+
				'		<span class="sc-volume-status" style="width: '+ (SC.Volume * 100) +'%;"></span>\n'+
				'	</div>\n'+
				'	<div class="sc-time-span">\n'+
				'		<div class="sc-buffer"></div>\n'+
				'		<div class="sc-played"></div>\n'+
				'		<div class="sc-waveform-container"></div>\n'+
				'	</div>\n'+
				'</div>';
		if (hash) {
			div.id = 'sc-obj_'+ hash;
		}
		return catchKeyElements('player', div);
	}
	
	function catchKeyElements(name, _CN_) {
		switch(name) {
			case 'player':
				_CN_['_artwork_']    = _CN_.querySelector('.sc-artwork-list');
				_CN_['_info_']       = _CN_.querySelector('.sc-info');
				_CN_['_button_']     = _CN_.querySelector('.sc-controls').firstElementChild;
				_CN_['_trackslist_'] = _CN_.querySelector('.sc-trackslist');
				_CN_['_volume_']     = _CN_.querySelector('.sc-volume-slider');
				_CN_['_waveform_']   = _CN_.querySelector('.sc-waveform-container');
				_CN_['_buffer_']     = _CN_.querySelector('.sc-buffer');
				_CN_['_progress_']   = _CN_.querySelector('.sc-played');
				_CN_['_duration_']   = _CN_.querySelector('.sc-duration');
				_CN_['_position_']   = _CN_.querySelector('.sc-position');
				break;
			case 'track':
				_CN_['_duration_']   = _CN_.querySelector('.sc-track-duration');
				_CN_['_title_']      = _CN_.querySelector('.sc-track-title');
		}
		
		return _CN_;
	}
	
	function updateTrackInfo(node, track) {
		var artwork = track.artwork_url || track.user.avatar_url;
		if (artwork && !/\/(?:default_avatar_|avatars-000044695144-c5ssgx-)/.test(artwork)) {
			var img = node['_artwork_'].firstElementChild || document.createElement('img');
			if (node['_artwork_'].clientWidth > 100) {
				var s = findBestMatch([200, 250, 300, 500], node['_artwork_'].clientWidth);
				artwork = artwork.replace('-large', '-t'+ s +'x'+ s +'')
			}
			img.src = artwork;
			node['_artwork_'].appendChild(img);
		}
		node['_info_'].children[0].innerHTML = '<a href="' + track.permalink_url +'">' + track.title + '</a>';
		node['_info_'].children[1].innerHTML = 'by <a href="' + track.user.permalink_url +'">' + track.user.username + '</a>';
		node['_info_'].children[2].innerHTML = (track.description || 'no Description');
		node['_info_'].children[3].href = track.download_url +'?consumer_key='+ SC.APIKey;
		node['_info_'].children[3].hidden = !track.downloadable;
		// update the track duration in the progress bar
		node['_duration_'].textContent = timeCalc(track.duration);
		node['_position_'].textContent = '00.00';
		// put the waveform into the progress bar
		var wave = node['_waveform_'].firstElementChild || document.createElement('img');
			wave.src = track.waveform_url;
		node['_waveform_'].appendChild(wave);
	}
	
	function findBestMatch(list, toMatch) {
		var item, i = 0, len = list.length;
		while (i < len && (item = list[i]) < toMatch)
			i++;
		return item;
	}
	function timeCalc(secn) {
		var s, m, h;
			s = Math.floor(secn) % 60;
			m = Math.floor(secn / 60) % 60;
			h = Math.floor(secn / (60 * 60));
			
		return (h > 0 ? h +'.' : '') + (m < 10 && m > -1 ? '0'+ m : m) +'.'+ (s < 10 && s > -1 ? '0'+ s : s);
	}
	function genGroupId() {
		var n = Math.round(Math.random() * 12345679);
		while (n in SC['Object']) n++;
		return (SC['Object'][n] = n);
	}
	
	return {
		io: _Current_,
		create: _scCreate,
		createGroup: _scCreateGroup
	}
})(); /* ===> end <=== */
	
	EXT_STYLE.appendChild(document.createTextNode('.de-src-iqdb:after, #de-txt-panel:after { content:""; -webkit-animation: init 1s linear 2; animation: init 1s linear 2; }\
\
.greenmk:not(.inactive):before { content: "✓ "; color: green; }\
.feckbox { font-size: small; margin-right: 5px; font-variant-caps: all-petite-caps; } input:checked + .feckbox { text-decoration: line-through; }\
.dropbox { position: absolute; z-index: 1; height: 100%; top: 0px; left: 0px; background-color: rgba(0,0,0,.5); border: 2px dashed white; width: 100px; text-align: center; color: white; border-radius: 4px; }\
.greenmk, .dropdown-menu li, .dropdown-arrow { -webkit-touch-callout:none; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; }\
.file-area, .dropdown-toggle, .text-line-ic, #gala-replytitle { position: relative; }\
#gala-replytitle, .gala-globalform-area { text-align: center; }\
\
.files-add { bottom: 0; position: absolute; background-color: rgba(0,0,0,.1); border-radius: 5px; text-align: center; height: 20px; width: 25px; cursor: pointer; }\
.files-params { display: none; text-align: center; max-width: 100px; } .file-area.hold > .files-params { display: block; }\
.file-gox { margin-right: 4px; margin-top: 4px; position: relative; width: 100px; }\
.file-gview { max-width: 100px; max-height: 100px; margin: 0 auto; display: block; }\
.file-cover-label, .file-remove { position: absolute; cursor: default; text-align: center; font-size: 10px; } .file-remove:hover { opacity: 1;}\
.file-remove { background-color: black; border-radius: 100%; width: 14px; height: 14px; top: 2px; left: 2px; color: white; } .file-remove:before { content: "×"; }\
.file-cover-label { bottom: 2px; right: 0; } .file-cover-label:after { font-weight: bold; border-radius: 7px; padding: 1px 5px; color: white; margin: 0 6px; } .file-cover-label.N:after { content: "[\xA0]"; }\
.file-cover-select, .dropdown-menu { padding-left: 0; list-style: outside none none; } .file-cover-select { display: none; background-color: #fefefe; margin: 0; } .active > .file-cover-select { display: inherit; }\
.file-cover { padding: 0 10px; cursor: default; } .S:after { content: "[S]"; } .C:after { content: "[C]"; } .A:after { content: "[A]"; } .file-cover.N { padding-top: 13px; } .file-cover:hover { color: #fff!important; }\
.file-cover-label.S:after,.file-cover.S:hover, .de-rpiStub.S:before, .de-rpiStub.S:after { background-color: #8C60B1; }\
.file-cover-label.C:after,.file-cover.C:hover, .de-rpiStub.C:before, .de-rpiStub.C:after { background-color: #E65278; }\
.file-cover-label.A:after,.file-cover.A:hover, .de-rpiStub.A:before, .de-rpiStub.A:after { background-color: #3B60AE; }\
.file-cover-label.N:after,.file-cover.N:hover { background-color: #777; }\
\
select#default_file_rating { background: none; border: none; color: inherit; -webkit-appearance: none; -moz-appearance: none; text-overflow: ""; } select#default_file_rating > option { background-color: #fefefe; }\
option.rating-N:checked, option.rating-N:hover { box-shadow: 0 0 0 99px #777 inset; } option.rating-N { color: transparent; }\
option.rating-C:checked, option.rating-C:hover, .PONY_rate-C { box-shadow: 0 0 0 99px #E65278 inset; }\
option.rating-S:checked, option.rating-S:hover, .PONY_rate-S { box-shadow: 0 0 0 99px #8C60B1 inset; }\
option.rating-A:checked, option.rating-A:hover, .PONY_rate-A { box-shadow: 0 0 0 99px #3B60AE inset; }\
\
.dropdown-toggle.ins-act:before { content: " ▲ "; padding: 0 5px 15px; border-radius: 4px 4px 0 0; line-height: 1.6; }\
.ins-act:before, .dropdown-menu { font-size: 14px; line-height: 1.8; color: #eee; position: absolute; z-index: 1000; border: 1px solid #222; box-shadow: 0 6px 12px rgba(0,0,0,.2); background-clip: padding-box; background-color: #222; border-radius: 4px; left: 0; }\
.dropdown-menu { border-radius: 0 0 4px 4px; line-height: 1.8; min-width: 160px; display: none; margin: 0; } .ins-act > .dropdown-menu { display: list-item; }\
.dropdown-menu li { padding-left: 10px; color: white; text-shadow: none; } .dropdown-menu li:hover { background: #555; -moz-user-select: none; transition: #6363CE .2s ease,color .2s ease; }\
\
.gala-freestyle { position: fixed; z-index: 9999; } .gala-globalform-area .gala-freestyle { position: inherit; } .gala-globalform-area #gala-replytitle, .greenmk { display: none; }\
.gala-globalform-area .greenmk { display: block; } .gala-globalform-area #gala-reply-form { background: transparent!important; box-shadow: none!important; border: none!important; }\
.gala-globalform-close:before { content: "Убрать форму"; cursor: pointer; } .gala-globalform-open:before { content: "Раскрыть форму"; cursor: pointer; }\
#galatext { resize: both; font-size: 14px; }\
.text-line-ic, .text-line-ic > * { vertical-align: middle; } .text-line-ic > input[type="text"] { min-width: 240px; }\
.text-line-ic > input[name="subject"] { margin-left: 8px; } #submit_this_form { margin-left: -10px; font-variant: small-caps; }\
#submit_this_form:disabled:hover, #submit_this_form:disabled { color: inherit!important; background: transparent!important; left: 0; }\
#gala-error-msg { text-align: center; color: white; }\
#gala-replytitle > .filetitle { font-variant: small-caps; font-size: small; vertical-align: super; }\
.pin-buttons { position: absolute; left: 0; } .inverted, .gala-freestyle .toggleform { transform: rotate(180deg); }\
.ls-de-svg { margin: 0 2px -3px; cursor: pointer; width: 16px; height: 16px; }\
.sagearrow { position: absolute; right: 1px; bottom: 3px; } .inactive, .file-remove { opacity: .4; }\
\
.buttons-style-standart > .markup-button > *:not(input), .buttons-style-text > .markup-button >  *:not(a) { display: none; }\
.markup-button > a{ font-size:13px; text-decoration: none; }\
.buttons-style-text > .markup-button:not(.quote):after, .sep:after{ content:"\xA0|\xA0"; cursor: default; opacity: .3; }\
\
.gmark-btn, .new-thr-chx{ cursor: pointer; } .gmark-btn, .sep { display: table-cell; }\
.gmark-btn.bold:before{ content: "жирн"; } .bold { font-weight: bold; }\
.gmark-btn.italic:before{ content: "курс"; } .italic { font-style: italic; }\
.gmark-btn.underline:before{ content: "подч"; } .underline { text-decoration: underline; }\
.gmark-btn.strike:before{ content: "зач"; } .strike { text-decoration: line-through; }\
.gmark-btn.sup:after{ content: "верхн"; } .sup{ font-variant: super; } .gmark-btn.sup:before{ content:"∧"; font-variant: normal; }\
.gmark-btn.sub:after{ content: "нижн"; } .sub{ font-variant: sub; } .gmark-btn.sub:before{ content:"∨"; font-variant: normal; }\
.gmark-btn.spoiler:before{ content: "спой"; }\
.gmark-btn.rcv:before{ content: "важн"; }\
.gmark-btn.code:before{ content: "{код}"; font-family: monospace; }\
.gmark-btn.dice:before{ content: "1d2 = ?"; font-variant: normal; }\
.gmark-btn.rp:before{ content: "роле"; }\
.gmark-btn.unkfunc0:before{ content: "> цит"; }\
\
.reply .mediacontent, .reply .de-video-obj, .reply .imagecontent, .reply > .post-files > .file, .embedmedia { float: left; }\
.mediacontent ~ blockquote, .de-video-obj ~ blockquote, .imagecontent ~ blockquote, .clearancent > blockquote { clear: both; }\
\
span[de-bb]{ position: absolute; visibility: hidden; } input, textarea { outline: none; }\
.mv-frame { position: absolute; background-color: rgba(0,0,0,.7); color: white; cursor: pointer; width: 40px; line-height: 40px; text-align: center; border-radius: 0 0 10px 0; opacity: .5;} .mv-frame:hover { opacity: 1; } .mv-frame.to-win:before { content: "[ ↑ ]"; } .mv-frame.to-post:before { content: "[ ↓ ]"; }\
.de-src-derpibooru:before { content:""; padding-right: 16px; margin-right: 4px; background: url(/test/src/140903588031.png) center / contain no-repeat; }\
.hidup{ top:-9999px!important; } .hidout, #gala-edit-form ~ * { display: none!important; }\
.mediacontent > .video-container { display: inline-block; background-color: #212121; margin: 0 9px; margin-bottom: 5px;  max-height: 360px; max-width: 480px; }\
.document-container{ overflow: auto; resize: both; background-color:#fefefe; }\
.content-window{ position: fixed; left: 0; top: 0; z-index: 2999; }\
#content-frame { position: absolute; top: 10%; left: 0; right: 0; bottom: 20%; z-index:3000; max-width: 100%; }\
#content-frame > * { left: 0; right: 0; margin: auto; box-shadow: 5px 5px 10px rgba(0,0,0,.4); position: absolute; }\
#content-frame > .gdoc-container { top: -9%; bottom: -19%; margin: auto 10%; background-color:#D1D1D1; }\
#content-frame > .video-container { max-height: 100%; max-width: 100%; background-color: #212121; }\
#shadow-box{ position: absolute; background-color: rgba(33,33,33,.8); z-index: 2999; }\
#close-content-window, #show-content-window{ transition: .5s ease; opacity: .4; width: 29px; height: 29px; cursor: pointer; top: 20px; z-index: 3000; }\
#close-content-window { right: 20px; position: absolute; background-image: url(/test/src/141665751261.png); }\
#show-content-window  { right: 52%;  position: fixed;    background-image: url(/test/src/141667895174.png); border-radius: 100%; box-shadow: 0 1px 0 rgba(0,0,0,.4), -1px 1px 0 rgba(0,0,0,.4); }\
#close-content-window:hover, #show-content-window:hover { opacity: .8; }\
.ta-inact::-moz-selection{ background: rgba(99,99,99,.3); } .ta-inact::selection{ background: rgba(99,99,99,.3); }\
.document-container > iframe, .document > iframe, .full-size, #shadow-box, .content-window{ width:100%; height:100%; }\
.audio-container { display: block; }\
.image-attach{ display: inline-block; border: medium none; cursor: pointer; margin: 2px 20px; } .image-attach:not(.expanded){ max-width: 290px; max-height: 290px; } .image-attach.expanded{ max-width: 100%px; max-height: auto; }\
.cm-button{ text-decoration: none; background: transparent left / 16px no-repeat; } .cm-button:before{ content:""; margin-left: 20px;}\
.cm-pastebin{ font: 12px monospace; padding: 2px 0; background-image: url(/test/src/140593041526.png); }\
.cm-image{ background-image: url(/test/src/140896790568.png); } .cm-image:before{ content: "Expand: "; } .cm-image.attached:before{ content: "Unexpand: "; }\
.cm-play{ background-image: url(/test/src/139981404639.png); } .cm-play:before{ content: "Play: "; }\
.cm-stop{ background-image: url(/test/src/148214537312/7673443634.png); } .cm-stop:before{ content: "Stop: "; }\
@keyframes init{ 50% {opacity:0} } @-webkit-keyframes init{ 50% {opacity:0} }'));

/* ---{ Gala ponyach.ru Extension }--- */
var Gala = (function() {
	
	var _EmbedField = localStorage.getItem('EmbedField') || 0;
	var _Container, _EditForm, _GalaForm;
	
	_Container = {
		zIndex: 1,
		Audio: _z.setup('audio', { class: 'audio-container', controls: true}),
		Video: _z.setup('video', { class: 'video-container', controls: true}),
		OVERLAY: _z.setup('div', { class: 'content-window hidup', html: '<div id="shadow-box"></div><label id="close-content-window"></label><div id="content-frame"></div>'}, {
			'click': function(e) {
				switch (e.target.id) {
					case 'close-content-window':
						_z.remove([this, _Container['Marker']]);
						_z.remove(this.lastElementChild.childNodes);
						break;
					case 'content-frame':
					case 'shadow-box':
						this.classList.add('hidup');
						_Container['Marker'].classList.remove('hidout');
				}
			}, 'mousedown': function(e) {
				if (e.target.className.indexOf('-container') >= 0) {
					_Container.zIndex++;
					e.target.style['z-index'] = _Container.zIndex;
				}
			}
		}),
		Marker: _z.setup('label', {'id': 'show-content-window', 'class': 'hidout'}, {
			'click': function(e) {
				_Container['OVERLAY'].classList.remove('hidup');
				this.classList.add('hidout');
			}
		}),
		loadFrame: function(frame) {
			var exist = this['OVERLAY'].lastElementChild.children[frame.id];
			if (!this['OVERLAY'].parentNode)
				document.body.append( this['OVERLAY'], this['Marker'] );
			if (!exist) {
				if ((exist = this['OVERLAY'].lastElementChild.querySelector('.'+ frame.className))) {
					this['OVERLAY'].lastElementChild.replaceChild(frame, exist);
				} else {
					this.zIndex++;
					frame.style['z-index'] = this.zIndex;
					this['OVERLAY'].lastElementChild.appendChild(frame);
				}
			} else {
				this.zIndex++;
				frame.style['z-index'] = this.zIndex;
			}
			this['Marker'].classList.add('hidout');
			this['OVERLAY'].classList.remove('hidup');
		}
	}
	
	function jumpCont(node, name, cont) {
		do {
			if (node.tagName === 'BLOCKQUOTE') {
				if (!(cont = node.parentNode.querySelector('.'+ name))) {
					cont = _z.setup('span', {'class': name});
					switch (name) {
						case 'mediacontent':
							node.before( cont );
							break;
						case 'imagecontent':
							node.parentNode.prepend( cont );
					}
				}
				return cont;
			}
		} while (
			(node = node.parentNode)
		);
	}
	
	//-- Get Page name from Url
	function getPageName(url) {
		var a = url.split('/'), p = a.pop();
		return decodeURIComponent((!p ? a.pop() : p));
	}
	//-- Get File name from Url
	function getFileName(url) {
		var m = /(?:\/|#|\?|&)(([^?\/#&]*)\.\w\w\w\w?)$/.exec(url);
		return decodeURIComponent(m && m[2] ? m[1] : url.split('/').pop());
	}
	
	var KeyChars = {
		code: ['{', '[', '(', '\'', '"'],
		edoc: ['}', ']', ')', '\'', '"'],
		symbs: ['"', '^', '*', '(', '\\', '!', '#', '%'],
		doubs: ['"', '^', '*', ')', '\\', '!!', '##', '%%'],
		quots: ['@', '>'],
		complex: 0
	}
	function keyMarks(e) {
		try {
			var _inTA = e.target.id === 'galatext' || e.target.id === 'msgbox';
			var $this = _inTA ? e.target : document.querySelectorAll('#gala-reply-form #galatext, #postform #msgbox')[0];
			if ($this && MAIN_SETTINGS.keymarks) {
				var key    = e.key || String.fromCharCode(e.charCode);
				var start  = $this.selectionStart;
				var end    = $this.selectionEnd;
				var val    = $this.value;
				var uchar  = $this.value.substring($this.selectionStart - 1, $this.selectionStart);
				var fpage  = $this.value.substring(0, $this.selectionStart);
				var select = $this.value.substring($this.selectionStart, $this.selectionEnd);
				var exit   = true, c;
				
				if (_inTA && isInsideATag(fpage, '[code]', '[/code]')) {
					if ((c = KeyChars.code.indexOf(key)) != -1) {
						$this.textMark(KeyChars.code[c], KeyChars.edoc[c], 'mdwn');
						KeyChars.complex = -1;
					} else {
						switch (e.keyCode * KeyChars.complex) {
							case 9:
							case -9:
								$this.textMark('   ', '\n   ', 'ql');
								break;
							case -8:
								var offset = start - 1;
								$this.value = val.slice(0, offset) + val.slice(end + 1);
								$this.setSelectionRange(offset, offset);
								break;
							case -13:
								var ls = fpage.split('\n'),
									pan = (new RegExp('(?:^|\\n)([\\s]*)'+ uchar, '').exec(ls[ls.length - 1])|| { 1:'' })[1],
									fc = '\n   ' + pan, sc = '\n' + pan,
									offset = start + fc.length - 1;
								
								$this.value = fpage + fc + sc + val.substring(end);
								$this.setSelectionRange(offset, offset);
								break;
							default:
								exit = false;
						}
						KeyChars.complex = 1;
					}
				} else if (_inTA && select.length > 0 && (c = KeyChars.symbs.indexOf(key)) != -1) {
					$this.textMark(
						(key === '(' ?  key  : KeyChars.doubs[c]), KeyChars.doubs[c], (
						 key === '#' ? 'dice':
						 key === '\\'? 'scrn': 'mdwn'));
				} else if (
					(c = KeyChars.quots.indexOf(key)) != -1 &&
					(_inTA ? select : window.getSelection().toString()).length > 0) {
						key === '@' ? $this.textMark('• ', '\n• ', 'ql') :
						              $this.textMark(key +' ', '\n'+ key +' ', 'ql');
				} else
					exit = false;
				if (exit)
					return e.preventDefault();
			}
			if (_inTA && e.keyCode != 8 && $this.classList.contains('ta-inact')) {
				$this.setSelectionRange($this.selectionEnd, $this.selectionEnd);
				$this.classList.remove('ta-inact');
			}
		} catch(trace) {
			console.error(trace);
		}
	}
	
	var DF = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'xps', 'rtf'];
	var AF = ['opus', 'wav', 'm4a', 'm4r', 'aac', 'ogg', 'mp3'];
	var VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v'];
	var IF = ['jpeg', 'jpg', 'png', 'svg', 'gif'];
	
	function handleLinks(a) {
		var f_ext, m_id;
		if (a.host === 'soundcloud.com' && /\/[\w_-]+/.test(a.pathname)) {
			if (a.nextElementSibling.tagName === 'BR')
				a.nextElementSibling.remove();
			a.remove();
		} else
		if (a.host === 'bandcamp.com' && (m_id = /album=([\w_-]+)/.exec(a.pathname))) {
			var cont = jumpCont(a, 'mediacontent');
			if (!cont['bandcamp-'+ m_id[1]]) {
				cont.appendChild(_z.setup('iframe', {
					id: 'bandcamp-'+ m_id[1], width: 400, height: 290, frameborder: 0, class: 'embedmedia', seamless: true,
					src: '//bandcamp.com/EmbeddedPlayer/'+ m_id[0] +'/size=large/bgcol=fefefe/linkcol=inherit/artwork=small/transparent=true/'}));
			}
			if (a.nextElementSibling.tagName === 'BR')
				a.nextElementSibling.remove();
			a.remove();
		} else
		if (a.host === 'pastebin.com' && (m_id = /\/([\w_-]+)/.exec(a.pathname))) {
			_z.setup(a, { class: 'cm-button cm-pastebin', id: 'PBlnk_'+ m_id[1], text: 'PASTEBIN: '+ m_id[1], rel: 'nofollow' });
		} else
		if (IF.includes((f_ext = a.href.split('.').pop()))) {
			if (MAIN_SETTINGS['cm_image']) {
				var _fn = function(e) {
					var hash = hashString(a.href.replace(/^https?:\/\//, '')),
						name = getFileName(a.href);
					e.target.onerror = IF['Image'] = e.target.onload =  null;
					_z.setup(a, { class: 'cm-button cm-image', id: 'imagelnk_'+ hash, rel: 'nofollow', text: name,
						title: f_ext.toUpperCase() +', '+ e.target.naturalWidth +'x'+ e.target.naturalHeight });
					a.wImage = _z.setup(e.target, { class: 'image-attach', id: 'image_'+ hash, alt: name, onclick: 'this.classList.toggle(\'expanded\')'});
				},
				_img = (IF['Image'] || _z.setup('img', {'onerror': function(e) {IF['Image'] = e.target;}}));
				_img.onload = _fn;
				_img.src = a.href;
			}
		} else
		if (VF.includes(f_ext)) {
			MAIN_SETTINGS['cm_video'] && testMedia((VF['Video'] || (VF['Video'] = document.createElement('video'))), a);
		} else
		if (AF.includes(f_ext)) {
			MAIN_SETTINGS['cm_audio'] && testMedia((AF['Audio'] || (AF['Audio'] = new Audio())), a);
		} else
		if (DF.includes(f_ext)) {
			MAIN_SETTINGS['cm_docs'] && _z.setup(a, { class: 'cm-button cm-pastebin', text: 'Document: '+ getFileName(a.href),
				id: 'docslnk_'+ hashString(a.href.replace(/^https?:\/\//, '')), rel: 'nofollow' });
		}
	}
	function testMedia(media, el) {
		(media['_test_'] || (media['_test_'] = [])).push(el);
		if (media.oncanplay == null) {
			media.oncanplay = _onCanplayHandle;
			media.onerror = _onUnsupportedHandle;
			media.src = el.href;
		}
	}
	function _onCanplayHandle(e) {
		var $t = e.target;
		_z.setup($t['_test_'][0], {class: 'cm-button cm-play', id: $t.tagName.toLowerCase() +'lnk_'+ hashString($t.src.replace(/^https?:\/\//, '')), rel: 'nofollow', text: getFileName($t.src)});
		_onUnsupportedHandle(e);
	}
	function _onUnsupportedHandle(e) {
		var $t = e.target;
		delete $t['_test_'][0];
		$t['_test_'].splice(0, 1);
		
		if (!$t['_test_'][0]) {
			$t.oncanplay = $t.onerror = null;
			$t.src = '';
		} else {
			$t.src = $t['_test_'][0].href;
		}
	}
	function cmButtonHandler(e) {
		if (e.button != 0 || !e.target.className || !e.target.classList)
			return;
		try {
			var $btn = e.target;
			switch (e.target.classList[0]) {
				case 'cm-button':
					var $Id = $btn.id.split('_');
					switch ($Id[0]) {
						case 'PBlnk':
							if (!$btn._container) {
								$btn._container = $btn.nextElementSibling.id === 'document_'+ $Id[1] ? $btn.nextElementSibling : _z.setup('div', {
									html: '<span class="mv-frame to-win"></span><iframe frameborder="0" src="//pastebin.com/embed_iframe.php?i='+ $Id[1] +'">',
									class: 'document-container', id: 'document_'+ $Id[1] });
							}
							if ($btn._container.inwin) {
								_Container.loadFrame($btn._container);
							} else if ($btn.nextElementSibling === $btn._container) {
								$btn._container.remove();
							} else
								$btn.after( $btn._container );
							break;
						case 'audiolnk':
							_z.each('.cm-stop', function($cm) { $cm.className = 'cm-button cm-play'; })
							if ($btn.nextElementSibling && $btn.nextElementSibling.id === 'audio_'+ $Id[1]) {
								$btn.nextElementSibling.remove();
							} else {
								$btn.className = 'cm-button cm-stop';
								$btn.after( _Container['Audio'] );
								_Container['Audio'].id = 'audio_'+ $Id[1];
								_Container['Audio'].src = $btn.href;
								_Container['Audio'].play();
							}
							break;
						case 'imagelnk':
							var $icont = jumpCont($btn, 'imagecontent'),
								$image = $icont.querySelector('#image_'+ $Id[1]);
							if (!$btn.wImage)
								$btn.wImage = ($image || _z.setup(e.target, { class: 'image-attach thumb', id: 'image_'+ $Id[1],
									alt: $btn.textContent, onclick: 'this.classList.toggle(\'full-size\')'}));
							if ($image) {
								$image.remove();
								$btn.classList.remove('attached');
							} else {
								$icont.appendChild($btn.wImage);
								$btn.classList.add('attached');
							}
							break;
						case 'docslnk':
							if (!_Container['GDoc']) {
								_Container['GDoc'] = _z.setup('div', { class: 'gdoc-container',
									html: '<iframe frameborder="0" scrolling="auto" width="100%" height="100%">'});
							}
							if (_Container['GDoc'].id !== 'gdoc_'+ $Id[1]) {
								_Container['GDoc'].firstElementChild.src = '//docs.google.com/gview?embedded=true&url='+ $btn.href;
								_Container['GDoc'].id = 'gdoc_'+ $Id[1]
							}
							_Container.loadFrame(_Container['GDoc']);
							break;
						case 'videolnk':
							if (_Container['Video'].src !== $btn.href)
								_Container['Video'].src = $btn.href;
							if (_EmbedField === 0) {
								_Container.loadFrame(_z.setup(_Container['Video'], { id: 'video_'+ $Id[1] }));
							} else {
								var $pcont = jumpCont($btn, 'mediacontent'),
									$video = $pcont.querySelector('#video_'+ $Id[1]);
								if ($video) {
									$btn.className = 'cm-button cm-play';
									$video.remove();
								} else {
									$btn.className = 'cm-button cm-stop';
									$video = _z.setup(_Container['Video'], { id: 'video_'+ $Id[1] });
									$pcont.appendChild($video);
									$video.play();
								}
							}
					}
					break;
				case 'mv-frame':
					if (!e.target.parentNode.inwin) {
						e.target.className = 'mv-frame to-post';
						_Container.loadFrame(e.target.parentNode);
						if(!e.target.parentNode.style['width'] && !e.target.parentNode.style['height']) {
							e.target.parentNode.style['width']  = '60%';
							e.target.parentNode.style['height'] = '85%';
						}
					} else {
						var pblnk = document.getElementById('PBlnk_'+ e.target.parentNode.id.split('_')[1]);
						pblnk && pblnk.after( e.target.parentNode );
						e.target.className = 'mv-frame to-win';
						_Container['Marker'].classList.remove('hidout');
						_Container['OVERLAY'].classList.add('hidup');
					}
					e.target.parentNode.inwin = e.target.classList[1] === 'to-post';
					break;
				case 'show-irc':
					_z.each('.irc-reflink-from-'+ $btn.parentNode.getAttribute('data-num'), function(irc) {
						irc.style['display'] = (irc.style['display'] == 'inline' ? 'none' : 'inline');
					});
					break;
				case 'edit-post':
					var pid = $btn.parentNode.getAttribute('data-num'),
						el  = document.getElementById('reply'+ pid) || document.getElementById('thread'+ pid + LOCATION_PATH.board);
					if (el) {
						var res  = parseBoardURL(el.querySelector('.reflink a').href),
							trip = el.querySelector('.postertrip') && getCookie('name');
						getDataResponse(location.origin +'/get_raw_post.php?b='+ res.board +'&p='+ res.post, function(data) {
							switch (data.status) {
								case 2:
									alertify.alert(data.error);
									break;
								default:
									if (!('raw_message' in data)) {
										alertify.alert('Нельзя редактировать чужой пост.');
									} else {
										(_EditForm || (_EditForm = makeGalaForm(null))).clear_all();
										el.querySelectorAll('.fs_'+ res.post).forEach(function(fs, n) {
											_EditForm.get_url_file(
												encodeURI(fs.querySelector('a[href^="/'+ res.board +'/src/"]').href), 
												(/R\:\s*\[(\w)\]/i.exec(fs.textContent) || {1:'N'})[1], n);
										});
										_EditForm.children['gala-error-msg'].textContent = data.error;
										_EditForm.children['gala-error-msg'].style['background-color'] = data.status == 0 ? '#04A13D' : '#E04000';
										_EditForm.children['gala-replytitle'].lastElementChild.textContent = 'пост №.'+ res.post;
										_EditForm.elements['board'].value = res.board;
										_EditForm.elements['replythread'].value = res.thread;
										_EditForm.elements['editpost'].value = res.post;
										_EditForm.elements['message'].value = data.raw_message;
										_EditForm.elements['subject'].value = data.subject;
										_EditForm.elements['name'].value = trip && trip.substring(0, data.name.length) === data.name ? trip : data.name;
										_EditForm.elements['em'].value = data.email;
										_EditForm.querySelector('.sagearrow').classList[data.email === 'sage' ? 'remove' : 'add']('inactive');
										el.prepend( _EditForm );
									}
							}
						});
					}
					break;
				case 'gala-globalform-close':
					globalBtReset($btn);
					break;
				case 'gala-globalform-open':
					_z.each('.gala-globalform-close', globalBtReset);
					$btn.className = 'gala-globalform-close';
					$btn.parentNode.nextElementSibling.style['display'] = 'inline-block';
					$btn.parentNode.nextElementSibling.appendChild(_GalaForm);
					break;
				case 'de-btn-rep':
					if (!_GalaForm)
						break;
				case 'rep-use1':
				case 'gcall-write-reply':
					_z.route(e.target, function(rp) {
						if ( /reply\d+/.test(rp.id) ) {
							var res = parseBoardURL(rp.querySelector('.reflink a').href);
							_GalaForm.elements['board'].value = res.board;
							_GalaForm.elements['replythread'].value = res.thread;
							_GalaForm.elements['message'].textMark('>>'+ (res.post || res.thread), '\r\n', 'ijct');
							_GalaForm.children['gala-replytitle'].lastElementChild.textContent = (document.querySelector('#reply'+ res.thread +
								' .filetitle') || { textContent: '(без названия) №.'+ res.thread }).textContent;
						}
						if (rp.classList.contains('psttable') || rp.classList.contains('oppost') ||
							rp.classList.contains('de-pview') && (rp = rp.lastElementChild)) {
							rp.after( _GalaForm );
							return true;
						}
						return false;
					});
					break;
				case 'sc-download':
					window.open(e.target.href, '_blank', 'width=400,height=200');
					break;
				case 'sc-info-toggle':
					e.target.parentNode.children[1].classList.add('active');
					break;
				case 'sc-info-close':
					e.target.parentNode.classList.remove('active');
					break;
				case 'sc-track-duration':
				case 'sc-track-title':
					$btn = e.target.parentNode;
				case 'sc-track':
					SCPurePlayer.io.connect($btn.parentNode.parentNode, $btn);
					break;
				case 'sc-play':
					var $player = e.target.parentNode.parentNode;
					if (!$player.id)
						break;
					SCPurePlayer.io.connect($player);
				case 'sc-pause':
					SCPurePlayer.io['AudioDevice'][e.target.classList[0].slice(3)]();
					break;
				default:
					if (e.target.classList.contains('ta-inact')) {
						e.target.classList.remove('ta-inact');
					}
					return;
			}
			e.preventDefault();
		} catch(trace) {
			console.error(trace);
		}
	}
	
	function globalBtReset(btn) {
		btn.className = 'gala-globalform-open';
		btn.parentNode.nextElementSibling.style['display'] = 'none';
	}
	
	var Base64String = {
		encodings:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
		_toUint6: function (nChr) {
			return nChr > 64 && nChr < 91 ?
				nChr - 65 : nChr > 96 && nChr < 123 ?
				nChr - 71 : nChr > 47 && nChr < 58 ?
				nChr + 4 : nChr === 43 ?
				62 : nChr === 47 ?
				63 : 0;
		},
		decode: function (sBase64, nBlocksSize) {
			var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ''),
				nInLen  = sB64Enc.length,
				nOutLen = nBlocksSize ? Math.ceil(
					(nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
				taBytes = new Uint8Array(nOutLen);
			for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
				nMod4 = nInIdx & 3;
				nUint24 |= this._toUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
				if (nMod4 === 3 || nInLen - nInIdx === 1) {
					for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
						taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
					}
					nUint24 = 0;
				}
			}
			return taBytes;
		},
		encode: function (raw) {
			var base64 = ''
			var bytes = new Uint8Array(raw)
			var byteLength = bytes.byteLength
			var byteRemainder = byteLength % 3
			var mainLength = byteLength - byteRemainder
			var a, b, c, d, chunk;
			// Main loop deals with bytes in chunks of 3
			for (var i = 0; i < mainLength; i = i + 3) {
				// Combine the three bytes into a single integer
				chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
				// Use bitmasks to extract 6-bit segments from the triplet
				a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
				b = (chunk & 258048) >> 12 // 258048 = (2^6 - 1) << 12
				c = (chunk & 4032) >> 6 // 4032 = (2^6 - 1) << 6
				d = chunk & 63 // 63 = 2^6 - 1
				// Convert the raw binary segments to the appropriate ASCII encoding
				base64 += this.encodings[a] + this.encodings[b] + this.encodings[c] + this.encodings[d]
			}// Deal with the remaining bytes and padding
			if (byteRemainder == 1) {
				chunk = bytes[mainLength]
				a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
				// Set the 4 least significant bits to zero
				b = (chunk & 3) << 4 // 3 = 2^2 - 1
				base64 += this.encodings[a] + this.encodings[b] + '=='
			} else if (byteRemainder == 2) {
				chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
				a = (chunk & 64512) >> 10 // 16128 = (2^6 - 1) << 8
				b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4
				// Set the 2 least significant bits to zero
				c = (chunk & 15) << 2 // 15 = 2^4 - 1
				base64 += this.encodings[a] + this.encodings[b] + this.encodings[c] + '='
			}
			return base64
		}
	}
	
	function jpegStripExtra(binary/*, typeout*/) {
		// Create 8-bit unsigned array
		var array = [];
		for (var i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}
		var orig = new Uint8Array(array),
			outData = new ArrayBuffer(orig.byteLength),
			output = new Uint8Array(outData);
		var posO = 2,
			posT = 2;
		output[0] = orig[0];
		output[1] = orig[1];
		while (!(orig[posO] === 0xFF && orig[posO + 1] === 0xD9) && posO <= orig.byteLength) {
			if (orig[posO] === 0xFF && orig[posO + 1] === 0xFE) {
				posO += 2 + orig[posO + 2] * 256 + orig[posO + 3];
			} else if (orig[posO] === 0xFF && (orig[posO + 1] >> 4) === 0xE) {
				posO += 2 + orig[posO + 2] * 256 + orig[posO + 3];
			} else if (orig[posO] === 0xFF && orig[posO + 1] === 0xDA) {
				var l = (2 + orig[posO + 2] * 256 + orig[posO + 3]);
				for (var i = 0; i < l; i++) {
					output[posT++] = orig[posO++];
				}
				while (!(orig[posO] === 0xFF && orig[posO + 1] === 0xD9) && posO <= orig.byteLength) {
					output[posT++] = orig[posO++];
				}
			} else {
				var l = (2 + orig[posO + 2] * 256 + orig[posO + 3]);
				for (var i = 0; i < l; i++) {
					output[posT++] = orig[posO++];
				}
			}
		}
		output[posT] = orig[posO];
		output[posT + 1] = orig[posO + 1];
		output = new Uint8Array(outData, 0, posT + 2);
		return (arguments[1] == 'Blob' ? new Blob([output], { type: 'image/jpeg' }) :
				arguments[1] == 'dataURL' ? 'data:image/jpeg;base64,'+ Base64String.encode(output) : output);
	}
	
	function convertToBinaryString(uint8) {
		var binaryString = '';
		if (typeof TextDecoder !== 'undefined') {
			binaryString = new TextDecoder('x-user-defined').decode(uint8);
		} else {
			for (var i = 0, len = uint8.byteLength; i < len; i++) {
				binaryString += String.fromCharCode(uint8[i]);
			}
		}
		return binaryString;
	}
	
	function bytesMagnitude(bytes) {
		return (bytes < 1024 ? bytes +' B' :
				bytes < 1024 * 1024 ? (bytes / 1024).toFixed(2) +' KB' :
				bytes < 1024 * 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(2) +' MB' :
											(bytes / 1024 / 1024 / 1024).toFixed(2) +' GB');
	}
	
	var RATING_VALUE = { S: 9, C: 10, A: 11, N: '' };
	
	function makeGalaForm(formPosition) {
		var tempForm  = _z.setup('form', { class: (formPosition == 1 ? 'reply gala-freestyle' : 'reply'), action: '/board.php?json=1', enctype: 'multipart/form-data',
			id: 'gala-'+ (formPosition == null ? 'edit' : 'reply') +'-form', style: 'display: table-row-group;'+ (formPosition == 1 ? ' left: 35%; top: 35%;' : ''), 
			html: '<input name="board" value="'+ LOCATION_PATH.board +'" type="hidden"><input name="replythread" value="'+ LOCATION_PATH.thread +'" type="hidden">'+
					'<div id="gala-error-msg"></div>'+
					'<div id="gala-replytitle">'+
						'<span class="pin-buttons" title="Сделать перетаскиваемым окном">'+
							'<svg class="closeform ls-de-svg"><use xlink:href="#de-symbol-win-close"></use></svg>'+
							(formPosition == null ? '<input name="editpost" value="" type="hidden">' : '<svg class="toggleform ls-de-svg"><use xlink:href="#de-symbol-win-arrow"></use></svg>') +
						'</span>'+
						'<span class="filetitle"></span>'+
					'</div>'+
					'<div class="new-thr'+ (LOCATION_PATH.thread ? '-chx inactive' : '') +' greenmk">Новый тред в /'+ LOCATION_PATH.board +'/</div>'+
					'<div style="display: table-row-group;">'+
						'<div class="file-area" style="display: table-cell;">'+
							'<div class="dropbox" style="visibility: hidden;"></div>'+
							'<div class="files-params">'+
								'<label title="Убирать имена файлов">'+
									'<input id="clear_files_name" type="checkbox" hidden><span class="feckbox">имена</span>'+
								'</label>'+
								'<label title="Удалять данные Exif из JPEG">'+
									'<input id="remove_jpeg_exif" type="checkbox" hidden><span class="feckbox">EXIF</span>'+
								'</label>'+
								'<label title="Рейтинг картинок по умолчанию">'+
									'<select id="default_file_rating"><option class="rating-N">N</option><option class="rating-A">A</option><option class="rating-C">C</option><option class="rating-S">S</option></select>'+
								'</label>'+
							'</div>'+
							'<label class="files-add">'+
								'<div>+</div><input id="dumb_file_field" multiple type="file" hidden>'+
							'</label>'+
						'</div>'+
						'<div style="display: table-cell;">'+
							'<div style="display: table-row;">'+
								'<span class="text-line-ic">'+
									'<input name="name" placeholder="Имя" maxlength="75" type="text">'+
									'<input name="em" placeholder="E-mail" maxlength="75" type="text" hidden>'+
									'<svg class="sagearrow de-btn-sage inactive"><use class="sage-use1" xlink:href="#de-symbol-post-sage"></use></svg>'+
								'</span>'+
								'<span class="text-line-ic">'+
									'<input name="subject" placeholder="Тема" maxlength="75" type="text">'+
									'<input id="submit_this_form" value="Отправить" type="submit">'+
								'</span>'+
							'</div>'+
							'<div style="display: table-row;">'+
								'<div style="display: table; margin: auto; text-align: center; font-variant: small-caps; font-size: 13px; padding: 5px 0;">'+
									'<span class="gmark-btn bold" title="Альтернатива/Хоткей: **"></span><span class="sep"></span>'+
									'<span class="gmark-btn italic" title="Альтернатива/Хоткей: *"></span><span class="sep"></span>'+
									'<span class="gmark-btn underline" title=""></span><span class="sep"></span>'+
									'<span class="gmark-btn strike" title="Альтернатива/Хоткей: ^"></span><span class="sep"></span>'+
									'<span class="gmark-btn spoiler" title="Альтернатива/Хоткей: %%"></span><span class="sep"></span>'+
									'<span class="gmark-btn code" title="Код"></span><span class="sep"></span>'+
									'<span class="gmark-btn rp" title="Ролеплей"></span><span class="sep"></span>'+
									'<span class="gmark-btn sup" title="Верхний индекс"></span><span class="sep"></span>'+
									'<span class="gmark-btn sub" title="Нижний индекс"></span><span class="sep"></span>'+
									'<span class="gmark-btn rcv" title="Альтернатива/Хоткей: !!"></span><span class="sep"></span>'+
									'<span class="gmark-btn dice" title="#dice"></span><span class="sep"></span>'+
									'<span class="gmark-btn unkfunc0" title="Цитировать"></span>'+
								'</div>'+
							'</div>'+
							'<textarea id="galatext" style="display: table-row; width: 100%;" placeholder="Текст поста" name="message" rows="14" accesskey="m"></textarea>'+
						'</div><textarea name="g-recaptcha-response" hidden></textarea>'+
					'</div>', onmousedown: (formPosition == 1 ? mousedownGFlistener : null)}, {
			submit: submitGFlistener,
			click: clickGFlistener
		});
		
		tempForm.files = new Array(0);
		
		tempForm.elements['dumb_file_field'].onchange = function(e){ tempForm.add_files(e.target) };
		tempForm.elements['message'].textMark = galamarK;
		
		if (formPosition != null) {
			var galaSafe  = JSON.parse(sessionStorage.getItem('GalaSafe')) || {},
				safeValue = function(e) {
					var name = e.target.name;
					galaSafe[name] = e.target.value;
					clearTimeout(e.target.safe_timer);
					e.target.safe_timer = setTimeout(function() {
						sessionStorage.setItem('GalaSafe',  JSON.stringify(galaSafe));
					}, 800);
				}
			
			_z.setup(tempForm.elements['default_file_rating'], { value: (galaSafe['default_file_rating'] || 'N') },
				{ change: function(e) {
					galaSafe['default_file_rating'] = e.target.value;
					sessionStorage.setItem('GalaSafe', JSON.stringify(galaSafe));
				}});
			
			_z.setup(tempForm.elements['clear_files_name'], { checked: MAIN_SETTINGS['clear_files_name'] }, { change: localGFChanges });
			_z.setup(tempForm.elements['remove_jpeg_exif'], { checked: MAIN_SETTINGS['remove_jpeg_exif'] }, { change: localGFChanges });
			
			_z.setup(tempForm.elements['name'   ], { value: (galaSafe['name'   ] || '')}, { input: safeValue });
			_z.setup(tempForm.elements['message'], { value: (galaSafe['message'] || '')}, { input: safeValue });
		}
		Object.defineProperties(tempForm, {
			MAX_FILES_LIMIT: {
				get: function() {
					return this.files.length >= MAX_FILE.COUNT.get(this.elements['board'].value);
				}
			}
		})
		
		tempForm['FileArea'] = _z.setup(tempForm.querySelector('.file-area'), null, {
			'dragover': function(e) {
				clearTimeout(this.leave_timer);
				this.style['min-width'] = '100px';
				this.firstElementChild.style['visibility'] = 'visible';
				e.preventDefault();
			},
			'dragenter': function(e) {
				var items = e.dataTransfer.mozItemCount || e.dataTransfer.items.length;
				this.transfer_info = '.dropbox:before { content: "добавить '+ itemsPlurality(items) +'"; }';
				dynamicCSS.textContent += this.transfer_info;
			},
			'dragleave': function(e) {
				this.leave_timer = setTimeout(closeDBOX, 80);
			},
			'drop': function(e) {
				tempForm.add_files(e.dataTransfer);
				closeDBOX();
				e.preventDefault();
			}
		});
		function closeDBOX() {
			tempForm['FileArea'].style['min-width'] = 'auto';
			tempForm['FileArea'].firstElementChild.style['visibility'] = 'hidden';
			dynamicCSS.textContent = dynamicCSS.textContent.replace(tempForm['FileArea'].transfer_info, '');
		}
		tempForm.add_files = function addGFiles(data) {
			if (this.MAX_FILES_LIMIT)
				return;
			try {
				var files = data.files,
					fileURL = data.getData ? data.getData(data.effectAllowed === 'copyLink' ? 'Text' : 'URL') : null,
					defaultR = this.elements['default_file_rating'].value;
				if (files.length === 0 && fileURL) {
					this.get_url_file(fileURL, defaultR);
				} else {
					for (var i = 0; i < files.length && !this.MAX_FILES_LIMIT; i++) {
						var FiD = files[i].type +';'+ files[i].size;
						if (FiD in this.files || !isFileValid(files[i], this.elements['board'].value))
							continue;
						this.files.push(
							(this.files[FiD] = makeGalaFile(files[i], FiD, defaultR))
						);
						this['FileArea'].classList.add('hold');
						this['FileArea'].appendChild(this.files[FiD]);
					}
				}
			} catch(log) {
				console.error(log);
			}
		}
		tempForm.clear_all = function() {
			this.elements['g-recaptcha-response'].value = '';
			this.children['gala-error-msg'].textContent = '';
			this.elements['subject'].value = '';
			this.elements['message'].value = '';
			this.elements['message'].dispatchEvent(new InputEvent('input'));
			this['FileArea'].classList.remove('hold');
			this.files.splice(0, this.files.length);
			for (var key in this.files) {
				this.files[key].remove();
				delete this.files[key];
			}
		}
		tempForm.captcha_needed = function() {
			this.elements['submit_this_form'].type = 'button';
			this.elements['submit_this_form'].className = 'call-captcha-widget';
			this.elements['submit_this_form'].value = 'Капча';
		}
		tempForm.get_url_file = function httpGFile(fileURL, rating, idx) {
			if (this.MAX_FILES_LIMIT)
				return;
			getDataBinary('Blob', fileURL, function(blob, f_url) {
				try {
					var FiD = blob.type +';'+ blob.size;
					if (!(FiD in this.files) && !this.MAX_FILES_LIMIT && isFileValid(blob, this.elements['board'].value)) {
						blob.name = getPageName(f_url);
						this.files.push(
							(this.files[FiD] = makeGalaFile(blob, FiD, rating))
						);
						this['FileArea'].classList.add('hold');
						switch (typeof idx) {
							case 'number':
								var gox = this['FileArea'].querySelectorAll('.file-gox');
								if (gox[idx]) {
									this['FileArea'].insertBefore(this.files[FiD], gox[idx]);
									break;
								}
							default:
								this['FileArea'].appendChild(this.files[FiD]);
						}
					}
				} catch(log) {
					console.error(log);
				}
			}.bind(this));
		}
		
		return tempForm;
	}
	
	function localGFChanges(e) {
		MAIN_SETTINGS[e.target.id] = (0 + e.target.checked);
		localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
	}
	
	function isFileValid(blob, desk) {
		var o = true, s = MAX_FILE.SIZE.get(desk);
		if (blob.size > s) {
			o = false;
			alertify.error('Максимальный размер файла на этой доске = '+ bytesMagnitude(s));
		}
		if (!VALID_FILE_TYPES.test(blob.type)) {
			o = false;
			alertify.error('Неподдерживаемый формат файла ('+ blob.type +')');
		}
		return o;
	}
	function itemsPlurality(count) {
		var i = count.toString(),
			l = i[i.length - 1];
		return i +' файл'+ (l == 1 ? '' : l < 5 ? 'а' : 'ов');
	}
	
	function makeGalaFile(file, FiD, R) {
		
		var gview, fnode;
		var type = file.type.split('/');
		var size = bytesMagnitude(file.size);
		var blobURL = (window.URL || window.webkitURL).createObjectURL(file);
		
		fnode = _z.setup('div', {id: 'gala-file_'+ FiD, class: 'file-gox', html: '<span class="file-remove"></span><div class="file-cover-label '+ (R || 'N') +'"><ul class="file-cover-select"><li class="file-cover S"></li><li class="file-cover C"></li><li class="file-cover A"></li><li class="file-cover N"></li></ul></div>'}, {
			click: function(e) {
				switch (e.target.classList[0]) {
					case 'file-cover':
						var fR = e.target.classList[1];
						this.rating = RATING_VALUE[fR];
						e.target.parentNode.parentNode.className = 'file-cover-label '+ fR;
				}
			}
		});
		fnode['blob'] = file;
		fnode['rating'] = (RATING_VALUE[R] || '');
		fnode['upload_name'] = file.name;
		
		switch (type[0]) {
			case 'video':
				gview = _z.setup('video', {'src': blobURL, 'muted': true, 'class': 'file-gview',
					'onloadedmetadata': function() {
						var sec = Math.floor(this.duration) % 60;
						var min = Math.floor(this.duration / 60);
						this.title = type[1].toUpperCase() +', '+ this.videoWidth +'×'+ this.videoHeight +', '+ min+':'+sec  +', '+ size;
					}
				});
				gview.onmouseover = gview.onmouseout = function(e) {
					this[ e.type == 'mouseover' ? 'play' : 'pause' ]();
				}
				break;
			case 'image':
				gview = _z.setup('img', {'src': blobURL, 'class': 'file-gview', 'style': 'visibility: hidden',
					'onload': function() {
						this.title = type[1].toUpperCase() +', '+ this.naturalWidth +'×'+ this.naturalHeight +', '+ size;
						this.onload = null;
						
						if (type[1] === 'gif') {
							var canvas = _z.setup('canvas', {'width': this.width, 'height': this.height}),
								ctx = canvas.getContext('2d');
								ctx.drawImage(this, 0, 0, this.naturalWidth, this.naturalHeight, 0, 0, this.width, this.height);
								
							this['ld_mouseover'] = blobURL;
							this['ld_mouseout' ] = this.src = canvas.toDataURL('image/png');
							
							this.onmouseout = this.onmouseover = function(e) {
								this.src = this['ld_'+ e.type];
							}
						}
						this.style['visibility'] = 'visible';
					}
				});
		}
		fnode.insertBefore(gview, fnode.lastElementChild);
		
		var reader = new FileReader();
			reader.onload = function() {
				if (this.readyState !== FileReader['DONE'])
					return;
				if (type[1] === 'jpeg') {
					fnode.dataStriped = jpegStripExtra(this.result);
				}
				if (typeof rstr_md5 === 'function') {
					var filestring = this.result,
						stringLength = filestring.length - 1;
					
					while (!isNaN( filestring.charAt(stringLength) )) { // is number
						stringLength--;
					}
					
					fnode.md5 = rstr2hex(rstr_md5(filestring.substring(0, stringLength)));
					//always send sha512 of file for passcode records
					//field will be sent only if user have cookie with real passcode
					getDataResponse(location.origin +'/chkmd5.php?x='+ fnode.md5, function(y) {
						if (!(fnode.exist = !!y) && fnode.dataStriped) {
							var striped = convertToBinaryString(fnode.dataStriped),
								strip_md5 = rstr2hex(rstr_md5(striped));
							getDataResponse(location.origin +'/chkmd5.php?x='+ strip_md5, function(_y) {
								if (!!_y) {
									fnode.exist = true;
									fnode.md5 = strip_md5;
								}
							});
						}
					});
				}
			}
			reader.readAsBinaryString(file);
		
		return fnode;
	}
	
	function mousedownGFlistener(e) {
		if (e.button != 0 || ['INPUT', 'SELECT', 'TEXTAREA', 'IMG'].includes(e.target.tagName))
			return;
		e.preventDefault();
		
		var $this = this;
		var coords = this.getBoundingClientRect();
		var shiftX = e.pageX - (coords.left + pageXOffset);
		var shiftY = e.pageY - (coords.top + pageYOffset);
		var $fn = function(e) {
			$this.style['left'] = (e.clientX - shiftX) +'px';
			$this.style['top']  = (e.clientY - shiftY) +'px';
		}
		var $rm = function(e) {
			window.removeEventListener('mousemove', $fn, false);
			window.removeEventListener('mouseup', $rm, false);
		}
		window.addEventListener('mousemove', $fn, false);
		window.addEventListener('mouseup', $rm, false);
	}
	function clickGFlistener(e) {
		if (e.button != 0 || !e.target.className || !e.target.classList)
			return;
		var $btn = e.target;
		switch (e.target.classList[0]) {
			case 'sage-use1':
				$btn = e.target.parentNode;
			case 'sagearrow':
				$btn.classList.toggle('inactive');
				this.elements['em'].value = $btn.classList.contains('inactive') ? '' : 'sage';
				break;
			case 'closeform':
				this.remove();
				break;
			case 'toggleform':
				if (this.classList.contains('gala-freestyle')) {
					this.onmousedown = null;
					MAIN_SETTINGS['galaform'] = 2;
				} else {
					var coords = this.getBoundingClientRect();
					this.style['left'] = coords.left +'px';
					this.style['top' ] = coords.top  +'px';
					this.onmousedown = mousedownGFlistener;
					MAIN_SETTINGS['galaform'] = 1;
				}
				this.classList.toggle('gala-freestyle');
				localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
				break;
			case 'gmark-btn':
				var tag = e.target.classList[1],
					gTA = this.elements['message'];
				switch (tag) {
					case 'spoiler':
					case 'code':
						var o = '['+ tag +']', c = '[/'+ tag +']',
							s = gTA.value.substring(0, gTA.selectionStart);
						if (!isInsideATag(s, o, c)) {
							gTA.textMark(o, c, 'html', true);
						} else if (tag === 'spoiler') {
							gTA.textMark('%%', '%%', 'mdwn');
						} else if (tag === 'code') {
							gTA.textMark('   ', '\n   ', 'ql');
						}
						break;
					case 'unkfunc0':
						gTA.textMark('>', '\n>', 'ql');
						break;
					case 'dice':
						gTA.textMark('##', '##', 'dice');
						break;
					case 'rcv':
						gTA.textMark('!!', '!!', 'mdwn');
						break;
					case 'underline':
					case 'italic':
					case 'strike':
					case 'bold':
						tag = tag[0];
					default:
						gTA.textMark('['+tag+']', '[/'+tag+']', 'html');
				}
				break;
			case 'ta-inact':
				e.target.classList.remove('ta-inact');
				break;
			case 'call-captcha-widget':
				var $t = this, callback = function(token) {
					if (token == undefined) {
						$t.captcha_needed();
					} else {
						$t.elements['submit_this_form'].type = 'submit';
						$t.elements['submit_this_form'].className = 'send-form';
						$t.elements['submit_this_form'].value = 'Отправить';
						$t.elements['g-recaptcha-response'].value = token;
					}
				}
				alertify.alert('<div id="catcha-widget-'+ this.id +'" style="text-align: center;"></div>');
				grecaptcha.render('catcha-widget-'+ this.id, {
					'sitekey': '6Lfp8AYUAAAAABmsvywGiiNyAIkpymMeZPvLUj30',
					'expired-callback': callback,
					'callback': callback,
					'theme': 'light'
				});
				break;
			case 'new-thr-chx':
				e.target.classList.toggle('inactive');
				this.elements['replythread'].value = (e.target.classList.contains('inactive') ? LOCATION_PATH.thread : 0);
				break;
			case 'file-cover-label':
				e.target.classList.toggle('active');
				break;
			case 'file-remove':
				var FiD = e.target.parentNode.id.split('_')[1],
					idx = this.files.indexOf(this.files[FiD]);
				this.files[FiD].remove();
				delete this.files[FiD];
				this.files.splice(idx, 1);
				if (this.files.length == 0)
					this['FileArea'].classList.remove('hold');
		}
	}
	
	var dynamicCSS = _z.setup('style', { id: 'gala_dynamic_css' });
	var content_error = 'Нельзя отправлять сообщения без файлов и текста.';
	var myPostsMap = JSON.parse(localStorage.getItem('de-myposts')) || {};
	
	function submitGFlistener(e) {
		try { e.preventDefault();
			var form = e.target;
			var flen = e.target.files.length;
			if (!flen && !form.elements['message'].value) {
				form.children['gala-error-msg'].textContent = content_error;
				form.children['gala-error-msg'].style['background-color'] = '#E04000';
				return;
			}
			var i, n, exists = {};
			var desk = form.elements['board'].value;
			var thread_id = form.elements['replythread'].value;
			var formData = new FormData();
			for (i = form.elements.length; i > 0;) {
				 i--;
				if (!form.elements[i].name) {
					continue;
				}
				formData.append(form.elements[i].name, form.elements[i].value);
			}
			for (n = 1; i < flen; i++) {
				if (form.files[i].exist) {
					exists[i] = form.files[i];
					continue;
				}
				if (form.elements['remove_jpeg_exif'].checked && form.files[i].blob.type == 'image/jpeg')
					form.files[i].blob = new Blob([form.files[i].dataStriped], { type: 'image/jpeg' });
				if (form.elements['clear_files_name'].checked)
					form.files[i].upload_name = ' '+ form.files[i].upload_name.slice(form.files[i].upload_name.lastIndexOf('.'));
				formData.append('upload[]', form.files[i].blob, form.files[i].upload_name);
				formData.append('upload-rating-'+ (n++), form.files[i].rating);
			}
			for (var k in exists) {
				formData.append('md5-'+ n, exists[k].md5);
				formData.append('upload-rating-'+ (n++), exists[k].rating);
			}
			
			form.elements['submit_this_form'].disabled = true;
			form.elements['submit_this_form'].value = 'Отправка 0%';
			
			var postReq = new XMLHttpRequest();
				postReq.upload.onprogress = function(e) {
					form.elements['submit_this_form'].value = 'Отправка '+ Math.round((e.loaded / e.total * 100)) +'%';
				}
				postReq.onreadystatechange = function() {
					if (this.readyState !== 4)
						return;
					var msg_error = '';
					if (this.status === 200) {
						var data = (function(json, o) {
							try {
								o = /<meta http-equiv=\"\w+\" content=\"\d+;url=\/\w+\/\">/.test(json) ? {error:content_error} : JSON.parse(json);
							} catch (g) {
								o = { error: json };
							}
							return o;
						})(this.responseText);
						if (data.error === null) {
							
							form.remove();
							form.clear_all();
							
							if (!(desk in myPostsMap))
								myPostsMap[desk] = {};
							myPostsMap[desk][data.id] = [Date.now(), Number(thread_id || data.id), true];
							localStorage.setItem('de-myposts', JSON.stringify(myPostsMap));
							setCookie('name', form.elements['name'].value, 2e4, '.'+ location.host);
							dynamicCSS.appendChild(document.createTextNode('.post-body a[href$="#'+ data.id +
								'"]:after{content:" (You)";} .de-ref-op[href$="#'+ data.id +'"]:after{content:" (OP)(You)";}'));
							
							if (!thread_id) {
								location.href = location.origin +'/'+ desk +'/res/'+ data.id +'.html';
							} else {
								var buttons_path = '#thread'+ thread_id + desk +' + .de-thread-buttons .de-abtn';
								document.querySelectorAll(buttons_path +', '+ buttons_path.replace('+', '>')).forEach(function(abtn) {
									abtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
								});
							}
						} else {
							msg_error = data.error;
						}
					} else {
						msg_error = this.status +' '+ this.statusText;
					}
					
					if (/Я запретила тебе отправлять сообщения\!/.test(msg_error)) {
						var banMSG = new DOMParser().parseFromString(data.error, 'text/html').body.firstElementChild;
						form.children['gala-error-msg'].innerHTML = '';
						form.children['gala-error-msg'].style['background-color'] = '#1E2E3E';
						form.children['gala-error-msg'].appendChild(banMSG).style = 'width: 650px; font-size: 90%;';
						form.elements['submit_this_form'].disabled = false;
						form.elements['submit_this_form'].value = 'Отправить';
						return;
					}
					
					form.children['gala-error-msg'].style['background-color'] = '#E04000';
					form.children['gala-error-msg'].textContent = msg_error;
					
					switch (msg_error) {
						case 'Ты отправляешь сообщения слишком быстро':
							form.elements['submit_this_form'].value = 'Ждите 7';
							var t = 6, timr = setInterval(function(){
								if (t == 0) {
									clearInterval(timr);
									form.elements['submit_this_form'].disabled = false;
									form.elements['submit_this_form'].value = 'Отправить';
									form.children['gala-error-msg'].textContent = 'Теперь можно отправлять';
									form.children['gala-error-msg'].style['background-color'] = '#04A13D';
								} else
									form.elements['submit_this_form'].value = 'Ждите '+ (t--);
							}, 1050);
							break;
						case 'Введен неправильный код подтверждения':
							form.elements['submit_this_form'].disabled = false;
							form.captcha_needed();
							break;
						default:
							form.elements['submit_this_form'].disabled = false;
							form.elements['submit_this_form'].value = 'Отправить';
					}
				};
				postReq.open('POST', form.action, true);
				postReq.send(formData);
		} catch(log) {
			console.error(log)
		}
	}
	
	if (MAIN_SETTINGS.galaform) {
		_GalaForm = makeGalaForm(MAIN_SETTINGS.galaform);
		isCaptchaNeeded(null, _GalaForm.captcha_needed);
	}
	
	function handlePostNode(pst) {
		
		var reply = /reply\d+/.test(pst.id) ? pst : pst.querySelector('.pstnode > *[id^="reply"]');
		
		if (reply && reply.getAttribute('handled') !== 'ok') {
			var bquot = reply.querySelector('.post-body > blockquote');
			var pid = reply.getAttribute('data-num');
			if (myPostsMap[LOCATION_PATH.board] && pid in myPostsMap[LOCATION_PATH.board]) {
				reply.classList.add('de-mypost');
			}
			if (_GalaForm) {
				reply.querySelector('.extrabtns').previousSibling.before( _z.setup('a', {
					html: '<svg class="gcall-write-reply rep-arrow-svg"><use class="rep-use1" xlink:href="#gala-rep-arrow"></use></svg>'}));
			}
			var sclnks = bquot.querySelectorAll('a[href^="https://soundcloud.com/"], a[href^="http://soundcloud.com/"]');
			if (sclnks.length > 0) {
				jumpCont(bquot, 'mediacontent').appendChild(SCPurePlayer.createGroup(sclnks));
			}
			bquot.querySelectorAll('a[href*="//"]:not(.cm-link):not(.cm-button):not(.irc-reflink)').forEach(handleLinks);
			reply.setAttribute('handled', 'ok');
		}
	}
	
	_z.setup(window, null, {
		'keypress': keyMarks,
		'storage': function(e){
			if (e.storageArea == this.localStorage) {
				switch (e.key) {
					case 'main_settings':
						MAIN_SETTINGS = JSON.parse(e.newValue);
						break;
					case 'data_nots':
						DATA_NOTS = JSON.parse(e.newValue);
						break;
					case 'de-myposts':
						myPostsMap = JSON.parse(e.newValue);
						break;
				}
			}
		},
		'click': cmButtonHandler
	});
	_z.setup(document, null, {
		'hasNewPostsComing': function(e) {
			e.detail.forEach(handlePostNode);
		}
	});
	$DOMReady(function(e) {
		if ('postform' in document.forms && _GalaForm) {
			
			var globalform_area = _z.setup('div', {
				class: 'gala-globalform-area',
				html: '<div>[<a class="gala-globalform-open"></a>]</div><div style="text-align: left; display: none;"></div><hr>'
			});
			
			var postarea = _z.setup(document.querySelector('.postarea'), { style: 'display:block!important;' });
			postarea && postarea.after( globalform_area );
			
			var delform = (document.forms.delform || document.querySelector('form[de-form]'))
			delform && delform.after( globalform_area.cloneNode(true) );
			
			document.body.appendChild(
				_z.setup('div', { style: 'height: 0; width: 0; position: fixed;', html: 
					'<style>.de-parea, #de-main > hr, .postarea > #postform, .de-btn-rep { display: none; } .de-svg-back { fill: inherit; stroke: none; } .de-svg-fill { stroke: none; fill: currentColor; } .de-svg-stroke { stroke: currentColor; fill: none; } .de-btn-sage { margin: 0 2px -3px; cursor: pointer; width: 12px; height: 16px; } .rep-arrow-svg{ margin: 0 2px -4px 3px; cursor: pointer; width: 20px; height: 16px; }</style>'+
					'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
					'<defs></defs>'+
					'<symbol viewBox="0 0 16 16" id="de-symbol-post-back">'+
						'<path class="de-svg-back" d="M4 1q-3 0,-3 3v8q0 3,3 3h8q3 0,3 -3v-8q0 -3,-3-3z"></path>'+
					'</symbol>'+
					'<symbol viewBox="0 0 16 10" id="gala-rep-arrow">'+
						'<path class="de-svg-fill" d="M7,4 L0,8 L1.7,4 L0,0 L7,4 Z"></path>'+
						'<path class="de-svg-fill" d="M14,4 L7,8 L8.7,4 L7,0 L14,4 Z"></path>'+
					'</symbol>'+
					'<symbol viewBox="0 0 16 16" id="de-symbol-post-sage">'+
						'<path class="de-svg-fill" d="M3,.003 C5.5,-.003 8.4,-.003 11.2,.003 C11.1,.5 11.03,1.005 11,1.5 C8.3,1.5 5.6,1.5 3,1.5 C3,1.002 3,.5 3,.003 C3,.003 3,.5 3,.003 L3,.003 L3,.003 Z"></path>'+
						'<path class="de-svg-fill" d="M3.1,3 C6,3 8.2,3 11,3 C11,3.4 10.5,4 10.4,4.4 C8.1,4.4 6,4.4 3.4,4.4 C3.3,4 3,3.4 3.1,3 C3.1,3 3.2,3.4 3.1,3 L3.1,3 L3.1,3 Z"></path>'+
						'<path class="de-svg-fill" d="M4,6 C6,6 8,6 10.2,6 C10,7 10,8 10,9 C11,9 12.5,8.5 14,8 C11.6,11.1 9.3,14 7,16.2 C4.6,14 2.3,11.1 -.1,8.5 C1.3,8.5 3,8.5 4.1,8.5 C4,7.6 4,7 4,6 C4,6 4,7 4,6 L4,6 L4,6 Z"></path>'+
					'</symbol>'+
					'<symbol viewBox="0 0 16 16" id="de-symbol-win-arrow">'+
						'<path class="de-svg-stroke" stroke-width="3.5" d="M8 13V6"></path>'+
						'<path class="de-svg-fill" d="M3.5 7h9L8 2.5 3.5 7z"></path>'+
					'</symbol>'+
					'<symbol viewBox="0 0 16 16" id="de-symbol-win-close">'+
						'<path class="de-svg-stroke" stroke-width="2.5" d="M3.5 3.5l9 9m-9 0l9-9"></path>'+
					'</symbol>'+
					'</svg>'}));
		}
		if (SCPurePlayer.io['AudioDevice'].tagName === 'OBJECT') {
			document.body.appendChild( _z.setup('span', {
					class: 'sc-engine-container',
					style: 'position: absolute; left: -9000px;'
				})
			).appendChild( SCPurePlayer.io['AudioDevice'] );
		}
		_z.each('.psttable *[id^="reply"], .oppost[id^="reply"]', handlePostNode);
		document.body.appendChild( dynamicCSS );
	});
	return {
		handleLinks: handleLinks
	}
})(); /* ===> end <=== */
