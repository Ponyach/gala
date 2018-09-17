//@import SCPurePlayer

const Gala = (() => {
	/* ---{ Gala Extension }--- */
	
	const embedField = false; /*localStorage.getItem('EmbedField')*/
	const myPostsMap = JSON.parse(localStorage.getItem('de-myposts')) || {};
	const dynamicCSS = _z.setup('style', { id: 'gala_dynamic_css' });
	
	function _Constructor() {
		
		const self = this;
		
		this._EditForm = this._GalaForm = null;
		
		this['Audio']   = _z.setup('audio', { class: 'audio-container', controls: true});
		this['Video']   = _z.setup('video', { class: 'video-container', controls: true});
		this['OVERLAY'] = _z.setup('div'  , { class: 'content-window hidup', html: '<div id="shadow-box"></div><label id="close-content-window"></label><div id="content-frame"></div>'}, {
			click: function(e) {
				switch (e.target.id) {
					case 'close-content-window':
						_z.remove([this, self['Marker']]);
						_z.remove(this.lastElementChild.childNodes);
						break;
					case 'content-frame':
					case 'shadow-box':
						this.classList.add('hidup');
						self['Marker'].classList.remove('hidout');
				}
			}, mousedown: function(e) {
				if (e.target.className.indexOf('-container') >= 0) {
					self.zIndex++;
					e.target.style['z-index'] = self.zIndex;
				}
			}
		});
		this['Marker'] = _z.setup('label', {id: 'show-content-window', class: 'hidout'}, {
			click: function(e) {
				self['OVERLAY'].classList.remove('hidup');
				e.target.classList.add('hidout');
			}
		});
		
		if (MAIN_SETTINGS.galaform) {
			this._GalaForm = makeGalaForm(MAIN_SETTINGS.galaform);
			isCaptchaNeeded(null, this._GalaForm.captcha_needed);
		}
	}
	
	_Constructor.prototype = {
		zIndex: 1,
		set myPostsMap(data) {
			Object.assign(myPostsMap, data);
		},
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
		},
		handleLinks: handleLinks,
		handlePosts: handlePosts,
		handleEvent: function(e) {
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
									this.loadFrame($btn._container);
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
									$btn.after( this['Audio'] );
									_z.setup(this['Audio'], { id: 'audio_'+ $Id[1], src: $btn.href }).play();
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
								if (!this['GDoc']) {
									this['GDoc'] = _z.setup('div', { class: 'gdoc-container',
										html: '<iframe frameborder="0" scrolling="auto" width="100%" height="100%">'});
								}
								if (this['GDoc'].id !== 'gdoc_'+ $Id[1]) {
									this['GDoc'].firstElementChild.src = '//docs.google.com/gview?embedded=true&url='+ $btn.href;
									this['GDoc'].id = 'gdoc_'+ $Id[1]
								}
								this.loadFrame(this['GDoc']);
								break;
							case 'videolnk':
								if (this['Video'].src !== $btn.href)
									this['Video'].src = $btn.href;
								if (!embedField) {
									this.loadFrame(_z.setup(this['Video'], { id: 'video_'+ $Id[1] }));
								} else {
									var $pcont = jumpCont($btn, 'mediacontent'),
										$video = $pcont.querySelector('#video_'+ $Id[1]);
									if ($video) {
										$btn.className = 'cm-button cm-play';
										$video.remove();
									} else {
										$btn.className = 'cm-button cm-stop';
										$video = _z.setup(this['Video'], { id: 'video_'+ $Id[1] });
										$pcont.appendChild($video);
										$video.play();
									}
								}
						}
						break;
					case 'mv-frame':
						if (!e.target.parentNode.inwin) {
							e.target.className = 'mv-frame to-post';
							this.loadFrame(e.target.parentNode);
							if(!e.target.parentNode.style['width'] && !e.target.parentNode.style['height']) {
								e.target.parentNode.style['width']  = '60%';
								e.target.parentNode.style['height'] = '85%';
							}
						} else {
							var pblnk = document.getElementById('PBlnk_'+ e.target.parentNode.id.split('_')[1]);
							pblnk && pblnk.after( e.target.parentNode );
							e.target.className = 'mv-frame to-win';
							this['Marker'].classList.remove('hidout');
							this['OVERLAY'].classList.add('hidup');
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
							const res  = parseBoardURL(el.querySelector('.reflink a').href);
							const trip = el.querySelector('.postertrip') && getCookie('name');
							const _EditForm = this._EditForm || (this._EditForm = makeGalaForm(null));
							getDataResponse(location.origin +'/get_raw_post.php?b='+ res.board +'&p='+ res.post, function(data) {
								switch (data.status) {
									case 0:
									case 3:
										_EditForm.clear_all();
										_EditForm.children['gala-error-msg'].textContent = data.error;
										_EditForm.children['gala-error-msg'].style['background-color'] = data.status == 0 ? '#04A13D' : '#E04000';
										_EditForm.children['gala-replytitle'].lastElementChild.textContent = 'пост №.'+ res.post;
										_EditForm.elements['board'].value       = res.board;
										_EditForm.elements['replythread'].value = res.thread;
										_EditForm.elements['editpost'].value    = res.post;
										_EditForm.elements['message'].value     = data.raw_message;
										_EditForm.elements['subject'].value     = data.subject;
										_EditForm.elements['em'].value          = data.email;
										_EditForm.elements['name'].value = trip && trip.substr(0, data.name.length) === data.name ? trip : data.name;
										_EditForm.querySelector('.sagearrow').classList[data.email === 'sage' ? 'remove' : 'add']('inactive');
										if (data.files) {
											_EditForm.add_md5(data.files);
										}
										el.prepend( _EditForm );
										break;
									default:
										alertify.alert(data.error);
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
						$btn.parentNode.nextElementSibling.appendChild(this._GalaForm);
						break;
					case 'gcall-write-reply':
					case 'rep-use1':
						_z.route(e.target, function(rp) {
							if ( /reply\d+/.test(rp.id) ) {
								var res = parseBoardURL(rp.querySelector('.reflink a').href);
								this._GalaForm.elements['board'].value = res.board;
								this._GalaForm.elements['replythread'].value = res.thread;
								this._GalaForm.elements['message'].textMark('>>'+ (res.post || res.thread), '\r\n', 'ijct');
								this._GalaForm.children['gala-replytitle'].lastElementChild.textContent = (
									document.querySelector('#reply'+ res.thread +' .filetitle') || 
										{ textContent: '(без названия) №.'+ res.thread }
									).textContent;
							}
							if (rp.classList.contains('psttable') || rp.classList.contains('oppost') ||
								rp.classList.contains('de-pview') && (rp = rp.lastElementChild)) {
								rp.after( this._GalaForm );
								return true;
							}
							return false;
						}.bind(this));
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
	
	const DF = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'xps', 'rtf'];
	const AF = ['opus', 'wav', 'm4a', 'm4r', 'aac', 'ogg', 'mp3'];
	const VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v'];
	const IF = ['jpeg', 'jpg', 'png', 'svg', 'gif'];
	
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
	
	function handlePosts(pst) {
		var reply = /reply\d+/.test(pst.id) ? pst : pst.querySelector('.pstnode > *[id^="reply"]');
		if (reply && !reply.hasAttribute('gala-off')) {
			var bquot = reply.querySelector('.post-body > blockquote');
			var pid = reply.getAttribute('data-num');
			if (myPostsMap[LOCATION_PATH.board] && pid in myPostsMap[LOCATION_PATH.board]) {
				reply.classList.add('de-mypost');
			}
			if (MAIN_SETTINGS.galaform) {
				reply.querySelector('.extrabtns').previousSibling.before( _z.setup('a', {
					html: '<svg class="gcall-write-reply rep-arrow-svg"><use class="rep-use1" xlink:href="#gala-rep-arrow"></use></svg>'}));
			}
			var sclnks = bquot.querySelectorAll('a[href^="https://soundcloud.com/"], a[href^="http://soundcloud.com/"]');
			if (sclnks.length > 0) {
				jumpCont(bquot, 'mediacontent').appendChild(SCPurePlayer.createGroup(sclnks));
			}
			bquot.querySelectorAll('a[href*="//"]:not(.cm-link):not(.cm-button):not(.irc-reflink)').forEach(handleLinks);
			reply.setAttribute('gala-off', '');
		}
	}
	
	function globalBtReset(btn) {
		btn.className = 'gala-globalform-open';
		btn.parentNode.nextElementSibling.style['display'] = 'none';
	}
	
	function bytesMagnitude(bytes) {
		return (bytes < 1024 ? bytes +' B' :
				bytes < 1024 * 1024 ? (bytes / 1024).toFixed(2) +' KB' :
				bytes < 1024 * 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(2) +' MB' :
											(bytes / 1024 / 1024 / 1024).toFixed(2) +' GB');
	}
	
	function makeGalaForm(formPosition) {
		var tempForm  = _z.setup('form', { class: 'reply', action: '/board.php?json=1&strip_exif=', enctype: 'multipart/form-data', style: 'display: table-row-group;', 
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
							'<label title="Удалять лишние данные картинок">'+
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
				'</div>' }, { submit: submitGFlistener, click: clickGFlistener });
		
		tempForm.files = tempForm.getElementsByClassName('gala-file');
		tempForm.init  = () => {
			if (typeof Mepr === 'function') {
				
				const mepr = new Mepr;
				const data = {
					get mailto  (){ return tempForm.elements['em'].value },
					get name    (){ return tempForm.elements['name'].value || 'Аноним' },
					get subject (){ return tempForm.elements['subject'].value },
					get raw_post(){ return tempForm.elements['message'].value },
					get files   (){ return Array.prototype.map.call(tempForm.files, f => f.blob) },
					get ratings (){ return Array.prototype.map.call(tempForm.files, f => f.rating) }
				};
				
				let _stumb, mepr_button = tempForm.children['gala-replytitle'].children[0].appendChild(
					_z.setup('span', { html: '<svg class="meprciew ls-de-svg"><use xlink:href="#de-symbol-meprciew" /></svg>' }).firstElementChild
				);
				const updatePreview = ({ target: {name,value} }) => {
					if (name in mepr) {
						mepr[name] = value;
					}
				};
				const slowPreviewed = (e) => {
					_stumb = setTimeout (updatePreview.bind(clearTimeout (_stumb), e), 300);
				};
				mepr_button.addEventListener('click', (e, name = 'add') => {
					if (e.target.classList.toggle('active')) {
						mepr.render(data);
						tempForm.init = (p) => mepr.updateThumbs(data.ratings, !p && data.files);
						document.body.appendChild( mepr.viewBox );
					} else {
						name = 'remove';
						tempForm.init = NULL.fn;
						mepr.viewBox.remove();
					}
					tempForm[name +'EventListener']('change', updatePreview);
					tempForm[name +'EventListener']('input', slowPreviewed);
				});
			}
			tempForm.init = NULL.fn;
		}
		
		tempForm.elements['dumb_file_field'].onchange = ({ target }) => { tempForm.add_files(target) };
		tempForm.elements['message'].textMark = galamarK;
		
		if (formPosition === null) {
			tempForm.id = 'gala-edit-form';
			tempForm.init();
		} else {
			tempForm.id = 'gala-reply-form';
			
			if (formPosition == 1) {
				tempForm.style.left  = tempForm.style.top = '35%';
				tempForm.onmousedown = mousedownGFlistener;
				tempForm.classList.add('gala-freestyle');
			}
			
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
			
			var files  =  data.files,
			   length  =  files.length,
			  fileURL  =  data.getData ? data.getData(data.effectAllowed === 'copyLink' ? 'Text' : 'URL') : null,
			     desk  =  this.elements['board'].value,
			    limit  =  MAX_FILE_COUNT.get( desk ) - this.files.length,
			 defaultR  =  this.elements['default_file_rating'].value;
			
			if ( ! length && fileURL) {
				limit > 0 && this.get_url_file(fileURL);
			}
			else {
				for (let i = 0; i < length && i < limit; i++) {
					
					let file = files[i];
					let FiD  = 'gf_'+ file.type +';'+ file.size;
					if (FiD in this.files) {
						limit += (length > limit);
						continue;
					} 
					
					let fnode = VALID_FILE_TYPES.test(file.type) ? makeGalaFile(file, FiD, defaultR) : '';
					
					if (fileBinaryCheck(file, desk, md5 => { fnode.md5 = md5 }, alertify.error)) {
						this['FileArea'].appendChild(fnode);
					}
					else if (length > limit) {
						limit++;
					}
				}
				if (this.files.length) {
					this['FileArea'].classList.add('hold');
					this.init();
				}
			}
		}
		tempForm.add_md5 = function addMD5(data) {
			
			const LIMIT  = MAX_FILE_COUNT.get( this.elements['board'].value ) - this.files.length;
			
			for (let i = 0; i < data.length && i < LIMIT; i++) {
				
				let md5   = data[i].md5;
				let rate  = PONY_RATE[data[i].rating] || 'N';
				let fnode = _z.setup('div', {
					id   : 'gf_'+ md5,
					class: 'gala-file',
					html : '<span class="file-remove"></span><img class="file-gview" src="'+ data[i].thumb +'" title="'+ data[i].info +'"><div class="file-cover-label '+ rate +'"><ul class="file-cover-select"><li class="file-cover S"></li><li class="file-cover C"></li><li class="file-cover A"></li><li class="file-cover N"></li></ul></div>'
				});
				
				fnode.blob   = data[i];
				fnode.rating = rate;
				fnode.exist  = true;
				fnode.md5    = md5;
				
				this['FileArea'].appendChild(fnode);
				this['FileArea'].classList.add('hold');
			}
		}
		tempForm.clear_all = function() {
			this.elements['g-recaptcha-response'].value = '';
			this.children['gala-error-msg'].textContent = '';
			this.elements['subject'].value = '';
			this.elements['message'].value = '';
			this.elements['message'].dispatchEvent(new InputEvent('input'));
			this['FileArea'].classList.remove('hold');
			_z.each(this.files, f => f.remove());
		}
		tempForm.captcha_needed = () => {
			tempForm.elements['submit_this_form'].type = 'button';
			tempForm.elements['submit_this_form'].className = 'call-captcha-widget';
			tempForm.elements['submit_this_form'].value = 'Капча';
		}
		tempForm.get_url_file = function httpGFile(fileURL) {
			getDataBinary('Blob', fileURL, (blob, f_url) => {
				blob.name = getPageName(f_url);
				tempForm.add_files({ files: [blob] });
			});
		}
		return tempForm;
	}
	
	function localGFChanges(e) {
		MAIN_SETTINGS[e.target.id] = e.target.checked;
		localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
	}
	
	function itemsPlurality(count) {
		var i = count.toString(),
			l = i[i.length - 1];
		return i +' файл'+ (l == 1 ? '' : l < 5 ? 'а' : 'ов');
	}
	
	function makeGalaFile(file, FiD, R) {
		
		var gview, hash;
		var type    = file.type.split('/');
		var size    = bytesMagnitude(file.size);
		var blobURL = (window.URL || window.webkitURL).createObjectURL(file);
		
		var fnode = _z.setup('div', {
			id   : FiD,
			class: 'gala-file',
			html : '<span class="file-remove"></span><div class="file-cover-label '+ R +'"><ul class="file-cover-select"><li class="file-cover S"></li><li class="file-cover C"></li><li class="file-cover A"></li><li class="file-cover N"></li></ul></div>'
		});
		
		fnode.blob        = file;
		fnode.rating      = R;
		fnode.upload_name = file.name;
		
		switch (type[0]) {
			case 'audio':
			case 'video':
				gview = _z.setup('video', {'src': blobURL, 'muted': true, 'class': 'file-gview',
					'onloadedmetadata': function() {
						var sec = Math.floor(this.duration) % 60;
						var min = Math.floor(this.duration / 60);
						this.title = type[1].toUpperCase() +', '+ this.videoWidth +'×'+ this.videoHeight +', '+ min +':'+ sec +', '+ size;
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
		
		Object.defineProperty(fnode, 'md5', {
			get: (   ) => hash,
			set: (md5) => {
				//always send sha512 of file for passcode records
				//field will be sent only if user have cookie with real passcode
				$GET('/chkmd5.php?x='+ (hash = md5), ({ target: {response} }) => {
					fnode.exist = !!response;
				});
			}
		});
		
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
				this.elements['em'].value = $btn.classList.toggle('inactive') ? '' : 'sage';
				break;
			case 'closeform':
				this.remove();
				break;
			case 'toggleform':
				if (!this.classList.toggle('gala-freestyle')) {
					this.onmousedown = null;
					MAIN_SETTINGS['galaform'] = 2;
				} else {
					var coords = this.getBoundingClientRect();
					this.style['left'] = coords.left +'px';
					this.style['top' ] = coords.top  +'px';
					this.onmousedown = mousedownGFlistener;
					MAIN_SETTINGS['galaform'] = 1;
				}
				localStorage.setItem('main_settings', JSON.stringify(MAIN_SETTINGS));
				break;
			case 'gmark-btn':
				var tag = $btn.classList[1],
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
				$btn.classList.remove('ta-inact');
				break;
			case 'call-captcha-widget':
				alertify.alert('<div id="catcha-widget-'+ this.id +'" style="text-align: center;"></div>');
				grecaptcha.render('catcha-widget-'+ this.id, {
					'sitekey': '6Lfp8AYUAAAAABmsvywGiiNyAIkpymMeZPvLUj30',
					'theme': 'light',
					'expired-callback': this.captcha_needed,
					'callback': function(token) {
						this.elements['submit_this_form'].type = 'submit';
						this.elements['submit_this_form'].className = 'send-form';
						this.elements['submit_this_form'].value = 'Отправить';
						this.elements['g-recaptcha-response'].value = token;
					}.bind(this)
				});
				break;
			case 'new-thr-chx':
				this.elements['replythread'].value = ($btn.classList.toggle('inactive') ? LOCATION_PATH.thread : 0);
				break;
			case 'file-cover-label':
				$btn.classList.toggle('active');
				break;
			case 'file-cover':
				if ($btn.parentNode.parentNode.parentNode.rating !== $btn.classList[1]) {
					$btn.parentNode.parentNode.className = 'file-cover-label '+ (
						$btn.parentNode.parentNode.parentNode.rating = $btn.classList[1]
					);
					this.init(true);
				}
				break;
			case 'file-remove':
				$btn.parentNode.remove();
				this.init();
				if (this.files.length == 0)
					this['FileArea'].classList.remove('hold');
		}
	}
	
	const content_error = 'Нельзя отправлять сообщения без файлов и текста.';
	
	function submitGFlistener(e) {
		try { e.preventDefault();
			var form = e.target;
			var flen = e.target.files.length;
			if (!flen && !form.elements['message'].value.trim()) {
				form.children['gala-error-msg'].textContent = content_error;
				form.children['gala-error-msg'].style['background-color'] = '#E04000';
				return;
			}
			var desk = form.elements['board'].value;
			var thread_id = form.elements['replythread'].value;
			var formData = new FormData();
			for (let i = 0, elen = form.elements.length; i < elen; i++) {
				if ( ! form.elements[i].name) {
					continue;
				}
				formData.append(form.elements[i].name, form.elements[i].value);
			}
			for (let i = 0, n = 1; i < flen; i++, n++) {
				let name = form.files[i].upload_name,
				    blob = form.files[i].blob;
				if (form.files[i].exist) {
					formData.append('md5-'+ n, form.files[i].md5);
					blob = new Blob;
				}
				formData.append('upload[]', blob, (form.elements['clear_files_name'].checked ? name.replace(/^.*?(\.[A-z]+)$/, ' $1') : name ));
				formData.append('upload-rating-'+ n, PONY_RATE.indexOf(form.files[i].rating));
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
								var buttons_path = '#thread'+ thread_id + desk +' + .de-thr-buttons .de-thr-updater-link';
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
							var t = 6, timr = setInterval (() => {
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
				postReq.open('POST', form.action + Number (form.elements['remove_jpeg_exif'].checked), true);
				postReq.send(formData);
		} catch(log) {
			console.error(log)
		}
	}
	
	_Constructor.prototype.init = function() {
		if (this['_GalaForm']) {
			
			const globalform_area = _z.setup('div', {
				class: 'gala-globalform-area',
				html: '<div>[<a class="gala-globalform-open"></a>]</div><div style="text-align: left; display: none;"></div><hr>'
			});
			
			const postarea = _z.setup(document.querySelector('.postarea'), { style: 'display: block!important;' });
			      postarea && postarea.after( globalform_area );
			
			const delform = (document.forms.delform || document.querySelector('form[de-form]'));
			      delform && delform.after( globalform_area.cloneNode(true) );
			
			document.body.appendChild( _z.setup('div', { style: 'height: 0; width: 0; position: fixed;', html: `
<style>
	.de-parea, #de-main > hr, .postarea > #postform, .de-btn-rep { display: none; }
	.de-svg-back { fill: inherit; stroke: none; }
	.de-svg-fill { stroke: none; fill: currentColor; }
	.de-svg-stroke { stroke: currentColor; fill: none; }
	.de-btn-sage { margin: 0 2px -3px; cursor: pointer; width: 12px; height: 16px; }
	.rep-arrow-svg { margin: 0 2px -4px 3px; cursor: pointer; width: 20px; height: 16px; }
</style>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	<defs></defs>
	<symbol viewBox="0 0 16 16" id="de-symbol-post-back">
		<path class="de-svg-back" d="M4 1q-3 0,-3 3v8q0 3,3 3h8q3 0,3 -3v-8q0 -3,-3-3z"></path>
	</symbol>
	<symbol viewBox="0 0 16 10" id="gala-rep-arrow">
		<path class="de-svg-fill" d="M7,4 L0,8 L1.7,4 L0,0 L7,4 Z"></path>
		<path class="de-svg-fill" d="M14,4 L7,8 L8.7,4 L7,0 L14,4 Z"></path>
	</symbol>
	<symbol viewBox="0 0 16 16" id="de-symbol-post-sage">
		<path class="de-svg-fill" d="M3,.003 C5.5,-.003 8.4,-.003 11.2,.003 C11.1,.5 11.03,1.005 11,1.5 C8.3,1.5 5.6,1.5 3,1.5 C3,1.002 3,.5 3,.003 C3,.003 3,.5 3,.003 L3,.003 L3,.003 Z"></path>
		<path class="de-svg-fill" d="M3.1,3 C6,3 8.2,3 11,3 C11,3.4 10.5,4 10.4,4.4 C8.1,4.4 6,4.4 3.4,4.4 C3.3,4 3,3.4 3.1,3 C3.1,3 3.2,3.4 3.1,3 L3.1,3 L3.1,3 Z"></path>
		<path class="de-svg-fill" d="M4,6 C6,6 8,6 10.2,6 C10,7 10,8 10,9 C11,9 12.5,8.5 14,8 C11.6,11.1 9.3,14 7,16.2 C4.6,14 2.3,11.1 -.1,8.5 C1.3,8.5 3,8.5 4.1,8.5 C4,7.6 4,7 4,6 C4,6 4,7 4,6 L4,6 L4,6 Z"></path>
	</symbol>
	<symbol viewBox="0 0 16 12" id="de-symbol-meprciew">
		<path class="de-svg-stroke" stroke-width="2" d="M3,9 L13,9"></path>
		<path class="de-svg-stroke" stroke-width="2" d="M0,0 L16,0 L16,12 L0,12 L0,0 Z"></path>
	</symbol>
	<symbol viewBox="0 0 16 16" id="de-symbol-win-arrow">
		<path class="de-svg-stroke" stroke-width="3.5" d="M8 13V6"></path>
		<path class="de-svg-fill" d="M3.5 7h9L8 2.5 3.5 7z"></path>
	</symbol>
	<symbol viewBox="0 0 16 16" id="de-symbol-win-close">
		<path class="de-svg-stroke" stroke-width="2.5" d="M3.5 3.5l9 9m-9 0l9-9"></path>
	</symbol>
</svg>`}));
		}
		_z.each('.psttable *[id^="reply"], .oppost[id^="reply"]', handlePosts);
		document.body.appendChild( dynamicCSS );
	}
	
	_Constructor.style = `.de-src-iqdb:after, #de-txt-panel:after { content:""; -webkit-animation: init 1s linear 2; animation: init 1s linear 2; }

.greenmk:not(.inactive):before { content: "✓ "; color: green; }
.feckbox { font-size: small; margin-right: 5px; font-variant-caps: all-petite-caps; } input:checked + .feckbox { text-decoration: line-through; }
.dropbox { position: absolute; z-index: 1; height: 100%; top: 0px; left: 0px; background-color: rgba(0,0,0,.5); border: 2px dashed white; width: 100px; text-align: center; color: white; border-radius: 4px; }
.greenmk, .dropdown-menu li, .dropdown-arrow { -webkit-touch-callout:none; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; }
.file-area, .dropdown-toggle, .text-line-ic, #gala-replytitle { position: relative; }
#gala-replytitle, .gala-globalform-area { text-align: center; }

.files-add { bottom: 0; position: absolute; background-color: rgba(0,0,0,.1); border-radius: 5px; text-align: center; height: 20px; width: 25px; cursor: pointer; }
.files-params { display: none; text-align: center; max-width: 100px; } .file-area.hold > .files-params { display: block; }
.gala-file { margin-right: 4px; margin-top: 4px; position: relative; width: 100px; }
.file-gview { max-width: 100px; max-height: 100px; margin: 0 auto; display: block; }
.file-cover-label, .file-remove { position: absolute; cursor: default; text-align: center; font-size: 10px; } .file-remove:hover { opacity: 1; }
.file-remove { background-color: black; border-radius: 100%; width: 14px; height: 14px; top: 2px; left: 2px; color: white; } .file-remove:before { content: "×"; }
.file-cover-label { bottom: 2px; right: 0; } .file-cover-label:after { font-weight: bold; border-radius: 7px; padding: 1px 5px; color: white; margin: 0 6px; } .file-cover-label.N:after { content: "[\xA0]"; }
.file-cover-select, .dropdown-menu { padding-left: 0; list-style: outside none none; } .file-cover-select { display: none; background-color: #fefefe; margin: 0; } .active > .file-cover-select { display: inherit; }
.file-cover { padding: 0 10px; cursor: default; } .S:after { content: "[S]"; } .C:after { content: "[C]"; } .A:after { content: "[A]"; } .file-cover.N { padding-top: 13px; } .file-cover:hover { color: #fff!important; }
.file-cover-label.S:after,.file-cover.S:hover, .de-rpiStub.S:before, .de-rpiStub.S:after, .mepr-rating.S:before { background-color: #8C60B1; }
.file-cover-label.C:after,.file-cover.C:hover, .de-rpiStub.C:before, .de-rpiStub.C:after, .mepr-rating.C:before { background-color: #E65278; }
.file-cover-label.A:after,.file-cover.A:hover, .de-rpiStub.A:before, .de-rpiStub.A:after, .mepr-rating.A:before { background-color: #3B60AE; }
.file-cover-label.N:after,.file-cover.N:hover { background-color: #777; }

select#default_file_rating { background: none; border: none; color: inherit; -webkit-appearance: none; -moz-appearance: none; text-overflow: ""; } select#default_file_rating > option { background-color: #fefefe; }
option.rating-N:checked, option.rating-N:hover { box-shadow: 0 0 0 99px #777 inset; } option.rating-N { color: transparent; }
option.rating-C:checked, option.rating-C:hover, .PONY_rate-C { box-shadow: 0 0 0 99px #E65278 inset; }
option.rating-S:checked, option.rating-S:hover, .PONY_rate-S { box-shadow: 0 0 0 99px #8C60B1 inset; }
option.rating-A:checked, option.rating-A:hover, .PONY_rate-A { box-shadow: 0 0 0 99px #3B60AE inset; }

.dropdown-toggle.ins-act:before { content: " ▲ "; padding: 0 5px 15px; border-radius: 4px 4px 0 0; line-height: 1.6; }
.ins-act:before, .dropdown-menu { font-size: 14px; line-height: 1.8; color: #eee; position: absolute; z-index: 1000; border: 1px solid #222; box-shadow: 0 6px 12px rgba(0,0,0,.2); background-clip: padding-box; background-color: #222; border-radius: 4px; left: 0; }
.dropdown-menu { border-radius: 0 0 4px 4px; line-height: 1.8; min-width: 160px; display: none; margin: 0; } .ins-act > .dropdown-menu { display: list-item; }
.dropdown-menu li { padding-left: 10px; color: white; text-shadow: none; } .dropdown-menu li:hover { background: #555; -moz-user-select: none; transition: #6363CE .2s ease,color .2s ease; }

.gala-freestyle { position: fixed; z-index: 9999; } .gala-globalform-area .gala-freestyle { position: inherit; } .gala-globalform-area #gala-replytitle, .greenmk { display: none; }
.gala-globalform-area .greenmk { display: block; } .gala-globalform-area #gala-reply-form { background: transparent!important; box-shadow: none!important; border: none!important; }
.gala-globalform-close:before { content: "Убрать форму"; cursor: pointer; } .gala-globalform-open:before { content: "Раскрыть форму"; cursor: pointer; }
#galatext { resize: both; font-size: 14px; }
.text-line-ic, .text-line-ic > * { vertical-align: middle; } .text-line-ic > input[type="text"] { min-width: 240px; }
.text-line-ic > input[name="subject"] { margin-left: 8px; } #submit_this_form { margin-left: -10px; font-variant: small-caps; }
#submit_this_form:disabled:hover, #submit_this_form:disabled { color: inherit!important; background: transparent!important; left: 0; }
#gala-error-msg { text-align: center; color: white; }
#gala-replytitle > .filetitle { font-variant: small-caps; font-size: small; vertical-align: super; }
.pin-buttons { position: absolute; left: 0; } .inverted, .gala-freestyle .toggleform { transform: rotate(180deg); }
.ls-de-svg { margin: 0 2px -3px; cursor: pointer; width: 16px; height: 16px; }
.sagearrow { position: absolute; right: 1px; bottom: 3px; } .inactive, .file-remove { opacity: .4; }

.buttons-style-standart > .markup-button > *:not(input), .buttons-style-text > .markup-button >  *:not(a) { display: none; }
.markup-button > a{ font-size:13px; text-decoration: none; }
.buttons-style-text > .markup-button:not(.quote):after, .sep:after{ content:"\xA0|\xA0"; cursor: default; opacity: .3; }

.gmark-btn, .new-thr-chx{ cursor: pointer; } .gmark-btn, .sep { display: table-cell; }
.gmark-btn.bold:before{ content: "жирн"; } .bold { font-weight: bold; }
.gmark-btn.italic:before{ content: "курс"; } .italic { font-style: italic; }
.gmark-btn.underline:before{ content: "подч"; } .underline { text-decoration: underline; }
.gmark-btn.strike:before{ content: "зач"; } .strike { text-decoration: line-through; }
.gmark-btn.sup:after{ content: "верхн"; } .sup{ font-variant: super; } .gmark-btn.sup:before{ content:"∧"; font-variant: normal; }
.gmark-btn.sub:after{ content: "нижн"; } .sub{ font-variant: sub; } .gmark-btn.sub:before{ content:"∨"; font-variant: normal; }
.gmark-btn.spoiler:before{ content: "спой"; }
.gmark-btn.rcv:before{ content: "важн"; }
.gmark-btn.code:before{ content: "{код}"; font-family: monospace; }
.gmark-btn.dice:before{ content: "1d2 = ?"; font-variant: normal; }
.gmark-btn.rp:before{ content: "роле"; }
.gmark-btn.unkfunc0:before{ content: "> цит"; }

.reply .mediacontent, .reply .de-video-obj, .reply .imagecontent, .reply > .post-files > .file, .embedmedia { float: left; }
.mediacontent ~ blockquote, .de-video-obj ~ blockquote, .imagecontent ~ blockquote, .clearancent > blockquote { clear: both; }

span[de-bb]{ position: absolute; visibility: hidden; } input, textarea { outline: none; }
.mv-frame { position: absolute; background-color: rgba(0,0,0,.7); color: white; cursor: pointer; width: 40px; line-height: 40px; text-align: center; border-radius: 0 0 10px 0; opacity: .5;} .mv-frame:hover { opacity: 1; } .mv-frame.to-win:before { content: "[ ↑ ]"; } .mv-frame.to-post:before { content: "[ ↓ ]"; }
.de-src-derpibooru:before { content:""; padding-right: 16px; margin-right: 4px; background: url(/test/src/140903588031.png) center / contain no-repeat; }
.hidup{ top:-9999px!important; } .hidout, #gala-edit-form ~ * { display: none!important; }
.mediacontent > .video-container { display: inline-block; background-color: #212121; margin: 0 9px; margin-bottom: 5px;  max-height: 360px; max-width: 480px; }
.document-container{ overflow: auto; resize: both; background-color:#fefefe; }
.content-window{ position: fixed; left: 0; top: 0; z-index: 2999; }
#content-frame { position: absolute; top: 10%; left: 0; right: 0; bottom: 20%; z-index:3000; max-width: 100%; }
#content-frame > * { left: 0; right: 0; margin: auto; box-shadow: 5px 5px 10px rgba(0,0,0,.4); position: absolute; }
#content-frame > .gdoc-container { top: -9%; bottom: -19%; margin: auto 10%; background-color:#D1D1D1; }
#content-frame > .video-container { max-height: 100%; max-width: 100%; background-color: #212121; }
#shadow-box{ position: absolute; background-color: rgba(33,33,33,.8); z-index: 2999; }
#close-content-window, #show-content-window{ transition: .5s ease; opacity: .4; width: 29px; height: 29px; cursor: pointer; top: 20px; z-index: 3000; }
#close-content-window { right: 20px; position: absolute; background-image: url(/test/src/141665751261.png); }
#show-content-window  { right: 52%;  position: fixed;    background-image: url(/test/src/141667895174.png); border-radius: 100%; box-shadow: 0 1px 0 rgba(0,0,0,.4), -1px 1px 0 rgba(0,0,0,.4); }
#close-content-window:hover, #show-content-window:hover { opacity: .8; }
.ta-inact::-moz-selection{ background: rgba(99,99,99,.3); } .ta-inact::selection{ background: rgba(99,99,99,.3); }
.document-container > iframe, .document > iframe, .full-size, #shadow-box, .content-window{ width:100%; height:100%; }
.audio-container { display: block; }
.image-attach{ display: inline-block; border: medium none; cursor: pointer; margin: 2px 20px; } .image-attach:not(.expanded){ max-width: 290px; max-height: 290px; } .image-attach.expanded{ max-width: 100%px; max-height: auto; }
.cm-button{ text-decoration: none; background: transparent left / 16px no-repeat; } .cm-button:before{ content:""; margin-left: 20px;}
.cm-pastebin{ font: 12px monospace; padding: 2px 0; background-image: url(/test/src/140593041526.png); }
.cm-image{ background-image: url(/test/src/140896790568.png); } .cm-image:before{ content: "Expand: "; } .cm-image.attached:before{ content: "Unexpand: "; }
.cm-play{ background-image: url(/test/src/139981404639.png); } .cm-play:before{ content: "Play: "; }
.cm-stop{ background-image: url(/test/src/148214537312/7673443634.png); } .cm-stop:before{ content: "Stop: "; }
@keyframes init{ 50% {opacity:0} } @-webkit-keyframes init{ 50% {opacity:0} }`;
	
	return _Constructor;
})();
