/* 
	«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 2.6
	© magicode
	
*/

/* ---{ Remove Depricated Storage Keys }--- */
['VWidth', 'VHeight', 'EmbedIn', 'EmbedLinks', 'bold', 'italic', 'underline', 'strike', 'spoiler', 'code', 'roleplay', 'sup', 'sub', 'attent', 'dice', 'quote'].forEach(function(key) {
      localStorage.removeItem(key);
}); sessionStorage.removeItem('LinksCache');
// add Settings
function addGalaSettings() {
	return '<label class="menu-checkboxes"><input onchange="localStorage.setItem(&quot;KeyMarks&quot;, this.checked)" '+ (!localStorage.getItem('KeyMarks') ? '' : 'checked') +' type="checkbox" name="set_km" value=""><span title="Вкл/Выкл Gala KeyMarks &middot; % ^ * ( &quot; @ &#92; ! # &gt;">Автодополнение разметки</span></label><label class="menu-checkboxes"><input onchange="localStorage[(this.checked ? &quot;set&quot; : &quot;remove&quot;) + &quot;Item&quot;](&quot;GalaForm&quot;, JSON.stringify({place: 0}))" '+ (!localStorage.getItem('GalaForm') ? '' : 'checked') +' type="checkbox" name="set_gf" value=""><span title="Если вас (как и меня) чем то не устраивает кукловая">Альтернативная форма ответа</span></label>';
} /* ===> end <=== */

/* SpelzZ - a lightweight Node Work Tool */
!(function(){
	var _z = {
		each : $each,
		setup: $setup,
		route: $route,
		fall : fallback,
		simulate: $simulateMouseEvent,
		documentListener: {
			add: function(type, fn) { $attachPrefixedEvent('add', type, fn) },
			rm: function(type, fn) { $attachPrefixedEvent('remove', type, fn) }
		},
		sessionS: $storeItem('session'), localS: $storeItem('local'),
		append: function(el, nodes) { $nodeUtil('append', el, nodes) },
		prepend: function(el, nodes) { $nodeUtil('prepend', el, nodes) },
		after: function(el, nodes) { $nodeUtil('after', el, nodes) },
		before: function(el, nodes) { $nodeUtil('before', el, nodes) },
		replace: function(el, nodes) {
			if (el) {
				el = typeof el === 'string' ? document.querySelectorAll(el) : !Array.isArray(el) ? [el] : el;
				nodes = !Array.isArray(nodes) ? [nodes] : nodes;
				for (var i = 0; i < el.length; i++) {
					el[i].parentNode.replaceChild((nodes[i] || nodes[i - 1].cloneNode(true)), el[i]);
				}
			}
		},
		remove: function(el) {
			$each(el, function(child) {
				child.parentNode.removeChild(child);
			});
		}
	}
	function $each(arr, Fn) {
		if (typeof arr === 'string') {
			arr = document.querySelectorAll(arr);
		}
		Array.prototype.slice.call(arr, 0).forEach(function(el, i) {
			Fn(el, i);
		});
	}
	function $setup(el, _Attrs, _Events) {
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
					             &&  el[key]      === _Attrs[key] || el.setAttribute(key, _Attrs[key]);
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
	function $nodeUtil(p, el, nodes) {
		if (el) {
			var i, node, meth = p.toLowerCase(), Child, Parent;
				el = typeof el === 'string' ? document.querySelector(el) : el;
				nodes = !Array.isArray(nodes) ? [nodes] : nodes;
				Parent = el.parentNode;
			switch (meth) {
				case 'append':
					for (i = 0; node = nodes[i++];) {
						el.appendChild(node);
					}
					break;
				case 'replace':
					Parent.replaceChild(nodes[0], el);
					break;
				default:
					switch (meth) {
						case 'after': Child = el.nextSibling;
							break;
						case 'before': Child = el;
							break;
						case 'prepend': Child = el.childNodes[0], Parent = el;
					}
					for (i = 0; node = nodes[i++];) {
						Parent.insertBefore(node, Child);
					}
			}
		}
	}
	function $route(el, Fn) {
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
			if ((el = el.parentNode) === document.firstElementChild) {
				return;
			}
		}
	}
	function $storeItem(locate) {
		var Store = window[locate +'Storage'],
			probeStore = function(name, val) {
				try {
					Store.setItem(name, val);
				} catch(e) {
					Store.removeItem(name);
					Store.setItem(name, val);
				}
			}
		return {
			rm: function(names) {
					if (typeof names === 'string')
						names = [names];
					for (var name, i = 0; name = names[i++];) {
						Store.removeItem(name); 
					}
				},
			set: function(name, value) {
					if (typeof name === 'object') {
						for (var key in name) {
							probeStore(key, (name[key] === null ? value : name[key]));
						}
					} else {
						probeStore(name, value);
					}
				},
			get: function(name, def) {
					if (name in Store) {
						def = Store.getItem(name);
					} else {
						probeStore(name, def);
					}
					return (def == 'false' ? false : def == 'true' ? true : def);
				}
		}
	}
	function fallback(e) {
		if (e.preventDefault)
			e.preventDefault();
		else
			e.returnValue = false;
	}
	
	// apply prefixed event handlers
	function $attachPrefixedEvent(pt, eventType, callback) {
		document[pt +'EventListener'](eventType.toLowerCase(), callback, false);
		document[pt +'EventListener'](('webkit'+ eventType), callback, false);
		document[pt +'EventListener'](('moz'   + eventType), callback, false);
		document[pt +'EventListener'](('MS'    + eventType), callback, false);
		document[pt +'EventListener'](('o'     + eventType), callback, false);
	}
	
	// simulate mouse button events
	function $simulateMouseEvent(eventType, node) {
		var clickEvent = document.createEvent('MouseEvents');
		clickEvent.initEvent(eventType, true, true);
		node.dispatchEvent(clickEvent);
	}
	
	window._z = _z;
})(); /* ===> end <=== */

/* ---{ Soundcloud Player Engine (Custom build) }--- */
(function() {
	
	var SC = {
		'APIKey': 'htuiRd1JP11Ww0X72T1C3g',
		'Volume': 1.0,
		'Tracks': {},
		'Object': {}
	}
	
	var _Current_ = {
		
		TrackLoaded: null,
		SelectTrack: null,
		PlayerNode : null,
		AudioDevice: createAudioDevice(),
		/* Complex */
		set 'Player Volume'  (vol) {
			this.AudioDevice.volume = vol;
			this.PlayerNode['_volume_'].firstElementChild.style['width'] = (vol * 100) +'%';
		},
		get 'Player Volume'  () {
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
			this.PlayerNode['_progress_'].style['width'] = (sec / this.AudioDevice.duration * 100) +'%';
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
					this.PlayerNode[ '_volume_' ].onmousedown = null;
					this.PlayerNode['_waveform_'].onmousedown = null;
				}
				this.PlayerNode = ('_trackslist_' in player_node ? player_node : catchKeyElements('player', player_node));
				this.PlayerNode[ '_volume_' ].onmousedown = barChanger;
				this.PlayerNode['_waveform_'].onmousedown = barChanger;
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
				this['AudioDevice'].loadTrack(this.TrackLoaded);
			}
		}
	}
	
	window.SCPurePlayer = {
		P: _Current_,
		create: _scCreate,
		createGroup: _scCreateGroup
	}
	
	function $getTracks(url, callback, errorback) {
		if (!url || typeof callback !== 'function') {
			return;
		}
		var protocol = (document.location.protocol === 'https:' ? 'https:' : 'http:'),
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
				var _$     = this,
					tNode  = createTrackDOM(tracks[0], _$.hash),
					tChild = _$.node['_trackslist_'].children['ft_'+ _$.hash +'_'+ _$.it];
				
				_$.node['_trackslist_'].replaceChild(tNode, tChild); ibx--;
				
				if (_$.it == 0 || !this.node['_trackslist_'].querySelector('.active') && ibx == 0) {
					updateTrackInfo(_$.node, tracks[0]);
					tNode.className += ' active';
				}
				
				for (var n = 1; n < tracks.length; n++) {
					tChild = tNode.nextSibling;
					tNode  = createTrackDOM(tracks[n], _$.hash);
					_$.node['_trackslist_'].insertBefore(tNode, tChild);
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
		if (e.button !== 0) {
			return;
		}
		_z.fall(e);
		switch ( e.type ) {
			case 'mousedown':
				this.bound = barChanger.bind(this);
				window.addEventListener('mousemove', this.bound, false);
				window.addEventListener('mouseup', this.bound, false);
				this.rect = this.getBoundingClientRect();
				this.rect.width || (this.rect.width = this.rect.right - this.rect.left);
			case 'mousemove':
				var x = (e.clientX - this.rect.left) / this.rect.width * 100;
				if (this === _Current_.PlayerNode['_waveform_']) {
					var maxs = _Current_['AudioDevice'].duration,
						seek = x > 100 ? maxs : x < 0 ? 0 : Math.floor(maxs * x * 10000) / 1000000;
					_Current_['AudioDevice'].ontimeupdate = null;
					_Current_['Track Progress'] = (this.seek = seek);
				}
				if (this === _Current_.PlayerNode['_volume_']) {
					var vol = x > 100 ? 1 : x < 0 ? 0 : Math.round(x / 10) / 10;
					_Current_['Player Volume'] = (SC.Volume = vol);
				}
				break;
			case 'mouseup':
				if (this === _Current_.PlayerNode['_waveform_']) {
					_Current_['AudioDevice'].currentTime  = this.seek;
					_Current_['AudioDevice'].ontimeupdate = onTimeUpdate;
				}
				window.removeEventListener('mousemove', this.bound, false);
				window.removeEventListener('mouseup', this.bound, false);
		}
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
			audio.height = '1';
			audio.width  = '1';
			audio.type   = "application/x-shockwave-flash"
			audio.data   = "/lib/javascript/player_mp3_js.swf"
			audio.innerHTML = '<param name="movie" value="/lib/javascript/player_mp3_js.swf" /><param name="AllowScriptAccess" value="always" /><param name="FlashVars" value="listener=flashBack2343191116fr_scEngine&interval=500" />';
			
			flash = (window['flashBack2343191116fr_scEngine'] = new Object());
			flash.onInit = function() {
				Object.defineProperties(audio, {
					loadTrack   : { value: function(trk) {
						this.SetVariable("method:setUrl",
							trk.stream_url + (trk.stream_url.indexOf('?') >= 0 ? '&' : '?') +'consumer_key='+ SC.APIKey);
						this.play(); }},
					play        : { value: function()    {
						flash.status = 'process';
						this.SetVariable("method:play", "");
						this.SetVariable("enabled", "true");
						onPlayerAction({type: 'play'}); }},
					pause       : { value: function()    {
						flash.status = 'waiting';
						this.SetVariable("method:pause", "");
						onPlayerAction({type: 'pause'}); }},
					stop        : { value: function()  { this.SetVariable("method:stop", "") }},
					ended       : { get: function()    { return flash.status === 'ended' }},
					playing     : { get: function()    { return JSON.parse(flash.isPlaying); }},
					duration    : { get: function()    { return Number(flash.duration) / 1000 || 0 }},
					currentTime : { get: function()    { return Number(flash.position) / 1000 || 0 },
								    set: function(rel) { this.SetVariable("method:setPosition", (rel * 1000)) }},
					volume      : { get: function()    { return Number(flash.volume) / 100 },
								    set: function(vol) { this.SetVariable("method:setVolume", (vol * 100)) }},
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
				stop      : { value: function()    { this.pause(); this.currentTime = 0; }},
				bytesPercent: { get: function()    { return ((this.buffered.length && this.buffered.end(0)) / this.duration) * 100; }},
				loadTrack : { value: function(trk) {
					this.pause();
					this.src = trk.stream_url + (trk.stream_url.indexOf('?') >= 0 ? '&' : '?') +'consumer_key='+ SC.APIKey;
					this.play();
				}}
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
				'<div class="sc-info"><h3></h3><h4></h4><p></p>\n'+
				'	<a href="#x" class="sc-info-close">X</a>\n'+
				'</div>\n'+
				'<div class="sc-controls">\n'+
				'	<a href="#control" class="sc-play">Play</a>\n'+
				'</div>\n'+
				'<ol class="sc-trackslist">'+ _li(hash, len) +'</ol>\n'+
				'<a href="#info" class="sc-info-toggle">Info</a>\n'+
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
		if (artwork && artwork.indexOf('avatars-000044695144-c5ssgx-large.jpg') < 0){
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
		// update the track duration in the progress bar
		node['_duration_'].textContent = timeCalc(track.duration);
		node['_position_'].textContent = '0.00';
		// put the waveform into the progress bar
		var wave = node['_waveform_'].firstElementChild || document.createElement('img');
			wave.src = track.waveform_url;
		node['_waveform_'].appendChild(wave);
	}
	
	function findBestMatch(list, toMatch) {
		for (var item, i = 0; i < list.length; i++) {
			if ((item = list[i]) >= toMatch) {
				break;
			}
		}
		return item;
	}
	function timeCalc(secn) {
		var s, m, h;
			s = Math.floor(secn) % 60;
			m = Math.floor(secn / 60) % 60;
			h = Math.floor(secn / (60 * 60));
			
		return (h > 0 ? h +'.' : '') + (m > 9 || m == 0 ? m : '0'+ m) +'.'+ (s > 9 ? s : '0'+ s);
	}
	function genGroupId() {
		var n = Math.round(Math.random() * 12345679);
		while (n in SC['Object']) n++;
		return (SC['Object'][n] = n);
	}
})(); /* ===> end <=== */

/* ---{ Universal Functions (dependencies) }--- */
function getDataResponse(uri, Fn) {
	var xhReq = new XMLHttpRequest();
	xhReq.open('GET', uri, true);
	xhReq.onreadystatechange = function() {
		if (this.readyState !== 4)
			return;
		if (this.status === 200) {
			try {
				var json = JSON.parse(this.responseText);
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
	if (typeof CDDRequest === 'object' && !(new RegExp('^'+ document.location.protocol +'//'+ document.location.hostname).test(Source))) {
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
if (!String.prototype.includes) {
	String.prototype.includes = function() {
		'use strict';
		return String.prototype.indexOf.apply(this, arguments) >= 0;
	};
}
if (!Array.prototype.includes) {
	Array.prototype.includes = function(searchElement /*, fromIndex*/) {
		'use strict';
		if (this == null) {
			throw new TypeError('Array.prototype.includes called on null or undefined');
		}
		
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
} /* ===> end <=== */

try {
	
var gala_inline_style = document.createElement("style");
	gala_inline_style.textContent = 'blockquote:after, .de-src-iqdb:after, #de-txt-panel:after { content:""; -webkit-animation: init 1s linear 2; animation: init 1s linear 2; }\
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
.file-cover { padding: 0 10px; cursor: default; } .S:after { content: "[S]"; } .C:after { content: "[C]"; } .A:after { content: "[A]"; } .file-cover.N { padding-top: 13px; }\
.file-cover:hover { color: #fff!important; } .file-cover-label.S:after,.file-cover.S:hover { background-color: #8C60B1; } .file-cover-label.C:after,.file-cover.C:hover { background-color: #E65278; } .file-cover-label.A:after,.file-cover.A:hover { background-color: #3B60AE; } .file-cover-label.N:after,.file-cover.N:hover { background-color: #777; }\
\
select#default_img_ratings { background: none; border: none; color: inherit; -webkit-appearance: none; -moz-appearance: none; text-overflow: ""; } select#default_img_ratings > option { background-color: #fefefe; }\
option.rating-N:checked, option.rating-N:hover { box-shadow: 0 0 0 99px #777 inset; } option.rating-N { color: transparent; }\
option.rating-C:checked, option.rating-C:hover { box-shadow: 0 0 0 99px #E65278 inset;}\
option.rating-S:checked, option.rating-S:hover { box-shadow: 0 0 0 99px #8C60B1 inset;}\
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
.text-line-ic, .text-line-ic > * { vertical-align: middle; } .text-line-ic > input[type="text"] { min-width: 300px; }\
.text-line-ic > input[name="subject"] { margin-left: 8px; } #submit_this_form { position: relative; left: -10px; font-variant: small-caps; }\
#submit_this_form:disabled:hover, #submit_this_form:disabled { color: inherit!important; background: transparent!important; left: 0; }\
#gala-error-msg { text-align: center; color: white; background-color: #E04000; }\
#gala-replytitle > .filetitle { font-variant: small-caps; font-size: small; vertical-align: super; }\
.pin-buttons { position: absolute; left: 0; } .inverted, .gala-freestyle .toggleform { transform: rotate(180deg); }\
.ls-de-svg { margin: 0 2px -3px; cursor: pointer; width: 16px; height: 16px; }\
.sagearrow { position: absolute; right: 1px; bottom: 3px; } .inactive, .file-remove { opacity: .4; }\
\
.buttons-style-standart > .markup-button > *:not(input), .buttons-style-text > .markup-button >  *:not(a) { display: none; }\
.markup-button > a{ font-size:13px; text-decoration: none; }\
.buttons-style-text > .markup-button:not(.quote):after, .sep:after{ content:"\xA0|\xA0"; cursor: default; }\
\
.gmark-btn, .new-thr-chx{ cursor: pointer; } .gmark-btn, .sep { display: table-cell; }\
.gmark-btn.bold:before{ content: "жирный"; } .bold { font-weight: bold; }\
.gmark-btn.italic:before{ content: "курсив"; } .italic { font-style: italic; }\
.gmark-btn.underline:before{ content: "подчерк"; } .underline { text-decoration: underline; }\
.gmark-btn.strike:before{ content: "зачерк"; } .strike { text-decoration: line-through; }\
.gmark-btn.sup:after{ content: "вверху"; } .sup{ font-variant: super; } .gmark-btn.sup:before{ content:"∧"; font-variant: normal; }\
.gmark-btn.sub:after{ content: "внизу"; } .sub{ font-variant: sub; } .gmark-btn.sub:before{ content:"∨"; font-variant: normal; }\
.gmark-btn.spoiler:before{ content: "спойлер"; }\
.gmark-btn.rcv:before{ content: "важный"; }\
.gmark-btn.code:before{ content: "{код}"; }\
.gmark-btn.dice:before{ content: "1d2 = ?"; font-variant: normal; }\
.gmark-btn.rp:before{ content: "ролеплей"; }\
.gmark-btn.unkfunc0:before{ content: "> цитата"; }\
\
.reply .mediacontent, .reply .de-video-obj, .reply .imagecontent, .reply > .post-files > .file { float: left; }\
.mediacontent ~ blockquote, .de-video-obj ~ blockquote, .imagecontent ~ blockquote { clear: both; }\
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
@keyframes init{ 50% {opacity:0} } @-webkit-keyframes init{ 50% {opacity:0} }';
document.head.appendChild(gala_inline_style);
	
	Gala(); //start
	
} catch(log) {
	console.error(log);
}

/* ---{ Gala ponyach.ru Extension }--- */
function Gala() {
	var _GalaForm = localStorage.getItem('GalaForm'),
		_SC = window.SCPurePlayer,
		_Select = window.getSelection(),
		_EmbedField_ = localStorage.getItem('EmbedField') || 0,
		_MarkupButtons, _Container, _EditForm, globalform_area;
	_Container = {
		zIndex: 1,
		Audio: _z.setup('audio', {'class': 'audio-container', 'controls': true}),
		Video: _z.setup('video', {'class': 'video-container', 'controls': true}),
		OVERLAY: _z.setup('div', {'class': 'content-window hidup', 'html': '<div id="shadow-box"></div><label id="close-content-window"></label><div id="content-frame"></div>'}, {
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
				_z.append(document.body, [this['OVERLAY'], this['Marker']]);
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
	//--> Derpibooroo Reverse Search
	var _DerpForm;
	function DerpSearch(btn) {
		var imgSrc = decodeURIComponent(btn.previousElementSibling.href.split('=')[1]);
		if (!_DerpForm) {
			_DerpForm = _z.setup('form', {'method': "post", 'accept-charset': "UTF-8", 'action': "https://www.derpibooru.org/search/reverse", 'target': "_blank", 'enctype': "multipart/form-data", 'hidden': '',
				'html': '<input id="scraper_url" name="scraper_url" type="url" value="'+ imgSrc +'"><input name="fuzziness" id="fuzziness" value="0.25" min="0" max="1" step="0.01" class="input" type="number">'});
		} else
			_DerpForm.firstElementChild.value = imgSrc;
		document.body.appendChild(_DerpForm).submit();
		_DerpForm.remove();
	} //<---*
	
	function jumpCont(node, name, cont) {
		do {
			if (node.tagName === 'BLOCKQUOTE') {
				if (!(cont = node.parentNode.querySelector('.'+ name))) {
					cont = _z.setup('span', {'class': name});
					switch (name) {
						case 'mediacontent':
							_z.before(node, cont);
							break;
						case 'imagecontent':
							_z.prepend(node.parentNode, cont);
					}
				}
				return cont;
			}
		} while (
			(node = node.parentNode)
		);
	}

	//-- Replace special characters from text
	function escapeHtml(text) {
		return text.replace(/\"/g, "&#34;").replace(/\'/g, "&#39;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
	}
	//-- Remove Zero whitespaces and invalid characters (like ") from Url Links
	function escapeUrl(url) {
		var eUrl = encodeURI(url)
			.replace(new RegExp('%2?5?E2%2?5?80%2?5?8B', 'g'), '')
			.replace(new RegExp('%2?5?3C/?\\w*%2?5?3E', 'g'), '')
			.replace(new RegExp('%2?5?22', 'g'), '');
		return decodeURI(eUrl);
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
	function hashCodeURL(uri) {
		var hash = 0, i = 0, chr, len,
			str = uri.replace(/^https?:\/\//, '');
		for(len   = str.length; i < len; i++) {
			chr   = str.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}
	function isInsideATag(str, sp, ep) {
		return (str.split(sp).length - 1) > (str.split(ep).length - 1);
	}
	
	function galamarK(tgOpen, tgClose, tgClass) {
		
		var val    = this.value;
		var end    = this.selectionEnd;
		var start  = this.selectionStart;
		var select = this.value.substring(this.selectionStart, this.selectionEnd);
		
		var offsetS = 0, offsetE, pins, wins, markedText;
		
		switch (tgClass) {
			case 'ql':
				var winSelect = _Select.toString();
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
						(start === end ? _Select.toString() : select)
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
		if (this.safeValue)
			this.safeValue();
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
			if ($this && localStorage['KeyMarks']) {
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
					(_inTA ? select : _Select.toString()).length > 0) {
						key === '@' ? $this.textMark('• ', '\n• ', 'ql') :
						              $this.textMark(key +' ', '\n'+ key +' ', 'ql');
				} else
					exit = false;
				if (exit)
					return _z.fall(e);
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
		if (a.host === 'pastebin.com' && (m_id = /\/([\w_-]+)/.exec(a.pathname))) {
			_z.setup(a, {'class': 'cm-button cm-pastebin', 'id': 'PBlnk_'+ m_id[1], 'text': 'PASTEBIN: '+ m_id[1], 'rel': 'nofollow' });
		} else
		if (IF.includes((f_ext = a.href.split('.').pop()))) {
			var _fn = function(e) {
				var hash = hashCodeURL(a.href),
					name = getFileName(a.href);
				e.target.onerror = IF.freeImg = e.target.onload =  null;
				_z.setup(a, {'class': 'cm-button cm-image', 'id': 'IMGlnk_'+ hash, 'rel': 'nofollow', 'text': name,
					'title': f_ext.toUpperCase() +', '+ e.target.naturalWidth +'x'+ e.target.naturalHeight });
				a.wImage = _z.setup(e.target, {'class': 'image-attach', 'id': 'image_'+ hash, 'alt': name, 'onclick': 'this.classList.toggle(\'expanded\')'});
			},
			_img = (IF.freeImg || _z.setup('img', {'onerror': function(e) {IF.freeImg = e.target;}}));
			_img.onload = _fn;
			_img.src = a.href;
		} else
		if (VF.includes(f_ext)) {
			testMedia((VF['Video'] || (VF['Video'] = document.createElement('video'))), a);
		} else
		if (AF.includes(f_ext)) {
			testMedia((AF['Audio'] || (AF['Audio'] = new Audio())), a);
		} else
		if (DF.includes(f_ext)) {
			m_id = hashCodeURL(a.href);
			_z.setup(a, {'class': 'cm-button cm-pastebin', 'id': 'GDoclnk_'+ m_id, 'text': 'Document: '+ getFileName(a.href), 'rel': 'nofollow' });
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
		_z.setup($t['_test_'][0], {'class': 'cm-button cm-play', 'id': $t.tagName[0] +'Flnk_'+ hashCodeURL($t.src), 'rel': 'nofollow', 'text': getFileName($t.src)});
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
								$btn._container = $btn.nextElementSibling.id === 'document_'+ $Id[1] ? $btn.nextElementSibling : _z.setup('div', {'class': 'document-container', 'id': 'document_'+ $Id[1],
									'html': '<span class="mv-frame to-win"></span><iframe frameborder="0" src="//pastebin.com/embed_iframe.php?i='+ $Id[1] +'">'});
							}
							if ($btn._container.inwin) {
								_Container.loadFrame($btn._container);
							} else if ($btn.nextElementSibling === $btn._container) {
								$btn._container.remove();
							} else
								_z.after($btn, $btn._container);
							break;
						case 'AFlnk':
							_z.each('.cm-stop', function($cm) { $cm.className = 'cm-button cm-play'; })
							if ($btn.nextElementSibling && $btn.nextElementSibling.id === 'audio_'+ $Id[1]) {
								$btn.nextElementSibling.remove();
							} else {
								$btn.className = 'cm-button cm-stop';
								_z.after($btn, _Container['Audio']);
								_Container['Audio'].id = 'audio_'+ $Id[1];
								_Container['Audio'].src = $btn.href;
								_Container['Audio'].play();
							}
							break;
						case 'IMGlnk':
							var $icont = jumpCont($btn, 'imagecontent'),
								$image = $icont.querySelector('#image_'+ $Id[1]);
							if (!$btn.wImage)
								$btn.wImage = ($image || _z.setup(e.target, {'class': 'image-attach thumb', 'id': 'image_'+ $Id[1], 'alt': $btn.textContent, 'onclick': 'this.classList.toggle(\'full-size\')'}));
							if ($image) {
								$image.remove();
								$btn.classList.remove('attached');
							} else {
								$icont.appendChild($btn.wImage);
								$btn.classList.add('attached');
							}
							break;
						case 'GDoclnk':
							if (!_Container['GDoc']) {
								_Container['GDoc'] = _z.setup('div', {'class': 'gdoc-container', 'html': '<iframe frameborder="0" scrolling="auto" width="100%" height="100%">'});
							}
							if (_Container['GDoc'].id !== 'gdoc_'+ $Id[1]) {
								_Container['GDoc'].firstElementChild.src = '//docs.google.com/gview?embedded=true&url='+ $btn.href;
								_Container['GDoc'].id = 'gdoc_'+ $Id[1]
							}
							_Container.loadFrame(_Container['GDoc']);
							break;
						case 'VFlnk':
							if (_Container['Video'].src !== $btn.href)
								_Container['Video'].src = $btn.href;
							if (_EmbedField_ === 0) {
								_Container.loadFrame(_z.setup(_Container['Video'], {'id': 'video_'+ $Id[1]}));
							} else {
								var $pcont = jumpCont($btn, 'mediacontent'),
									$video = $pcont.querySelector('#video_'+ $Id[1]);
								if ($video) {
									$btn.className = 'cm-button cm-play';
									$video.remove();
								} else {
									$btn.className = 'cm-button cm-stop';
									$video = _z.setup(_Container['Video'], {'id': 'video_'+ $Id[1]});
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
						e.target.className = 'mv-frame to-win';
						_z.after(document.getElementById('PBlnk_'+ e.target.parentNode.id.split('_')[1]), e.target.parentNode);
						_Container['Marker'].classList.remove('hidout');
						_Container['OVERLAY'].classList.add('hidup');
					}
					e.target.parentNode.inwin = e.target.classList[1] === 'to-post';
					break;
				case 'gala-show-dialogs':
					_z.each(document.getElementsByClassName('irc-reflink-'+ e.target.classList[1]), function(irc) {
						irc.style['display'] = (irc.style['display'] == 'inline' ? 'none' : 'inline');
					});
					break;
				case 'gala-edit-post':
					_z.route(($btn = $btn.parentNode), function(el, o) {
						if (el.id && el.id.includes('reply')) {
							var ref = el.querySelector('.reflink a'),
								m = /\/(\w+)\/res\/(\d+)\.html(?:#(\d+))?$/.exec(ref.href);
								o = true;
							getDataResponse(document.location.origin +'/get_raw_post.php?b='+ m[1] +'&p='+ m[3], function(data) {
								switch (data.status) {
									case 2:
										alertify.alert(data.error);
										break;
									default:
										if (!('raw_message' in data)) {
											alertify.alert('Нельзя редактировать чужой пост.');
										} else {
											(_EditForm || (_EditForm = makeGalaForm({ place: 2 }))).clear_all();
											_z.each(el.querySelectorAll('.file > a'), function(a, n){
												_EditForm.get_url_file(a.href, ((/R\:\s*\[(\w)\]/i).exec(a.previousElementSibling.firstChild.textContent) || {1:'N'})[1], n);
											});
											_EditForm.children['gala-error-msg'].textContent = data.error;
											_EditForm.children['gala-error-msg'].style['background-color'] = ({ 0: '#04A13D', 3: '#E04000' })[data.status];
											_EditForm.children['gala-replytitle'].lastElementChild.textContent = 'пост №.'+ m[3];
											_EditForm.elements['board'].value = m[1];
											_EditForm.elements['replythread'].value = m[2];
											_EditForm.elements['editpost'].value = m[3];
											_EditForm.elements['message'].value = data.raw_message;
											_EditForm.elements['subject'].value = data.subject;
											_EditForm.elements['name'].value = data.name;
											_EditForm.elements['em'].value = data.email;
											_z.prepend(el, _EditForm);
										}
								}
							});
						}
						return o;
					});
				case 'dropdown-arrow':
					$btn = $btn.parentNode;
				case 'dropdown-toggle':
					$btn.classList.toggle('ins-act');
					if ($btn.onmouseleave == null) {
						$btn.onmouseleave = function(e){ this.timer_id = setTimeout(function() { $btn.classList.remove('ins-act') }, 500) };
						$btn.onmouseenter = function(e){ clearTimeout(this.timer_id) };
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
					_z.after(_z.route(e.target, function(el) {
						if (el.id && el.id.includes('reply')) {
							var ref = el.querySelector('.reflink a'),
								m = /\/(\w+)\/res\/(\d+)\.html(?:#(\d+))?$/.exec(ref.href);
							_GalaForm.elements['board'].value = m[1];
							_GalaForm.elements['replythread'].value = m[2];
							_GalaForm.elements['message'].textMark('>>'+ (m[3] || m[2]), '\r\n', 'ijct');
							_GalaForm.children['gala-replytitle'].lastElementChild.textContent = (document.querySelector('#reply'+ m[2] +' .filetitle') || { textContent: '(без названия) №.'+ m[2] }).textContent;
						}
						return (el.classList.contains('psttable') || el.classList.contains('oppost')) ? el : el.classList.contains('de-pview') ? el.lastElementChild : null;
					}), _GalaForm);
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
					_SC.P.connect($btn.parentNode.parentNode, $btn);
					break;
				case 'sc-play':
					var $player = e.target.parentNode.parentNode;
					if (!$player.id)
						break;
					_SC.P.connect($player);
				case 'sc-pause':
					_SC.P['AudioDevice'][e.target.classList[0].slice(3)]();
					break;
				default:
					if (e.target.classList.contains('ta-inact')) {
						e.target.classList.remove('ta-inact');
					} else if (e.target.classList.contains('de-src-derpibooru')) {
						DerpSearch(e.target);
					}
					return;
			}
			_z.fall(e);
		} catch(trace) {
			console.error(trace);
		}
	}
	
	function globalBtReset(btn) {
		btn.className = 'gala-globalform-open';
		btn.parentNode.nextElementSibling.style['display'] = 'none';
	}
	
	function makeRandId(size) {
		var text = "", 
			possible = "0123456789abcdef",
			len = possible.length;
		if (!size)
			size = len;
		for (var i = 0; i < size; i++)
			text += possible.charAt(Math.floor(Math.random() * len));
		return text;
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
	
	var LOCATION_PATH = /^\/(\w+)\/?(?:res\/(\d+)\.html)?$/.exec(document.location.pathname);
	var RATING_VALUE = { S: 9, C: 10, A: 11, N: '' };
	var CONST_FILES = {
		SIZE: {
			default: 30000000, // b, cafe, and other else
			'test': 20000000,
			'r34': 30582912,
			'd': 20000000
		},
		COUNT: {
			default: 5, // b, cafe, d, r34, test and other else
			'cafe': 1
		},
		TYPES: /video\/webm|image\/(?:jpeg|jpg|png|gif)/i  // for the /regexp/.test(file_mime)
	}
	function makeGalaForm(opts) {
		var tempForm  = _z.setup('form', {'id': 'gala-'+ (opts.place == 2 ? 'edit' : 'reply') +'-form', 'name': 'postform', 'action': '/board.php?json=1', 'enctype': 'multipart/form-data',
			'style': 'display: table-row-group;'+ (opts.place == 0 ? ' left: 35%; top: 35%;' : ''),
			'html': '<input name="board" value="'+ LOCATION_PATH[1] +'" type="hidden"><input name="replythread" value="" type="hidden">'+
					'<div id="gala-error-msg"></div>'+
					'<div id="gala-replytitle">'+
						'<span class="pin-buttons" title="Сделать перетаскиваемым окном">'+
							'<svg class="closeform ls-de-svg"><use xlink:href="#de-symbol-win-close"></use></svg>'+
							(opts.place == 2 ? '<input name="editpost" value="" type="hidden">' : '<svg class="toggleform ls-de-svg"><use xlink:href="#de-symbol-win-arrow"></use></svg>') +
						'</span>'+
						'<span class="filetitle"></span>'+
					'</div>'+
					'<div class="new-thr greenmk">Новый тред в /'+ LOCATION_PATH[1] +'/</div>'+
					'<div style="display: table-row-group;">'+
						'<div class="file-area" style="display: table-cell;">'+
							'<div class="dropbox" style="visibility: hidden;"></div>'+
							'<div class="files-params">'+
								'<label title="Убирать имена файлов">'+
									'<input id="clear_files_name" type="checkbox"'+ (!opts.clear_files_name ? '' : ' checked') +' hidden><span class="feckbox">имена</span>'+
								'</label>'+
								'<label title="Удалять данные Exif из JPEG">'+
									'<input id="remove_jpeg_exif" type="checkbox"'+ (!opts.remove_jpeg_exif ? '' : ' checked') +' hidden><span class="feckbox">EXIF</span>'+
								'</label>'+
								'<label title="Рейтинг картинок по умолчанию">'+
									'<select id="default_img_ratings"><option class="rating-N">N</option><option class="rating-A">A</option><option class="rating-C">C</option><option class="rating-S">S</option></select>'+
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
					'</div>', 'onmousedown': (opts.place == 0 ? mousedownGFlistener : null)}, {
			'change': changeGFlistener,
			'submit': submitGFlistener,
			'click': clickGFlistener
		});
		tempForm.files = new Array(0);
		tempForm.elements['message'].textMark = galamarK;
		if (LOCATION_PATH[2]) {
			tempForm.elements['replythread'].value = LOCATION_PATH[2];
			tempForm.querySelector('.new-thr').className = 'new-thr-chx greenmk inactive';
		}
		if (opts.place != 2) {
			var gala_safe = JSON.parse(_z.sessionS.get('GalaSafe', '{}'));
			tempForm.className = (opts.place == 0 ? 'reply gala-freestyle' : 'reply');
			tempForm.elements['default_img_ratings'].value = sessionStorage.getItem('default_img_ratings') || 'N';
			tempForm.elements['message'].safeValue = safeValue;
			_z.setup(tempForm.elements['name'], {'value': (gala_safe.name || '')}, {'input': safeValue});
			_z.setup(tempForm.elements['message'], {'value': (gala_safe.message || '')}, {'input': safeValue});
			function safeValue() {
				var name = this.name;
				gala_safe[name] = this.value;
				clearTimeout(this.safe_timer);
				this.safe_timer = setTimeout(function() {
					_z.sessionS.set('GalaSafe',  JSON.stringify(gala_safe));
				}, 800);
			}
		}
		Object.defineProperties(tempForm, {
			MAX_FILES_LIMIT: {
				get: function() {
					var brd = this.elements['board'].value,
						max_files = brd in CONST_FILES.COUNT ? CONST_FILES.COUNT[brd] : CONST_FILES.COUNT.default;
					return (this.files.length >= max_files);
				}
			}
		})
		
		tempForm['FileArea'] = _z.setup(tempForm.querySelector('.file-area'), null, {
			'dragover': function(e) {
				clearTimeout(this.leave_timer);
				this.style['min-width'] = '100px';
				this.firstElementChild.style['visibility'] = 'visible';
				_z.fall(e);
			},
			'dragenter': function(e) {
				var items = e.dataTransfer.mozItemCount || e.dataTransfer.items.length;
				this.transfer_info = '.dropbox:before { content: "добавить '+ itemsPlurality(items) +'"; }';
				dynamicCSS.textContent += this.transfer_info;
			},
			'dragleave': function(e) {
				this.leave_timer = setTimeout(closeDBOX, 200);
			},
			'drop': function(e) {
				tempForm.add_files(e.dataTransfer);
				closeDBOX();
				_z.fall(e);
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
					defaultR = this.elements['default_img_ratings'].value;
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
								var gox = this['FileArea'].getElementsByClassName('file-gox');
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
		tempForm.localParams = opts;
		
		return tempForm;
	}

	function changeGFlistener(e) {
		switch (e.target.id) {
			case 'dumb_file_field':
				this.add_files(e.target);
				break;
			case 'default_img_ratings':
				if (this.localParams['place'] != 2)
					sessionStorage.setItem('default_img_ratings', e.target.value);
				break;
			case 'clear_files_name':
			case 'remove_jpeg_exif':
				this.localParams[e.target.id] = e.target.checked;
				if (this.localParams['place'] != 2)
					localStorage.setItem('GalaForm', JSON.stringify(this.localParams));
		}
	}
	
	function isFileValid(blob, desk) {
		return Math.round(blob.size / (desk in CONST_FILES.SIZE ? CONST_FILES.SIZE[desk] : CONST_FILES.SIZE['default'])) <= 1 && CONST_FILES.TYPES.test(blob.type);
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
		
		fnode = _z.setup('div', {'id': 'gala-file_'+ FiD, 'class': 'file-gox', 'html': '<span class="file-remove"></span><div class="file-cover-label '+ (R || 'N') +'"><ul class="file-cover-select"><li class="file-cover S"></li><li class="file-cover C"></li><li class="file-cover A"></li><li class="file-cover N"></li></ul></div>'}, {
			'click': function(e) {
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
					var filestring = this.result;
					var stringLength = filestring.length;
					var i = 1;
					var lastChar = filestring.charAt(stringLength - i);
					if (!isNaN(lastChar)) { // is number
						do {
							i++;
							lastChar = filestring.charAt(stringLength - i);
						} while (!isNaN(lastChar));
						filestring = filestring.substring(0, stringLength - i);
					}
					
					fnode.md5 = rstr2hex(rstr_md5(filestring));
					//always send sha512 of file for passcode records
					//field will be sent only if user have cookie with real passcode
					getDataResponse(document.location.origin +'/chkmd5.php?x='+ fnode.md5, function(y) {
						if (!(fnode.exist = !!y) && fnode.dataStriped) {
							var striped = convertToBinaryString(fnode.dataStriped),
								strip_md5 = rstr2hex(rstr_md5(striped));
							getDataResponse(document.location.origin +'/chkmd5.php?x='+ strip_md5, function(_y) {
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
		_z.fall(e);
		
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
					this.localParams['place'] = 1;
				} else {
					var coords = this.getBoundingClientRect();
					this.style['left'] = coords.left +'px';
					this.style['top' ] = coords.top  +'px';
					this.onmousedown = mousedownGFlistener;
					this.localParams['place'] = 0;
				}
				this.classList.toggle('gala-freestyle');
				localStorage.setItem('GalaForm', JSON.stringify(this.localParams));
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
				alertify.alert('<div id="catcha-widget'+ this.localParams.place +'" style="text-align: center;"></div>');
				grecaptcha.render('catcha-widget'+ this.localParams.place, {
					'sitekey': '6Lfp8AYUAAAAABmsvywGiiNyAIkpymMeZPvLUj30',
					'expired-callback': callback,
					'callback': callback,
					'theme': 'light'
				});
				break;
			case 'new-thr-chx':
				e.target.classList.toggle('inactive');
				this.elements['replythread'].value = (e.target.classList.contains('inactive') ? LOCATION_PATH[2] : '');
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
	
	var dynamicCSS = _z.setup('style', {'id': 'gala_dynamic_css', 'text': '.you-lnk { content: " (You)" }'});
	var myPostsMap = JSON.parse(_z.localS.get('de-myposts', '{}'));
	
	function submitGFlistener(e) {
		try { _z.fall(e);
			var form = e.target, i, n, len, exists = {},
				desk = form.elements['board'].value,
				thread_id = form.elements['replythread'].value,
				formData = new FormData();
			for (i = form.elements.length; i > 0;) {
				 i--;
				if (!form.elements[i].name || !form.elements[i].value || form.elements[i].type == 'checkbox' && !form.elements[i].checked) {
					continue;
				}
				formData.append(form.elements[i].name, form.elements[i].value);
			}
			for (n = 1, len = form.files.length; i < len; i++) {
				if (form.files[i].exist) {
					exists[i] = form.files[i];
					continue;
				}
				if (form.localParams['remove_jpeg_exif'] && form.files[i].blob.type == 'image/jpeg')
					form.files[i].blob = new Blob([form.files[i].dataStriped], {type: 'image/jpeg'});
				if (form.localParams['clear_files_name'])
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
					if (this.status === 200) {
						try {
							var json = /<meta http-equiv=\"\w+\" content=\"\d+;url=\/\w+\/\">/.test(this.responseText) ? { error: 'Неизвестная ошибка (попробуйте отправить пост с текстом)'} : JSON.parse(this.responseText);
						} finally {
							if (json && json.error == null) {
								(myPostsMap[desk] || (myPostsMap[desk] = [])).push(json.id);
								dynamicCSS.textContent = '.de-link-pref[href$="#'+ json.id +'"]:after,'+ dynamicCSS.textContent;
								_z.localS.set('de-myposts', JSON.stringify(myPostsMap));
						
								form.remove();
								form.clear_all();
								
								if (form.elements['message'].safeValue)
									form.elements['message'].safeValue();
								if (!thread_id) {
									document.location.href = document.location.origin +'/'+ desk +'/res/'+ json.id +'.html';
								} else if ((json.thread = document.querySelector('.oppost#reply'+ thread_id))) {
									if (!json.thread._UpdateBtn) {
										if (json.thread.parentNode.nextElementSibling.className === 'de-thread-buttons') {
											json.thread._UpdateBtn = json.thread.parentNode.nextElementSibling.firstElementChild.firstElementChild;
										} else if (json.thread.parentNode.lastElementChild.className === 'de-thread-buttons') {
											json.thread._UpdateBtn = json.thread.parentNode.lastElementChild.firstElementChild;
										} else json.thread._UpdateBtn = _z.setup('div');
									}
									_z.simulate('click', json.thread._UpdateBtn);
								}
							} else {
								form.children['gala-error-msg'].textContent = json ? json.error : this.responseText;
							}
						}
					}
					form.elements['submit_this_form'].disabled = false;
					form.elements['submit_this_form'].value = 'Отправить';
					if (form.children['gala-error-msg'].textContent.includes('неправильный код подтверждения'))
						form.captcha_needed();
				};
				postReq.open('POST', form.action, true);
				postReq.send(formData);
		} catch(log) {
			console.error(log)
		}
	}
	
	_MarkupButtons = _z.setup('span', {
		'html':
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
				'<input value=">" type="button"><a href="#">&gt;</a></span>',
		'onclick': deMarkupButtons });
	
	function deMarkupButtons(e, tag) {
		if ((tag = e.target.parentNode.getAttribute('gmk'))) {
			_z.fall(e);
			switch (tag) {
				case 'spoiler':
				case 'code':
					var o = '['+ tag +']', c = '[/'+ tag +']',
						s = this.txtarea.value.substring(0, this.txtarea.selectionStart);
					if (!isInsideATag(s, o, c)) {
						this.txtarea.textMark(o, c, 'html', true);
					} else if (tag === 'spoiler') {
						this.txtarea.textMark('%%', '%%', 'mdwn');
					} else if (tag === 'code')
						this.txtarea.textMark('   ', '\n   ', 'ql');
					break;
				case '>':
					this.txtarea.textMark(tag, '\n'+ tag, 'ql');
					break;
				case '##':
					this.txtarea.textMark(tag, tag, 'dice');
					break;
				case '!!':
					this.txtarea.textMark(tag, tag, 'mdwn');
					break;
				default:
					this.txtarea.textMark('['+tag+']', '[/'+tag+']', 'html');
			}
		}
	}
	
	if (_GalaForm) {
		_GalaForm = makeGalaForm( JSON.parse(_GalaForm) );
		globalform_area = _z.setup('div', {'class': 'gala-globalform-area', 'html': '<div>[<a class="gala-globalform-open"></a>]</div><div style="text-align: left; display: none;"></div><hr>'});
		getDataResponse(document.location.origin + '/recaptchav2.php?c=isnd', function(captcha) {
			if (captcha == 1) {
				_GalaForm.captcha_needed();
			}
		});
	}
	
	var dollchan = document.cookie.includes('kl_off=0;');
	
	function handlePostNode(bquot) {
		var reply = bquot.parentNode.parentNode;
		if (bquot.parentNode.previousElementSibling.childElementCount > 3) {
			bquot.style['clear'] = 'both';
		}
		if (!reply['_handled_']) {
			if (_GalaForm) {
				if (dollchan) {
					_z.setup(reply.querySelector('.de-btn-rep'), {'class': 'gcall-write-reply de-btn-rep'});
				} else {
					_z.after(reply.querySelector('.reflink'), _z.setup('a', {'html': '<svg class="gcall-write-reply rep-arrow-svg"><use class="rep-use1" xlink:href="#de-symbol-post-rep"></use></svg>'}));
				}
				_z.replace(reply.querySelector('.dast-hide-tr'), _z.setup('span', {'class': 'dropdown-toggle',
					'html': '<a class="dropdown-arrow">▼</a><ul class="dropdown-menu"><li class="gala-show-dialogs from-'+ reply.id.slice(5) +'">Диалоги</li><li class="gala-edit-post">Редактировать</li></ul>'})
				);
			}
			var sclnks = bquot.querySelectorAll('a[href^="https://soundcloud.com/"], a[href^="http://soundcloud.com/"]');
			if (sclnks.length > 0) {
				jumpCont(bquot, 'mediacontent').appendChild(_SC.createGroup(sclnks));
			}
		}
		_z.each(bquot.querySelectorAll('a[href*="//"]:not(.cm-link):not(.cm-button):not(.irc-reflink)'), handleLinks);
		reply['_handled_'] = true;
	}
	
	_z.setup(window, null, {
		'keypress': keyMarks,
		'click': cmButtonHandler,
		'load': function(e) {
			if (_GalaForm && dollchan) {
				_z.replace('.de-parea', globalform_area);
				_z.each('.de-btn-rep', function(rep){ rep.setAttribute('class', 'gcall-write-reply de-btn-rep') });
			}
			// animation listener events
			_z.documentListener.add('AnimationStart', function (event){
				if (event.animationName == 'init' && event.target.nodeName === 'BLOCKQUOTE') {
					handlePostNode(event.target);
				}
			});
		}
	});
	document.addEventListener('DOMContentLoaded', function(e) {
		try {
			var postform = this.getElementById('postform');
			if (postform) {
				_MarkupButtons.txtarea = postform.elements['message'];
				_MarkupButtons.txtarea.textMark = galamarK;
				if (!dollchan) {
					_z.replace(postform.parentNode, globalform_area);
					_z.after(this.getElementById('delform'), globalform_area.cloneNode(true));
					this.body.appendChild(_z.setup('div', {'style': 'height: 0; width: 0; position: fixed;',
						'html': 
							'<style>.de-svg-back { fill: inherit; stroke: none; } .de-svg-fill { stroke: none; fill: currentColor; } .de-svg-stroke { stroke: currentColor; fill: none; } .de-btn-sage { margin: 0 2px -3px; cursor: pointer; width: 12px; height: 16px; } .rep-arrow-svg{ margin: 0 2px -4px 2px; cursor: pointer; width: 20px; height: 16px; }</style>'+
							'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
							'<defs></defs>'+
							'<symbol viewBox="0 0 16 16" id="de-symbol-post-back">'+
								'<path class="de-svg-back" d="M4 1q-3 0,-3 3v8q0 3,3 3h8q3 0,3 -3v-8q0 -3,-3-3z"></path>'+
							'</symbol>'+
							'<symbol viewBox="0 0 16 10" id="de-symbol-post-rep">'+
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
						'</svg>'
					}));
				}
			}
			if (_SC.P['AudioDevice'].tagName === 'OBJECT') {
				var engineContainer = _z.setup('span', {'class': 'sc-engine-container', 'style': 'position: absolute; left: -9000px;'});
					engineContainer.appendChild(_SC.P['AudioDevice']);
				this.body.appendChild(engineContainer);
			}
			_z.each('blockquote', handlePostNode);
			// animation listener events
			_z.documentListener.add('AnimationStart', function (event){
				if (event.animationName == 'init') {
					if (event.target.id == 'de-txt-panel') {
						_MarkupButtons.className = 'buttons-style-'+ (event.target.querySelector('.de-abtn') ? 'text' : 'standart');
						event.target.appendChild(_MarkupButtons);
					} else
					if (event.target.classList.contains('de-src-iqdb')) {
						var $element = _z.setup('a', {'class': 'de-menu-item de-src-derpibooru', 'target': '_blank', 'text': 'Поиск по Derpibooru'});
						_z.after(event.target, $element);
					}
				}
			});
			this.body.appendChild(dynamicCSS);
		} catch(trace) {
			console.error(trace);
		}
	});
} /* ===> end <=== */
