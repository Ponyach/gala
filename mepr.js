//@import PonyabaParser

const Mepr = (m_count => {
	
	const _VERSION_ = '2.0';
	
	const self = (
		localStorage.getItem('mepr-settings')
	) ? JSON.parse(
		localStorage.getItem('mepr-settings')
	) : {
		localeTime : false,
		thumb      : true,
		position   : 0
	};
	
	function genFilesHtml(files, ratings, id) {
		
		var HTML_FILE_INFO = '', FILE_HTML = '';
		
		for (var i = 0, k = 1; i < files.length; i++, k++) {
			
			if (!files[i])
				continue;
			
			let file = files[i], _R = ratings[i];
			
			let FILE_SIZE, FILE_NAME = file.name, P_TAG, IMG_WH = '???',
			    FILE_TYPE, FILE_URL, FILE_ID;
			
			if (file.thumb) {
				[FILE_TYPE, IMG_WH, FILE_SIZE] = file.info.split(', ');
				FILE_URL  = file.thumb;
				FILE_ID   = file.thumb.replace(/^.+\/(\d+)s.+$/, '$1');
				FILE_TYPE = FILE_TYPE.toLowerCase();
				P_TAG = /jpg|gif|png/i.test(FILE_TYPE) ? 'img ' : 'video ';
			} else {
				let [mime, type, attr = 'natural'] = file.type.split('/');
				FILE_URL  = (window.URL || window.webkitURL).createObjectURL(file);
				FILE_ID   = Date.now() + Math.floor(Math.random() * 100);
				FILE_SIZE = prettySize(file.size);
				FILE_TYPE = type.replace('jpeg', 'jpg').replace('mpeg', 'mp3');
				P_TAG = (mime == 'image' ? 'img onload' : (attr = 'video') +' onloadedmetadata') +`="this.parentNode.parentNode.parentNode.parentNode.children['fs_${ id }rp3m_${ k }'].children['iwh${ id }-${ k }'].textContent = this.${ attr }Width +'x'+ this.${ attr }Height; this.removeAttribute('on'+ event.type);"`;
			}
			
			HTML_FILE_INFO += `
				<span id="fs_${ id }rp3m_${ k }" class="filesize fs_${ id }rp3m fake_filesize" style="display: ${ !i ? 'inline' : 'none' };">
					Файл ${ _R !== 'N' ? '[R: ['+ _R +']]' : ''}
					<svg class="de-btn-src" style="margin: 0 2px -3px 0; cursor: pointer; width: 16px; height: 16px;"><use xlink:href="#de-symbol-post-src"></use></svg>
					<a href="javascript:void(0)"></a>
					<a href="javascript:void(0)">${ FILE_ID +'.'+ FILE_TYPE }</a>
					- (${ FILE_SIZE },
						<span id="iwh${ id }-${ k }">${ IMG_WH }</span>,
						<span class="mobile_filename_hide">${ FILE_NAME }</span>)
				</span>`;
			
			FILE_HTML += `
				<div id="file_${ id }rp3m_${ k }" class="file" style="display: inline;" onmouseover="showFileSize('${ id }rp3m',${ k })">
					<a href="javascript:void(0)">
						<span id="thumb${ FILE_ID }" class="mepr-rating ${ _R }">
							<${ P_TAG } id="thumbnail_${ FILE_ID }" class="thumb mepr-thumb ${ FILE_TYPE }-file" alt="${ id }rp3m_${ k }" src="${ FILE_URL }"/>
						</span>
					</a>
				</div>`;
		}
		return (!FILE_HTML ? '' :
			HTML_FILE_INFO +'<br>'+ FILE_HTML
		);
	}
	
	const COLOR_BASE = {};
	
	function genColorCode(name, min_brightness = 100, spec = 2) {
		
		if (name in COLOR_BASE) {
			return COLOR_BASE[ name ];
		}
		
		const hash   = Crypt.MD5(name);  //Gen hash of text
		const colors = new Array(3);
		
		for (var i = 0, sum = 0; i < 3; i++) {
			sum += colors[i] = Math.max(
				Math.round(( parseInt ('0x'+ hash.substr(spec * i, spec)) / parseInt ('0x'+ 'F'.repeat(spec)) ) * 255), min_brightness
			); //convert hash into 3 decimal values between 0 and 255
		}
		
		if (min_brightness > 0) { //only check brightness requirements if min_brightness is about 100
			while ( sum / 3 < min_brightness ) { //loop until brightness is above or equal to min_brightness
				for (let i = 0; i < 3; i++)
					colors[i] += 10;	//increase each color by 10
				sum += 30;
			}
		}
		return ( COLOR_BASE[ name ] = 'rgb('+ colors.join(',') +')' );
	}
	
	const TRIP_BASE = {},
	     SALT_TABLE = ''+
	 '.............................................../0123456789ABCDEF' +
	 'GABCDEFGHIJKLMNOPQRSTUVWXYZabcdefabcdefghijklmnopqrstuvwxyz.....' +
	 '................................................................' +
	 '................................................................';
	
	function genTripCode(trip, encoding) {
		
		if (trip in TRIP_BASE) {
			return TRIP_BASE[ trip ];
		}
		
		for (var i = 1, salt = ''; i < 3; i++) {
			salt += SALT_TABLE[ trip.charCodeAt(i) % 256 ];
		}
		return ( TRIP_BASE[ trip ] = Crypt.DES(salt, trip)[0].substring(3) );
	}

	function prettySize(byte, pred) {
		for (var level = 0; byte > 1024; level++) {
			byte = Math.round(byte / 10.24) / 100;
		}
		return byte + (pred ? ' '+
			['', 'кило', 'мега', 'гига', 'тера', 'пета'][level] +'байт'+ byte.postfix('', 'а', '') :
			['B', 'KB', 'MB', 'GB', 'TB', 'PB'][level]
		);
	}

	function proportional(s, m) {
		var k = Math.min(m / Math.max(s.width, s.height), 1);
		return {
			width: 0 | s.width * k,
			height: 0 | s.height * k
		}
	}
	
	return class {
		set em(em) {
			let _node = this.viewBox.querySelector('.postername');
			if (_node) {
				if (!em) {
					_node.textContent = (_node.firstElementChild || _node).textContent;
				} else {
					if (_node.firstElementChild) {
						_node.firstElementChild.href = 'mailto:'+ em
					} else {
						_node.innerHTML = `<a href="mailto:${ em }">${ _node.textContent }</a>`
					}
				}
			}
		}
		set name(poster_name) {
			let _node = this.viewBox.querySelector('.postername');
			if (_node) {
				let [, name, trip = ''] = poster_name.trim().match(/^([^!#]*)(?:!|#)?(.+)?$/);
				if (!name) name = trip ? '' : this.default_name;
				if ( trip) trip = '!'+ genTripCode(trip, 'H.q');
				(_node.firstElementChild ? _node.firstElementChild : _node).textContent = name;
				this.viewBox.querySelector('.coma-colormark').setAttribute('style', 'background: '+ genColorCode(name + trip) +'!important;');
				this.viewBox.querySelector('.postertrip').textContent = trip;
			}
		}
		set subject(ttl) {
			let _node = this.viewBox.querySelector('.filetitle');
				_node && (_node.textContent = ttl);
		}
		set message(txt) {
			let _node = this.viewBox.querySelector('.post-body > blockquote');
				_node && (_node.innerHTML = !txt.trim() ? '' : this.boardEngine.parsePost(txt));
		}
		
		updateThumbs(ratings, files) {
			const _node = this.viewBox.querySelector('.post-files');
			const O     = this.getId();
			if (files) {
				_node.nextElementSibling.classList[ files.length > 1 ? 'add' : 'remove' ]('clearancent');
				_node.innerHTML = genFilesHtml(files, ratings, O);
			}
			else {
				let i = 0, R = ratings[i++];
				while (`fs_${O}rp3m_${i}` in _node.children) {
					_node.children[  `fs_${O}rp3m_${i}`].childNodes[0].textContent = 'Файл '+ (R != 'N' ? `[R: ${R}]` : '');
					_node.children[`file_${O}rp3m_${i}`].firstElementChild.firstElementChild.className = `mepr-rating ${R}`;
					R = ratings[i++];
				}
			}
		}
		
		getId() {
			const c = m_count++;
			return (this.getId = () => c)();
		}
		
		handleEvent(e) {
			const treangle = e.target, $this = this;
			const over = (o) => { o.preventDefault() };
			const drop = (d) => { d.preventDefault();
				if (d.target !== document.body && d.target.parentNode) {
					d.target[ 'form' in d.target ? 'form' : 'parentNode' ].appendChild( $this.viewBox ).style.position = 'static';
					treangle.draggable = false;
					treangle.onclick   = () => {
						document.body.appendChild( $this.viewBox ).style.position = 'fixed';
						treangle.draggable = true;
						treangle.onclick   = null;
					}
				}
				window.removeEventListener('dragover', over);
				document.documentElement.removeEventListener('drop', drop);
			}
			window.addEventListener('dragover', over);
			document.documentElement.addEventListener('drop', drop);
		}
		
		constructor(_data) {
			
			var _viewBox = document.createElement('div');
				_viewBox.addEventListener('mousedown', vboxMovieHandler);
				_viewBox.className = 'mepr-view reply';
				_viewBox.style = 'position: fixed; min-width: 360px; top: 1em; left: 1em; font-size: 90%; z-index: 9999; display: table;';
			
				this.getId();
				this.viewBox = _viewBox;
				this.boardEngine = new PonyabaParser;
				
			function vboxMovieHandler(e) {
				
				if (e.target.classList[0] === 'dast-hide-tr' || this.style['position'] === 'static')
					return;
				
				let coords = this.getBoundingClientRect();
				let shiftX = e.pageX - (coords.left + pageXOffset);
				let shiftY = e.pageY - (coords.top + pageYOffset);
				let dragVB = (o) => {
					_viewBox.style['left'] = (o.clientX - shiftX) +'px';
					_viewBox.style['top']  = (o.clientY - shiftY) +'px';
				}
				
				window.addEventListener('mousemove', dragVB);
				window.addEventListener('mouseup', function() {
					this.removeEventListener('mousemove', dragVB);
					this.removeEventListener('mouseup', arguments.callee);
					_viewBox.style['cursor'] = 'default';
				});
				
				this.style['cursor'] = 'move';
				e.preventDefault();
			}
		}
		
		render(data) {
			
			let _ID_   = this.getId();
			let _SUBJ_ = data.subject.trim();
			let _NAME_ = data.name || '';
			let _TRIP_ = '';
			let _TEXT_ = data.raw_post ? this.boardEngine.parsePost(data.raw_post) : '';
			let _FILES_ = data.files || '';
			let _COLOR_ = 'transparent';
			
			if (_NAME_) {
				let tripCodeAt = _NAME_.indexOf('!');
				
				if (tripCodeAt != -1 || (tripCodeAt = _NAME_.indexOf('#')) != -1) {
					_TRIP_ = '!'+ genTripCode(_NAME_.substr(tripCodeAt + 1), 'H.q');
					_NAME_ = _NAME_.substr(0, tripCodeAt);
				}
				
				_COLOR_ = genColorCode( _NAME_ + _TRIP_ );
				
				if (data.mailto) {
					_NAME_ = `<a href="mailto:${ data.mailto }">${ _NAME_ }</a>`;
				}
			}
			
			let _TIME_ = new Date;
			let format = {
				weekday: 'long',
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric'
			}
			
			if (self.localeTime) {
				_TIME_.setHours(_TIME_.getUTCHours() + 3);
				format.timezone = 'Europe/Moscow';
			}
			
			_TIME_ = _TIME_.toLocaleString('ru', format)
				.replace(/\sг|[.,]/g, '')
				.replace('поне', 'Пони')
				.replace('сент', 'Снт')
				.replace(/(^|\s)[а-я]/g, (l) => l.toUpperCase());
			
			let length  = _FILES_.length;
			
			if (_FILES_ && length) {
				_FILES_ = genFilesHtml(_FILES_, data.ratings, _ID_);
			}
			
			let HTML_POST = `
				<a name="${ _ID_ }rp3m"></a>
				<label>
					<span class="coma-colormark" style="background: ${ _COLOR_ }!important;"></span>
					<a class="dast-hide-tr" style="text-decoration: none;" href="javascript:void(0)" draggable="true">▲</a>
				</label>
				<span class="filetitle">${ _SUBJ_ }</span>
				<span class="postername">${ _NAME_ }</span><span class="postertrip">${ _TRIP_ }</span>
				<span class="mobile_date dast-date">${ _TIME_ }</span>
				<span class="reflink">
					<a href="javascript:void(0)">No.&nbsp;</a>
					<a href="javascript:void(0)">${ _ID_ }ЯP3M</a>
				</span>
				<span class="de-post-counter"></span>
				<br>
				<div class="post-files" style="display: inline;">
					${ _FILES_ }
				</div>
				<div class="post-body${ length > 1 ? ' clearancent': '' }" style="display: inline;"> 
					<blockquote>${ _TEXT_ }</blockquote>
				</div>`;
				
			this.viewBox.innerHTML = HTML_POST;
			this.viewBox.style.position = 'fixed';
			this.viewBox.querySelector('.dast-hide-tr').addEventListener('dragstart', this);
		}
		
		static getParam(key) {
			return self[ key ];
		}
		static setParam(key, value) {
			if (key in self) {
				self[ key ] = value;
				localStorage.setItem('mepr-settings', JSON.stringify(self));
			}
		}
		
		static get style() {
			return `
				.mepr-thumb {
					max-width: 150px;
					max-height: 150px;
				}
				.mepr-rating {
					position: relative;
					display: inline-block;
				}
				.mepr-rating:before {
					content: "";
					position: absolute;
					opacity: .7;
					left: 15px;
					right: 15px;
					top: 0;
					bottom: 0;
				}
				.mepr-rating:after {
					font: 2em bold Arial!important;
					color: white;
					position: absolute;
					left: 25px;
					top: 10px;
				}`;
		}
		static get params() {
			return Object.assign({}, self);
		}
		static get version() {
			return _VERSION_;
		}
	}
})(0);
