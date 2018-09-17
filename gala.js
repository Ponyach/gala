//@import Polyfill, Crypt, SpelzZ, Gala

/* 
	«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 4.4.0
	© magicode
*/

const MAIN_SETTINGS = ((main) => {
	// основные настройки пользователя
	if (main === null) {
		
		localStorage.setItem('main_settings', JSON.stringify(
		// общие настройки по умолчанию
		main = {
			'require_modules'      : ['mepr'],
			'userposts_hide'       : [],
			'dollchanScript_enable': true,
			'snowStorm_enable'     : false,
			'snowStorm_freeze'     : false,
			'fixedHeader_enable'   : false,
			'UploadRating_default' : '',
			'show_de-thr-buttons'  : false,
			'show_doubledash'      : false,
			'hide_coma-colormark'  : false,
			'hide_roleplay'        : false,
			'keymarks'             : true,
			'cm_image'             : false,
			'cm_video'             : true,
			'cm_audio'             : true,
			'cm_docs'              : true
		}));
		
		return main;
	}
	return JSON.parse(main);
	
})(localStorage.getItem('main_settings'));

if (!('hide_coma-colormark' in MAIN_SETTINGS)) {
	MAIN_SETTINGS['hide_coma-colormark'] = false;
	MAIN_SETTINGS['require_modules'].indexOf('mepr') == -1 && MAIN_SETTINGS['require_modules'].push('mepr');
}

// распознавание тач-ориентированных устройств
const IS_TOUCH_DEVICE = 'dast_enable' in MAIN_SETTINGS ? MAIN_SETTINGS['dast_enable'] : 'ontouchstart' in window;

const LOCATION_PATH = parseBoardURL(location.href); // то find { board: w, thread: n, page: n, etc }

const PONY_RATE = ['N',,,,,,,,,'S','C','A'];

const VALID_FILE_TYPES = /audio\/(?:ogg|mpeg)|video\/(?:webm|mp4|ogg)|image\/(?:jpeg|jpg|png|gif)/i // for the /regexp/.test(file_mime)

class MAX_POTENTIAL {
	constructor(values) {
		Object.assign(this, values);
	}
	get(b) {
		return b in this ? this[b] : this.default;
	}
}

const MAX_FILE_SIZE  = new MAX_POTENTIAL({ default: 30000000, 'r34': 30582912, 'd': 20000000 });
const MAX_FILE_COUNT = new MAX_POTENTIAL({ default: 5, 'test': 20, 'd': 2 });
// мусорный объект
const NULL = { fn: () => void 0, parentNode: '' };

// уведомления о новых тредах и постах
const N0TS = ((n0ts, $tim) => {
	
	if (n0ts === null) {
		n0ts = { init: true };
	} else {
		n0ts = JSON.parse(n0ts);
	}
	
	return {
		DATA   : n0ts,
		links  : {},
		online : '',
		speed  : '',
		assign : function(name, props) {
			if (name in n0ts) {
				const { posts, threads, mute } = Object.assign(Object.create(n0ts[name]), props);
				this.update(name, posts, threads, mute);
			}
		},
		startWatch: function() {
			
			clearInterval ($tim);
			
			let oldData, $this = this;
			
			const _watch = ({ target: {response} }) => {
				
				if (response !== oldData) {
					
					response = (oldData = response).split(';');
					
					$this.online.textContent = response[0];
					$this.speed.textContent  = response[1];
					
					for (let data of response.splice(2)) {
						
						let [name, posts, threads] = data.split(/=|:/g);
						
						posts   = Number (posts);
						threads = Number (threads);
						
						if (n0ts.init) {
							n0ts[name] = name == 'changelog' ? threads : { posts, threads, mute };
						}
						else if (name == 'changelog') {
							if ( name === LOCATION_PATH.board) {
								n0ts[name] = threads;
							}
							else if (name in $this.links) {
								if (threads > (n0ts[name] || (n0ts[name] = 0))) {
									for (let pos in $this.links[name]) {
										$this.links[name][pos].title       = 'изменений:'+ (threads - n0ts[name]);
										$this.links[name][pos].textContent = 'Чейнжлог+';
									}
								}
							}
						}
						else if (name in $this.links) {
							
							if (!n0ts[name])
								n0ts[name] = { posts, threads, mute: false };
							
							$this.update( name, posts, threads, n0ts[name].mute);
						}
					}
					delete n0ts.init;
					localStorage.setItem('data_nots', JSON.stringify(n0ts));
				}
			}
			
			$GET('/info.php?x=1', _watch);
			
			$tim = setInterval ($GET.bind(null, '/info.php?x=1', _watch), 40000);
			
			/*$GET('/messages.php?m=list', function() {
				document.getElementById("messages").innerHTML = this.responseText;
			});*/
		},
		update: function(name, posts, threads, mute = false) {
			
			let title = this.links[name].title;
			let display_name = name;
			
			if (name == LOCATION_PATH.board || mute) {
				n0ts[name].posts   = posts;
				n0ts[name].threads = threads;
			} else {
				title = Object.values(this.links[name])[1].title;
				if (n0ts[name].posts < posts) {
					display_name += '+';
					title = 'новых постов: '+ (posts - n0ts[name].posts);
				}
				if (n0ts[name].threads < threads) {
					display_name = name +'*';
					title += ', новых тредов: '+ (threads - n0ts[name].threads);
				}
			}
			
			n0ts[name].mute = mute;
			
			for (let pos in this.links[name]) {
				this.links[name][pos].title       = title;
				this.links[name][pos].textContent = display_name;
			}
		}
	}
})(localStorage.getItem('data_nots'));

// этот стиль лучше бы перенести в глобальный css
const EXT_STYLE = _z.setup('style', { text:`
	#dbaskkey ~ *, .de-rpiStub + *, [hidden] { display: none!important; }
	#tellwhohide { font-size: small; margin-top: 1em; }
	#tellwhohide > * { display: inline-block; padding: 0 4px; border: 1px solid; cursor: default; margin: 0 4px 2px 0; border-radius: 3px; }
	#tellwhohide > *:hover { text-decoration: none; }
	.filesize, .file-booru { font-size: .8em; }
	.post-files > .filesize { margin-left: 10px; }
	.post-menu { list-style: outside none none; padding: 0; z-index: 9999; border: 1px solid grey; position: absolute; }
	.post-menu-item { padding: 3px 10px; font: 13px arial; white-space: nowrap; cursor: pointer; }
	.post-menu-item:hover { background-color: #222; color: #fff; }
	.textbutton {
		cursor: pointer;
		text-decoration: none;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.file-area-empty + .file-area-empty, .file-area-empty ~ .file-area-empty, .file-booru > *:not(.modal-btn) { display: none; }
	.file-area + .file-area-empty { display: block!important; }
	#file_error { position: absolute; left: 0; bottom: 0; background-color: rgba(0,0,0,.3); width: 100%; }
	#file_error > .e-msg { color: brown; padding: 4px 8px; }
	.idb-selected { margin: 1px; border: 4px solid #5c0; }
	.modal { z-index: 100!important; }
	.de-pview { z-index: 98!important; }
	.pre-sample {
		display: inline-block;
		width: 120px;
		height: 120px;
		text-align: center;
		float: left;
		margin: 2px 5px;
	}
	.file-booru:before {
		content: attr(rate) attr(title);
		width: 500px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		vertical-align: middle;
		display: inline-block;
	}
	.modal-btn { width: 16px; height: 16px; display: inline-block; margin-left: 6px; }
	.de-rpiStub + * + .de-file, .de-rpiStub { display: inline-block!important; }
	.de-rpiStub { width: 90px; height: 90px; margin: 1px; }
	.modal-btn, .pre-sample, .de-rpiStub { background: transparent no-repeat top center / 100%; }
	.de-file:after { content: "\xA0"; white-space: pre-line; }
	.de-rpiStub:before { content: "R:\xA0"; }
	.de-rpiStub:before, .de-rpiStub:after { font-size: .8em; color: white; }
	.hmref { content: "(HIDDEN)"; display: inline!important; opacity: 0.7; }
`});

Object.defineProperty(window, 'isCaptchaNeeded', {
	value: function(/* no, yes */) {
		let exec = arguments;
		$GET('/recaptchav2.php?c=isnd', ({ target: {response} }) => {
			(exec = exec[response]) instanceof Function && exec();
		});
	}
});

//затычки --X
window.handleFileSelect = window.submitPostform = window._PonyRateHiglight = () => void 0;

window.ku_boardspath = location.origin;
// X-- затычки

const G4LA = new Gala;

(() => {/* это изолированное пространство, функции и переменные которые здесь указываем не будут видны левым скриптам */
	
	var toggleHeaderOnTop, used_style, postform, passcode_refresh, _PONY, _HiP = [], recapt2, de_rpiChange = NULL.fn;
	
	const _File = {
		blob   : [],
		rating : [],
		MD5    : [],
		DelBtn : {},
		Area   : {}
	}
	
	EXT_STYLE.append( Gala.style );
	
	// проверяем включена ли кукла в настройках
	if (MAIN_SETTINGS['dollchanScript_enable']) {
		
		// загружаем настройки куклы, если настроек нет, значит требуется первичная инициализация
		if (localStorage.getItem('DESU_Config') === null) {
		
			const DESU_Config = {};
		
			// создаем наши параметры по умолчанию (сюда можно дописывать любой параметр из возможных, кукла их подхватывает)
			const deParams = {
				replyWinDrag : 1,
				replyWinX    : 'right: 0',
				replyWinY    : 'top: 0',
				textaWidth   : 500,
				textaHeight  : 240,
				updThrDelay  : 20,
				linksOut     : 300,
				postSameImg  : 0,
				removeEXIF   : 0,
				spacedQuote  : 0,
				updDollchan  : 0,
				addMP3       : 0
			}
			// подгон плавающей формы по ширине (ширина текстового поля + примерный размер отступов по краям)
			if (innerWidth <= deParams.textaWidth + 40) {
				deParams.textaWidth = innerWidth - 40;
			} else
				deParams.replyWinX = 'left: '+ Math.floor((innerWidth - deParams.textaWidth) / 2 * 100) / 100 +'px';
			// подгон плавающей формы по высоте (высота текстового поля + примерно еще столько же занимают прочие поля вверху и внизу)
			if (innerHeight <= deParams.textaHeight * 2) {
				deParams.textaHeight = 100;
			} else
				deParams.replyWinY = 'top: '+ Math.floor((innerHeight - deParams.textaHeight) / 2 * 100) / 100 +'px';
			// настройки куклы привязаны к хосту
			DESU_Config[location.host] = deParams;
			// записываем наш конфиг в локальное хранилище
			localStorage.setItem('DESU_Config', JSON.stringify(DESU_Config));
		}
		else if (localStorage.getItem('DESU_Config').includes('updScript')) {
			const DESU_Config = JSON.parse(localStorage.getItem('DESU_Config'));
			delete DESU_Config[location.host]['updScript'];
			DESU_Config[location.host]['updDollchan'] = 0;
			localStorage.setItem('DESU_Config', JSON.stringify(DESU_Config));
		}
		// собираем куклоскрипт  ~  добавляем на страницу
		document.head.appendChild( _z.setup('script', {
			type : 'text/javascript',
			src  : _VER_.boardscript }, {
			load : function(e) {
		/* Сюда можно поместить то, что необходимо выполнить после загрузки куклы.
		  @note: следует помнить что кукла работает асинхронными методами и срабатывание этого события не значит что она уже полностью отработала,
		         однако все обработчики (напр. $DOMReady) которые мы здесь укажем, уже гарантированно будут добавлены и запущены после кукловых.
		*/
				$DOMReady(() => {
					// регестрируем функции в API куклоскрипта
					window.postMessage('de-request-api-message', '*');
					
					var dbTHMB  = {},
						deFiles = document.getElementsByClassName('de-file'),
						deWHead = document.querySelector('.de-win-head');
					
					if (deWHead) {
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
					}
				});
			}
		}));
	} else {
		// действия которые с включенной куклой делать не требуется
		$DOMReady(() => {
			// вставляем имя пользователя и адресс почты в поля формы
			if ('postform' in document.forms) {
				postform = document.forms.postform;
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
		MAIN_SETTINGS['require_modules'].forEach(name => {
			name in _VER_ && document.head.appendChild( _z.setup('script', { type: 'application/javascript', src: _VER_[name] }, {
				load: () => { if (name === 'mepr') { G4LA._GalaForm && G4LA._GalaForm.init(); $DOMReady(initMepr); } }
			}));
		});
		$DOMReady(() => {
			// устанавливаем выбранный пользователем стиль
			document.selectedStyleSheetSet = (localStorage.getItem('main_style') || 'Photon');
			// обрабатываем панель стилей
			used_style = $(document.getElementById('settings-styles'))
				.draggable({
					snap: '#snapper, .droppable',
					snapMode: 'both',
					snapTolerance: 50 })
				.bind('click', setStylesheet)
				.find('a[href="#'+ document.selectedStyleSheetSet +'"]')[0];
			
			if (used_style) {
				used_style.className = 'used-style';
				used_style.parentNode.className = 'list-item-checked';
			}
			
			// обрабатываем верхнюю панель
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
		}, () => {
			// убираем заглушку
			document.documentElement.removeChild(whitescreen);
		});
//> }
	
	// создаем динамически изменяемый стиль
	var apply_msg = '#settings-main:before { content: "требуется перезагрузка"; display: block; text-align: center; color: brown; font-size: small; }',
		inline_style = EXT_STYLE.appendChild(document.createTextNode('.hempty'+
			(MAIN_SETTINGS['hide_coma-colormark'] ? ', .coma-colormark' : '') +
			(MAIN_SETTINGS['hide_roleplay']       ? ', rp, .roleplay'   : '') +' { display: none!important; } .doubledash { display: '+
			(MAIN_SETTINGS['show_doubledash']     ? 'inline' : 'none' ) +'!important } .de-thr-buttons '+
			(MAIN_SETTINGS['show_de-thr-buttons'] ? '+ br ' : ''      ) +'{ display: none!important; }'));
	
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
	
	_z.setup(window, null, {
		keypress: keyMarks,
		click: G4LA,
		storage: function(e){
			if (e.storageArea == this.localStorage) {
				switch (e.key) {
					case 'main_settings':
						Object.assign(MAIN_SETTINGS, JSON.parse(e.newValue));
						break;
					case 'data_nots':
						var newVal = JSON.parse(e.newValue);
						for (var name in newVal) {
							if (N0TS.DATA[name].mute != newVal[name].mute) {
								N0TS.assign(name, { mute: newVal[name].mute });
								_z.setup(document.querySelector('.mute-nots[name="'+name+'"]'), { checked: newVal[name].mute });
							}
						}
						break;
					case 'de-myposts':
						Gala.myPostsMap = JSON.parse(e.newValue);
						break;
				}
			}
		},
		// добавляем свой код через DollchanAPI
		message: function(e) {
			if (e.ports && e.ports.length === 1 && e.data === 'de-answer-api-message') {
				this.removeEventListener('message', arguments.callee, false);
				this.handleFileSelect = this.scrollHighlight = this.expandImage = NULL.fn;
				this._PonyRateHiglight = (el, rel) => {
					const value = PONY_RATE[ Number (rel.value) ];
					_File.rating[rel.id.substr(-1) - 1] = value;
					initMepr(_File.rating);
					el.className = el.className.replace(/\s?PONY_rate-(?:\w*)|$/, ' PONY_rate-'+ value);
				}
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
									_File.Area[i].className = 'file-area-empty';
								}
								_File.MD5 = new Array(0);
								passcode_refresh && passcode_refresh();
								setCookie('name', postform.elements['name'].value, 2e4, '.'+ location.host);
							}
							// check captcha needed
							isCaptchaNeeded(() => {
								postform.elements['go'].disabled = recapt2.hidden = false;
							}, () => {
								postform.elements['go'].disabled = recapt2.hidden = true;
								renderCaptcha(
									recapt2, function(pass) {
										postform.elements['go'].disabled = !pass;
										postform.elements['g-recaptcha-response'].value = pass || '';
									});
							});
							break;
						case 'filechange':
							var dePostproc = (file, k, j) => {
								
								fileBinaryCheck(file, postform.elements['board'].value, addFileHash.bind(null, k, false), (msg) => {
									
									_File.Area[k].className = 'file-area-empty';
									
									postform.elements['md5passcode-'+ k].value = '';
									postform.elements['md5-'+         k].value = '';
									
									e.ports[0].postMessage({ name: 'de-file-del', data: j });
									alertify.error(msg);
								});
							}
							for (var i = 0; i < _File.blob.length;) {
								if (!result[i]) {
									_File.DelBtn[i + 1].click();
								} else if (isBlobDifferent(_File.blob[i], result[i])) {
									dePostproc((_File.blob[i] = result[i]), i + 1, i);
								}
								i++;
							}
							for (; i < result.length; i++) {
								dePostproc((_File.blob[i] = result[i]), i + 1, i);
							}
							initMepr(_File.rating, _File.blob);
							break;
						case 'newpost':
							_PONY && _PONY.genRefmap();
							MAIN_SETTINGS['userposts_hide'].forEach(hideUserPosts);
							result.forEach( num => { G4LA.handlePosts(document.getElementById('reply'+ num)) });
						/* case '...': */
					}
				};
				// список доступных API функций: https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/wiki/dollchan-api#Список-api
				e.ports[0].postMessage({ name: 'registerapi', data: ['submitform', 'newpost', 'filechange'] });
			}
		}
	});
	
	$DOMReady(() => {
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
		var not_sets_html = '';
		
		for (let board_link of document.querySelectorAll('*[id^="board_link_"]')) {
			
			let [,,position, name] = board_link.id.split('_');
			
			if (!(name in N0TS.links)) {
				N0TS.links[name] = {
					title: board_link.title
				};
				if (!/changelog|mail|info/.test(name)) {
					not_sets_html += '<label class="group-cell"><div>/'+ name +'/</div><input class="mute-nots" name="'+
						name +'" type="checkbox" '+ (name in N0TS.DATA && N0TS.DATA[name].mute ? 'checked': '') +'></label>\n';
				}
			}
			N0TS.links[name][position] = board_link;
		}
		
		N0TS.online = document.getElementById('online') || NULL;
		N0TS.speed  = document.getElementById('speed')  || NULL;
		N0TS.startWatch();
		
		// переделываем панель настроек
		var settings_panel = $(document.getElementById('settings-main')).draggable({
				snap: '#snapper, .droppable',
				snapMode: 'both',
				snapTolerance: 50 })[0];
		if (settings_panel) {
			// собираем панель настроек
			settings_panel.innerHTML = `
<div class="settings-section">
	<div class="options-cell">
		<p class="menu-head">Спойлеры и рейтинги</p>
		<br>Рейтинг по умолчанию:
			<select class="set-local" name="UploadRating_default">
				<option value=""></option>
				<option value="9">[S]</option>
				<option value="10">[C]</option>
				<option value="11">[A]</option>
			</select>
		<br>Раскрывать:
		<div class="menu-group">
			<label class="group-cell"><span>[S]</span><input class="set-cookie" name="show_spoiler_9" type="checkbox"></label>
			<label class="group-cell"><span>[C]</span><input class="set-cookie" name="show_spoiler_10" type="checkbox"></label>
			<label class="group-cell"><span>[A]</span><input class="set-cookie" name="show_spoiler_11" type="checkbox"></label>
		</div><br>
		<label class="menu-checkboxes"><input class="set-cookie" name="onepicman" type="checkbox">По одной картинке в постах</label>
	</div>
</div>
<div class="settings-section">
	<div class="options-cell">
		<p class="menu-head">Модификации</p>
		<label class="menu-checkboxes"><input class="set-local" name="galaform" type="checkbox"><span title="Если вас (как и меня) чем то не устраивает кукловая">Альтернативная форма ответа</span></label>
		<label class="menu-checkboxes"><input class="set-module" name="mepr" type="checkbox">Предосмотр постов</label>
		<label class="menu-checkboxes"><input class="set-module" name="typo" type="checkbox">«Оттипографичивание» текста</label>
		<label class="menu-checkboxes"><input class="set-local" name="snowStorm_enable" type="checkbox">Снег на экране
		<span style="font-style: italic; font-size: 75%; margin-left: 10px;">|<input class="set-local" name="snowStorm_freeze" type="checkbox">Всегда активен |</span></label>
	</div>
</div>
<div class="settings-section">
	<div class="options-cell">
		<p class="menu-head" title="Если ссылка не содержит имени файла, то следует его добавить к ней через hash # тэг\nhttps://rocld.com/abcd => https://rocld.com/abcd#хорошая_песня.mp3">Ссылки на файлы</p>
		<div class="menu-group">
			<label class="group-cell"><div>Картинки</div><input class="set-local" name="cm_image" type="checkbox"></label>
			<label class="group-cell"><div>Видео</div><input class="set-local" name="cm_video" type="checkbox"></label>
			<label class="group-cell"><div>Музыка</div><input class="set-local" name="cm_audio" type="checkbox"></label>
			<label class="group-cell"><div>Документы</div><input class="set-local" name="cm_docs" type="checkbox"></label>
		</div>
	</div>
</div>
<div class="settings-section">
	<div class="options-cell">
		<p class="menu-head">Остальное</p>
		<label class="menu-checkboxes"><input class="set-local" name="dollchanScript_enable" type="checkbox">Использовать встроенный Dollchan Script</label>
		${ MAIN_SETTINGS['dollchanScript_enable'] ? '' : '<label class="menu-checkboxes"><input class="set-local" name="ponymapoff" type="checkbox">Убрать «ответы»</label>' }
		<label class="menu-checkboxes"><input class="set-local" name="keymarks" type="checkbox"><span title="${
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
			'{[]} &middot; автокомплит работающий внутри тега [code]'}">Горячие клавиши разметки</span></label>
		<label class="menu-checkboxes"><input class="set-local" name="hide_coma-colormark" type="checkbox">Убрать цветные метки</label>
		<label class="menu-checkboxes"><input class="set-local" name="hide_roleplay" type="checkbox">Скрывать тег [rp]</label>
		<label class="menu-checkboxes"><input class="set-local" name="show_doubledash" type="checkbox">Олдскул стрелки слева у постов</label>
		<label class="menu-checkboxes"><input class="set-local" name="show_de-thr-buttons" type="checkbox">Показывать кнопку получения новых постов</label>
		<label class="menu-checkboxes"><input class="set-local" name="fixedHeader_enable" type="checkbox">Зафиксировать хедер</label>
		<p>Скрывать уведомления о новых постах/тредах</p>
		<div class="menu-group">${ not_sets_html }</div><br>
		<div>Скрытие по имени</div>
		<input class="no-reload" name="userposts_hide" placeholder="Введите (имена) в скобках (через) (пробелы)" style="width: 98%;" type="text"><br>
		<div id="tellwhohide"></div>
	</div>
</div>`;
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
			
			MAIN_SETTINGS['userposts_hide'].forEach(name => {
				ublacklist.appendChild( document.createElement('a') ).textContent = name;
			});
			
			settings_panel.querySelector('input[name="userposts_hide"]').addEventListener('input', function(e) {
				clearTimeout(e.target.timer_id);
				e.target.timer_id = setTimeout(() => {
					var match = e.target.value.match(/\(([^)]+)/g),
						len = match ? match.length : 0;
					for (var i = 0; i < len; i++) {
						var uname = match[i].substring(1).trim();
						if (!!uname && MAIN_SETTINGS['userposts_hide'].indexOf(uname) == -1) {
							MAIN_SETTINGS['userposts_hide'].push(uname);
							hideUserPosts(uname);
							ublacklist.appendChild( document.createElement('a') ).textContent = uname;
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
			postform.elements['dollchan_send'].value = +postform.elements['msgbox'].classList.contains('de-textarea');
			
			if ('name' in postform.elements) {
				postform.elements['name'].value = getCookie('name') || '';
			}
			if ('em' in postform.elements) {
				postform.elements['em'].value = getCookie('em') || '';
			}
			
			// уточняем максимальный размер файла на доске
			MAX_FILE_SIZE[postform.elements['board'].value] = Number(postform.elements['MAX_FILE_SIZE'].value);
			
			for (var i = 1; 'upload-image-'+ i in postform.elements; i++) {
				
				let md5      = postform.elements['md5-'          + i];
				let passcode = postform.elements['md5passcode-'  + i];
				let upload   = postform.elements['upload-image-' + i];
				let rating   = postform.elements['upload-rating-'+ i];
				
				_File.Area[i]   = upload.parentNode;
				_File.DelBtn[i] = _z.setup('a', { id: 'clear-file-'+ i, class: 'textbutton', text: '\n[X]' }, { click: cleanInputs });
				
				if (upload.files.length) {
					_File.Area[i].className = 'file-area';
					_File.MD5.push(passcode.value);
					_File.blob.push(upload.files[0]);
					upload.parentNode.insertBefore(_File.DelBtn[i], upload);
				} else {
					_File.Area[i].className = 'file-area-empty';
					passcode.value = md5.value = '';
				}
				_File.rating.push(PONY_RATE[ Number (rating.value) ]);
			}
			// вносим уточнение о максимально возможном колличестве файлов для одного поста на этой доске
			MAX_FILE_COUNT[postform.elements['board'].value] = i - 1;
			// init modules
			G4LA.init();
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
							nodes.forEach(G4LA.handlePosts);
						}
					}
				});
			});
			
			document.querySelectorAll('body, body > form[action="/board.php"]'+ _throbsv).forEach(function(target) {
				observer.observe(target, { childList: true });
			});
			
			window.handleFileSelect = function(n) {
				fileBinaryCheck(
					( _File.blob[ n - 1 ] = postform.elements['upload-image-'+ n].files[0] ),
					postform.elements['board'].value,
					addFileHash.bind(null, n, true),
					msg => {
						_File.DelBtn[n].click();
						alertify.error(msg);
					}
				);
			};
			window.submitPostform = function() {
				// очищаем перед отправкой поля с файлами
				if (1 != postform.elements['dollchan_send'].value) {
					for (var n = 1, length = MAX_FILE_COUNT.get(postform.elements['board'].value); n <= length; n++) {
						if (postform.elements['md5-'+ n].value) {
							postform.elements['upload-image-'+ n].value = '';
						}
					}
				};
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
					this.value = this.value.replace(/[фФ]/, 'a').replace(/[иИ]/, 'b').replace(/[сС]/, 'c').replace(/[вВ]/, 'd').replace(/[уУ]/, 'e').replace(/[аА]/, 'f').replace(/[пП]/, 'g').replace(/[рР]/, 'h').replace(/[шШ]/, 'i').replace(/[оО]/, 'j').replace(/[лЛ]/, 'k').replace(/[дДжЖ]/, 'l').replace(/[ьЬбБ]/, 'm').replace(/[тТ]/, 'n').replace(/[щЩ]/, 'o').replace(/[зЗхХ]/, 'p').replace(/[йЙ]/, 'q').replace(/[кК]/, 'r').replace(/[ыЫ]/, 's').replace(/[еЕ]/, 't').replace(/[гГ]/, 'u').replace(/[мМ]/, 'v').replace(/[цЦ]/, 'w').replace(/[чЧ]/, 'x').replace(/[нН]/, 'y').replace(/[яЯ]/, 'z').replace(/[;\[\]{}',\.\/`ъЪЭэ]/,'');
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
			
			recapt2 = document.getElementById('recapt-2');
			
			isCaptchaNeeded(() => {
				postform.elements['go'].disabled = false;
			}, () => {
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
		var x = _File.MD5.indexOf(postform.elements['md5passcode-'+ k].value);
			x !== -1 && _File.MD5.splice(x, 1);
		delete _File.blob[ k - 1 ];
		_File.Area[k].className = 'file-area-empty';
		postform.elements['md5passcode-'+ k].value = '';
		postform.elements['upload-image-'+ k].value = '';
		postform.elements['md5-'+ k].value = '';
		this.remove();
	}
	
	function addFileHash(n, add_btn, md5, reject) {
		var target   = postform.elements['upload-image-'+ n];
		var passcode = postform.elements['md5passcode-' + n];
		var cix      =    _File.MD5.indexOf(passcode.value);
		    cix !== -1 && _File.MD5.splice(cix, 1);
		
		if (_File.MD5.indexOf(md5) !== -1) {
			reject('Уже добавлен точно такой же файл');
		} else {
			// always send sha512 of file for passcode records
			$GET('/chkmd5.php?x='+ md5, ({ target: {response} }) => {
				postform.elements['md5-'+ n].value = !response ? '' : md5;
			});
			// field will be sent only if user have cookie with real passcode
			_File.Area[n].className = 'file-area';
			_File.MD5.push((passcode.value = md5));
			add_btn && target.parentNode.insertBefore(_File.DelBtn[n], target);
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
					de_rpiChange(n, img_selected.src, title, Number (rating.value = this.value));
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
				case 'mute-nots':
					N0TS.assign(name, { mute: _Input.checked });
					localStorage.setItem('data_nots', JSON.stringify(N0TS.DATA));
				case 'no-reload':
					keyW = '!';
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
					MAIN_SETTINGS[name] = (_Input.type === 'checkbox' ? _Input.checked : _Input.value);
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
						document.querySelectorAll('.post-body > blockquote a[href*="//"]:not(.cm-link):not(.cm-button):not(.irc-reflink)').forEach(G4LA.handleLinks);
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
							_PonyRateHiglight(dF, _Input);
						}
					});
					break;
				case 'fixedHeader':
					toggleHeaderOnTop();
					break;
				case 'snowStorm':
					if (keyW[1] === 'freeze') {
						(snowStorm || NULL).freezeOnBlur = MAIN_SETTINGS['snowStorm_freeze'];
					} else
						snowStormToggle();
					break;
				case 'show':
					inline_style.textContent = inline_style.textContent.replace(
						new RegExp('(\\.'+ keyW[1] +')\\s[^}]+'), '$1'+ (
						keyW[1] == 'de-thr-buttons' ? `${ MAIN_SETTINGS[name] ? ' + br' : '' } { display: none!important; ` :
						                              ` { display: ${ MAIN_SETTINGS[name] ? 'inline' : 'none' }!important; `));
					break;
				case 'hide':
					inline_style.textContent = MAIN_SETTINGS[name] ?
						inline_style.textContent.replace('.hempty', `.hempty, .${ keyW[1] }`) :
						inline_style.textContent.replace(`, .${ keyW[1] }`, '');
				case 'keymarks': case '!':
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
	var _DerpBtn = _z.setup('a', { class: 'de-menu-item de-src-derpibooru', target: '_blank', text: 'Поиск по Derpibooru', onclick: derpSearch });
	function derpSearch(e) {
		var reverse_token = localStorage.getItem('reverse_token') || 'y6GoECgRb541VTJPH7g0kR1owGee9KEi3KdCuBUiQ/3GBUb1aQdYjJNbApZdeZUA8o3WBPSOVy7ZHRj+/46uuw==';
		var _DerpForm = document.body.firstElementChild.appendChild( _z.setup('form', {
		  'accept-charset': 'UTF-8',
		   enctype : 'multipart/form-data',
		   action  : '//derpibooru.org/search/reverse',
		   target  : '_blank',
		   method  : 'post',
		   hidden  :  true,
		   html    : '<input name="scraper_url" type="url" value=""><input name="fuzziness" value="0.25" type="number"><input name="utf8" value="✓" type="hidden"><input name="authenticity_token" value="'+ reverse_token +'" type="hidden">'}));
		!(derpSearch = function(e) {
			_DerpForm.elements['scraper_url'].value = decodeURIComponent(e.target.previousElementSibling.href.split('=')[1]);
			_DerpForm.submit();
		})(e);
		e.target.onclick = derpSearch;
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
	
	function initMepr() {
		if (typeof Mepr === 'function') {
			
			const mepr = new Mepr;
			
			let _stumb, mepr_button = postform.elements['namebox'].parentNode.appendChild( _z.setup('a', {
			     class: 'mepr-button', href: 'javascript:void(0)', text: '(Предпросмотр)', style: 'float: right; font: italic 1em serif;'
			}, { click: (e, name = 'add') => {
				if (e.target.classList.toggle('active')) {
					mepr.render({
						mailto  : postform.elements['em'].value ,
						name    : postform.elements['name'].value || 'Аноним' ,
						subject : postform.elements['subject'].value ,
						raw_post: postform.elements['message'].value ,
						ratings : _File.rating, files: _File.blob
					});
					initMepr = (rate, blob) => mepr.updateThumbs(rate, blob);
					document.body.appendChild( mepr.viewBox );
				} else {
					name = 'remove';
					initMepr = NULL.fn;
					mepr.viewBox.remove();
				}
				postform[name +'EventListener']('change', updatePreview);
				postform[name +'EventListener']('input', slowPreviewed);
			}}));
			
			const updatePreview = ({ target: {name,value} }) => {
				if (name in mepr) {
					mepr[name] = value;
				} else if (/upload-rating-\d/.test(name)) {
					_File.rating[ name.substr(-1) - 1 ] = PONY_RATE[ Number (value) ];
					mepr.updateThumbs(_File.rating);
				} else if (name === 'upload[]') {
					mepr.updateThumbs(_File.rating, _File.blob);
				}
			}
			const slowPreviewed = (e) => {
				_stumb = setTimeout (updatePreview.bind(clearTimeout (_stumb), e), 300);
			}
			EXT_STYLE.append(Mepr.style);
		}
		initMepr = NULL.fn;
	}
})();

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
function expandImage(/* event, img_src, img_thumb, img_width, img_height, thumb_width, thumb_height */) {
	
	var onWinResize, layer = _z.setup('div', {
		style : 'position: fixed; bottom: 0; top: 0; right: 0; left: 0; background-color: rgba(17,17,17,.9); z-index: 99999;',
		html  : '<div style="position: absolute; left: 50%; top: 50%; width: 100%; height: 100%;"><img style="border-radius: 3px; border-width: 0px; position: absolute; display: inline-block;" /></div>'
	},{ click : function(e) {
		this.remove();
		box_image.src = '';
		window.removeEventListener('resize', onWinResize, false);
	}}), box_image = layer.firstElementChild.firstElementChild;
	
	var f = 'innerWidth' in window ? 'window.inner': document.documentElement ? 'document.documentElement.client' : 'document.body.client',
		getWasp = new Function('return { width: '+ f +'Width, height: '+ f +'Height }');
	
	!(expandImage = function(evt, src, thumb, oW, oH, tW, tH) {
		
		evt.preventDefault();
		
		if (/\.(?:webm|mp4|mp3|ogg)$/.test(src)) {
			if (!G4LA['Video'].src.includes(src)) {
				G4LA['Video'].src    = src;
				G4LA['Video'].poster = thumb;
				G4LA['Video'].id     = 'video_'+ evt.target.parentNode.id;
			}
			G4LA.loadFrame(G4LA['Video']);
		} else {
			
			box_image.src = src;
			calcScale(box_image, oW, oH);
			
			window.addEventListener('resize', (onWinResize = () => {
				calcScale(box_image, oW, oH)
			}), false);
			
			document.body.appendChild(layer);
		}
	}).apply(this, arguments);
	
	function calcScale(i, s, n) {
		var r, w = getWasp();
		if (w.width / w.height < s / n) {
			r = w.width * 0.85;
			r > s && ('high-res' == i.className || i.style.maxWidth ) ? (i.width = s, i.height = n) : (i.height = n * (r / s), i.width  = r);
		} else {
			r = 0.85 * w.height;
			r > n && ('high-res' == i.className || i.style.maxHeight) ? (i.width = s, i.height = n) : (i.width  = s * (r / n), i.height = r);
		}
		i.style.left = (0 - i.width  / 2) +'px';
		i.style.top  = (0 - i.height / 2) +'px';
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

function fileBinaryCheck(file, desk, resolve, reject, max_size) {
	if (!VALID_FILE_TYPES.test(file.type)) {
		reject(file.name +'\n<br>\n<br>\nНеподдерживаемый формат\n<br>\n['+ file.type.substring(file.type.indexOf('/') + 1) +' => jpeg, png, gif, webm, mp4, ogg, mp3]');
	}
	else if ((max_size = MAX_FILE_SIZE.get(desk)) < file.size) {
		reject(file.name +'\n<br>\n<br>\nСлишком большой файл\n<br>\n['+ ((file.size / 1024 / 1024).toFixed(2)) +'/'+ ((max_size / 1024 / 1024).toFixed(2)) +' MB]');
	}
	else {
		const reader = new FileReader;
		reader.onload = function() {
			if (this.readyState == FileReader.DONE) {
				let rawstring = this.result;
				let length    = this.result.length;
				while (!isNaN( rawstring.charAt(length - 1) )) { // is number
					length--;
				}
				resolve( Crypt.MD5(rawstring.substr(0, length), false), reject );
			}
		}
		reader.readAsBinaryString(file);
		return true;
	}
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
		
	while (i) {
		hash = (hash * 33) ^ str.charCodeAt(--i);
	}
	return hash >>> 0;
}
function renderCaptcha(place, reCallback) {
	if (typeof window.grecaptcha === 'undefined') {
		setTimeout(() => renderCaptcha(place, reCallback), 2000);
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
	var xmlHttp = new XMLHttpRequest;
		xmlHttp.open('GET', URL, true);
		xmlHttp.onload = Fn;
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
	this.dispatchEvent(new InputEvent('input', { bubbles: true }));
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

const KeyChars = {
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
					key === '@' ? $this.textMark('* ', '\n* ', 'ql') :
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
