/* 
	«Gala the Boardscript»
	: Special for Ponyach imageboard
	: Code Repositiry https://github.com/Ponyach/gala
	: version 2.0
	© magicode
	
*/

/* ---{ Remove Depricated Storage Keys }--- */
['VWidth', 'VHeight', 'EmbedIn', 'EmbedLinks', 'bold', 'italic', 'underline', 'strike', 'spoiler', 'code', 'roleplay', 'sup', 'sub', 'attent', 'dice', 'quote'].forEach(function(key) {
      localStorage.removeItem(key);
}); sessionStorage.removeItem('LinksCache');
// add Settings
function addGalaSettings() {
	return '<label><input onclick="localStorage.setItem(&quot;KeyMarks&quot;, this.checked)" '+ (!localStorage.getItem('KeyMarks') ? '' : 'checked') +' type="checkbox" name="set_km" value=""><span title="Вкл/Выкл Gala KeyMarks &middot; % ^ * ( &quot; @ &#92; ! # &gt;">Автодополнение разметки</span></label>';
}

/* SpelzZ - a lightweight Node Work Tool */
(function(){
	var _z = {
		each : $each,
		setup: $setup,
		route: $route,
		fall: fallback,
		sessionS: $storeItem('session'), localS: $storeItem('local'),
		append: function(el, nodes) { $nodeUtil('append', el, nodes) },
		prepend: function(el, nodes) { $nodeUtil('prepend', el, nodes) },
		after: function(el, nodes) { $nodeUtil('after', el, nodes) },
		before: function(el, nodes) { $nodeUtil('before', el, nodes) },
		replace: function(el, nodes) { $nodeUtil('replace', el, nodes) },
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
			Fn(el, (i + 1 === arr.length))
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
					key === 'html'    ? el.innerHTML   = _Attrs[key] :
					key === 'text'    ? el.textContent = _Attrs[key] :
					key in el       && (el[key]        = _Attrs[key] ) == _Attrs[key]
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
				nodes = nodes && !Array.isArray(nodes) ? [nodes] : nodes;
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
				el.querySelector(pat)
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
		var Store = locate === 'session' ? sessionStorage : localStorage,
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
	window._z = _z;
})();/* ===> end <=== */

/* ---{ Soundcloud Player Engine (Custom build) }--- */
(function() {
	
	var SC = {
		'APIKey': 'htuiRd1JP11Ww0X72T1C3g',
		'Global': true,
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
				this['Player Volume'] = SC['Global'] ? SC.Volume : SC['Object'][player_node.id.split('_')[1]];
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
	
	if (SC['Global']) {
		window.addEventListener('click', onClickHandler, false);
	}
	
	window.SCPurePlayer = {
		create: _scCreate,
		createGroup: _scCreateGroup
	}
	document.addEventListener("DOMContentLoaded", onDOMReady);
	
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
				
				if (_$.it == 0) {
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
				if (this.node['_trackslist_'].children.length == 0 && ibx == 0)
				    this.node.removeAttribute('id');
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
	
	function onDOMReady(e) {
		Array.prototype.slice.call(this.getElementsByClassName('sc-player'), 0).forEach(function(scp) {
			var node, links;
			if (scp.href) {
				node = _scCreate(scp);
			} else if ((links = scp.querySelectorAll('a[href*="soundcloud.com/"]')).length > 0) {
				node = _scCreateGroup(links);
			} else
				node = createPlayerDOM(null);
			scp.parentNode.replaceChild(node, scp);
		});
		if (_Current_['AudioDevice'].tagName === 'OBJECT') {
			var engineContainer = this.createElement('scont');
				engineContainer.className = 'sc-engine-container';
				engineContainer.setAttribute('style', 'position: absolute; left: -9000px');
				engineContainer.appendChild(_Current_['AudioDevice']);
			this.body.appendChild(engineContainer);
		}
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
	function onClickHandler(e) {
		if (e.button != 0 || !e.target.className || !e.target.className.slice)
			return;
		if (e.target.className.slice(0, 3) === 'sc-') {
			var $target   = e.target,
				classList = $target.className.split(' '),
				$sc       = classList[0].split('-');
				_z.fall(e);
			switch ($sc[1]) {
				case 'info':
					if ($sc[2] === 'close') {
						$target.parentNode.className = 'sc-info';
					} else if ($sc[2] === 'toggle') {
						$target.parentNode.children[1].className = 'sc-info active';
					}
					break;
				case 'track':
					var $player = $target.parentNode.parentNode, $Id, $track;
					if ($sc[2]) {
						$player = $player.parentNode;
						$target = $target.parentNode;
					}
					_Current_.connect($player, $target);
					break;
				case 'play':
					var $player = !SC['Global'] ? this : $target.parentNode.parentNode;
					if (!$player.id)
						return;
					_Current_.connect($player);
				case 'pause':
					_Current_.AudioDevice[$sc[1]]();
			}
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
			if (!SC['Global']) {
				SC['Object'][hash] = { volume: SC.Volume }
				div.addEventListener('click', onClickHandler, false);
			}
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
				return item;
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
})();/* ===> end <=== */

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
				Fn((json || this.responseText), this.responseURL);
			}
		} else {
			Fn({error: { status: this.status, message: this.statusText }}, this.responseURL);
		}
	}
	xhReq.send();
}/* ===> end <=== */

try {
	
var gala_inline_style = document.createElement('style');
	gala_inline_style.textContent = 'blockquote:after, .de-menu:after, #de-txt-panel:after, #postform:after{ content:""; -webkit-animation: init 1s linear 2; animation: init 1s linear 2; }\
span[de-bb]{ position: absolute; visibility: hidden; } input, textarea { outline: none; }\
.mv-frame{position: absolute; background-color: rgba(0,0,0,.7); color: white; cursor: pointer; width: 40px; line-height: 40px; text-align: center; border-radius: 0 0 10px 0; opacity: .5;} .mv-frame:hover{ opacity: 1; } .mv-frame.to-win:before { content: "[ ↑ ]"; } .mv-frame.to-post:before { content: "[ ↓ ]"; }\
.de-src-derpibooru:before{ content:""; padding-right: 16px; margin-right: 4px; background: url(/test/src/140903588031.png) center / contain no-repeat; }\
.hidup{ top:-9999px!important; } .hidout{ display:none!important; }\
.mediacontent > .video-container { display: inline-block; background-color: #212121; margin: 0 9px; margin-bottom: 5px;  max-height: 360px; max-width: 480px;}\
.document-container{ overflow: auto; resize: both; background-color:#fefefe; }\
.content-window{ position: fixed; left: 0; top: 0; z-index: 2999; }\
#content-frame { position: absolute; top: 10%; left: 0; right: 0; bottom: 20%; z-index:3000; max-width: 100%;}\
#content-frame > * { left: 0; right: 0; margin: auto; box-shadow: 5px 5px 10px rgba(0,0,0,.4); position: absolute;}\
#content-frame > .pdf-container { top: -9%; bottom: -19%; margin: auto 10%; background-color:#D1D1D1; }\
#content-frame > .video-container { max-height: 100%; max-width: 100%; background-color: #212121; }\
#shadow-box{ position: absolute; background-color: rgba(33,33,33,.8); z-index: 2999;}\
#close-content-window, #show-content-window{ transition: .5s ease; opacity: .4; width: 29px; height: 29px; cursor: pointer; top: 20px; z-index: 3000; }\
#close-content-window { right: 20px; position: absolute; background-image: url(/test/src/141665751261.png); }\
#show-content-window  { right: 52%;  position: fixed;    background-image: url(/test/src/141667895174.png); border-radius: 100%; box-shadow: 0 1px 0 rgba(0,0,0,.4), -1px 1px 0 rgba(0,0,0,.4); }\
#close-content-window:hover, #show-content-window:hover { opacity: .8; }\
.ta-inact::-moz-selection{ background: rgba(99,99,99,.3); } .ta-inact::selection{ background: rgba(99,99,99,.3); }\
.buttons-style-standart > .markup-button > *:not(input), .buttons-style-text > .markup-button >  *:not(a) { display: none; }\
.markup-button > a{ font-size:13px; text-decoration: none; }\
.buttons-style-text > .markup-button:not(#mr_quote):after{ content:" | "; cursor: default; }\
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
	var _Form_, _TextArea_,
		_EmbedField_ = localStorage.getItem('EmbedField') || 0,
	MarkupButtons = _z.setup('span', {'id': 'markup-buttons-panel', 'html':
		'<span id="mr_bold" mktag="b" title="Жирный" class="markup-button">'+
			'<input value="B" type="button"><a href="#">B</a></span>'+
		'<span id="mr_italic" mktag="i" title="Курсивный" class="markup-button">'+
			'<input value="i" type="button"><a href="#">i</a></span>'+
		'<span id="mr_underline" mktag="u" title="Подчеркнутый" class="markup-button">'+
			'<input value="U" type="button"><a href="#">U</a></span>'+
		'<span id="mr_strike" mktag="s" title="Зачеркнутый" class="markup-button">'+
			'<input value="S" type="button"><a href="#">S</a></span>'+
		'<span id="mr_spoiler" mktag="spoiler" title="Спойлер" class="markup-button">'+
			'<input value="%%" type="button"><a href="#">%%</a></span>'+
		'<span id="mr_code" mktag="code" title="Код" class="markup-button">'+
			'<input value="C" type="button"><a href="#">C</a></span>'+
		'<span id="mr_roleplay" mktag="rp" title="Ролеплей" class="markup-button">'+
			'<input value="RP" type="button"><a href="#">RP</a></span>'+
		'<span id="mr_sup" mktag="sup" title="Верхний индекс" class="markup-button">'+
			'<input value="Sup" type="button"><a href="#">Sup</a></span>'+
		'<span id="mr_sub" mktag="sub" title="Нижний индекс" class="markup-button">'+
			'<input value="Sub" type="button"><a href="#">Sub</a></span>'+
		'<span id="mr_attent" mktag="!!" title="Attention" class="markup-button">'+
			'<input value="!A" type="button"><a href="#">!A</a></span>'+
		'<span id="mr_dice" mktag="##" title="#dice" class="markup-button">'+
			'<input value="#D" type="button"><a href="#">#D</a></span>'+
		'<span id="mr_quote" mktag=">" title="Цитировать" class="markup-button">'+
			'<input value=">" type="button"><a href="#">&gt;</a></span>'}, {'click': markupText }),
	Container = {
		zIndex: 1,
		Audio: _z.setup((HTMLAudioElement ? 'audio' : 'object'), {'class': 'audio-container', 'controls': true}),
		Video: _z.setup((HTMLMediaElement ? 'video' : 'object'), {'class': 'video-container', 'controls': true}),
		OVERLAY: _z.setup('div', {'class': 'content-window hidup', 'html': '<div id="shadow-box"></div><label id="close-content-window"></label><div id="content-frame"></div>'}, {
			'click': function(e) {
				switch (e.target.id) {
					case 'close-content-window':
						_z.remove([this, Container['Marker']]);
						_z.remove(this.lastElementChild.childNodes);
						break;
					case 'content-frame':
					case 'shadow-box':
						this.classList.add('hidup');
						Container['Marker'].classList.remove('hidout');
				}
			}, 'mousedown': function(e) {
				if (e.target.className && e.target.className.indexOf('-container') >= 0)
					e.target.style['z-index'] = Container.zIndex++;
			}
		}),
		Marker: _z.setup('label', {'id': 'show-content-window', 'class': 'hidout'}, {
			'click': function(e) {
				Container['OVERLAY'].classList.remove('hidup');
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
		},
		testMedia: function(name, el) {
			(this[name]['_test_'] || (this[name]['_test_'] = [])).push(el);
			if (!this[name].oncanplay) {
				this[name].oncanplay = _onCanplayHandle;
				this[name].onerror = _onUnsupportedHandle;
				this[name].src = el.href;
			}
		}
	}
	function _onCanplayHandle(e) {
		var $t = e.target;
		_z.setup($t['_test_'][0], {'class': 'cm-button cm-play', 'id': $t.tagName[0].toLowerCase() +'flnk_'+ hashCodeURL($t.src), 'rel': 'nofollow', 'text': getFileName($t.src)});
		_onUnsupportedHandle(e);
	}
	function _onUnsupportedHandle(e) {
		var $t = e.target;
		delete $t['_test_'][0];
		$t['_test_'].splice(0, 1);
		
		if (!$t['_test_'][0]) {
			$t.oncanplay = $t.onerror = null;
		} else {
			$t.src = $t['_test_'][0].href;
		}
	}
	
	//--> Derpibooroo Reverse Search
	var _DerpForm;
	function DerpSearch(event) {
		var imgSrc = decodeURIComponent(event.target.previousElementSibling.href.split('=')[1]);
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
	
	//-- Get File name from Url
	function getFileName(url) {
		var m = /(?:\/|#|\?|&)(([^?\/#&]*)\.\w\w\w\w?)$/.exec(url);
		return decodeURIComponent(m && m[2] ? m[1] : url.split('/').pop());
	}
	function isContain(arr, word) {
		return (arr ? arr.indexOf(word) >= 0 : false);
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
	function getInsetR(str, sbstr) {
		return str.split(sbstr).length - 1;
	}
	
	function markupText(e, tag) {
		if ((tag = e.target.parentNode.getAttribute('mktag'))) {
			try { _z.fall(e);
				switch (tag) {
					case 'spoiler':
					case 'code':
						var o = '['+ tag +']', c = '[/'+ tag +']',
							s = _TextArea_.value.substring(0, _TextArea_.selectionStart);
						if (getInsetR(s, o) <= getInsetR(s, c)) {
							markText(o, c, 'html', true);
						} else if (tag === 'spoiler') {
							markText('%%', '%%', 'mdwn');
						} else if (tag === 'code') {
							markText('   ', '\n   ', 'ql');
						}
						break;
					case '>':
						markText(tag, '\n'+ tag, 'ql');
						break;
					case '##':
						markText(tag, tag, 'dice');
						break;
					case '!!':
						markText(tag, tag, 'mdwn');
						break;
					case 's': case 'u': case 'i': case 'b': case 'rp': case 'sup': case 'sub':
						 markText('['+tag+']', '[/'+tag+']', 'html');
				}
			} catch(log) {
				console.error(log);
			}
		}
	}
	function markText(openTag, closeTag, CASM, inset) {
		var val = _TextArea_.value,
			end = _TextArea_.selectionEnd,
			start = _TextArea_.selectionStart,
			selected = val.substring(start, end),
			ws = window.getSelection().toString(),
			getext = start === end ? ws : selected,
			typex = function (gmi) {return new RegExp('^(\\s*)(.*?)(\\s*)$', (gmi || ''))},
			cont = typex().exec(selected), offsetS = 0, offsetE, markedText;
		switch (CASM) {
			case 'html':
				markedText = openTag + selected + closeTag;
				if (inset || cont != null && !cont[2]) {
					offsetS = openTag.length;
					offsetE = openTag.length + selected.length;
				}
				break;
			case 'ql':
				if (ws && ws != getext) {
					start = end = _TextArea_.value.length;
					getext = ws;
					openTag = closeTag;
				}
				markedText = openTag + getext.replace(/\n/gm, closeTag);
				break;
			case 'mdwn':
				markedText = selected.replace(typex((cont === null ? 'gm' : '')), '$1'+ openTag +'$2'+ closeTag +'$3');
				if (cont != null && !cont[2]) {
					offsetS = openTag.length;
					offsetE = openTag.length + selected.length;
				}
				break;
			case 'scrn':
				markedText = selected.length > 0 ? selected.replace(/(%%|\^|!!|\*)/gm, openTag +'$1') : closeTag;
				break;
			case 'dice':
				var s = ' ', d = (/(\d+)(d\d+)?/).exec(getext),
					OdT = openTag + (d && d[2] ? d[0] : d && d[1] ? '1d'+ d[1] : '1d2') + closeTag + s;
				markedText = cont === null ? selected + s + OdT : !cont[2] ? cont[1] + OdT :
					(/^\d+|\d+d\d+$/).test(selected) ? OdT : cont[1] + cont[2] + s + OdT;
				offsetS = markedText.length;
		}
		_z.setup(_TextArea_, {'class': 'ta-inact', 'value': val.substring(0, start) + markedText + val.substring(end)}).focus();
		_TextArea_.setSelectionRange(start + offsetS, start + (offsetE || markedText.length));
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
			var _TA_ = e.target.tagName === 'TEXTAREA',
				_KM_ = _z.localS.get('KeyMarks', true),
				start = _TextArea_.selectionStart,
				end = _TextArea_.selectionEnd;
			if (_KM_) {
				var key = String.fromCharCode(e.charCode),
					val = _TextArea_.value,
					prev = val.substring(start - 1, start),
					fpart = val.substring(0, start),
					selected = val.substring(start, end),
					c, exit = true;
					
				if (_TA_ && getInsetR(fpart, '[code]') > getInsetR(fpart, '[/code]')) {
					if ((c = KeyChars.code.indexOf(key)) != -1) {
						markText(KeyChars.code[c], KeyChars.edoc[c], 'mdwn');
						KeyChars.complex = -1;
					} else {
						switch (e.keyCode * KeyChars.complex) {
							case 9:
							case -9:
								markText('   ', '\n   ', 'ql');
								break;
							case -8:
								var offset = start - 1;
								_TextArea_.value = val.slice(0, offset) + val.slice(end + 1);
								_TextArea_.setSelectionRange(offset, offset);
								break;
							case -13:
								var ls = fpart.split('\n'),
									pan = (new RegExp('(?:^|\\n)([\\s]*)'+ prev, '').exec(ls[ls.length - 1])|| { 1:'' })[1],
									fc = '\n   ' + pan, sc = '\n' + pan,
									offset = start + fc.length - 1;
								
								_TextArea_.value = fpart + fc + sc + val.substring(end);
								_TextArea_.setSelectionRange(offset, offset);
								break;
							default:
								exit = false;
						}
						KeyChars.complex = 1;
					}
				} else if (_TA_ && selected.length > 0 && (c = KeyChars.symbs.indexOf(key)) !== -1) {
					markText(
						(key === '(' ?  key  : KeyChars.doubs[c]), KeyChars.doubs[c], (
						 key === '#' ? 'dice':
						 key === '\\'? 'scrn': 'mdwn'));
				} else if (
					(window.getSelection().toString() || selected).length > 0 &&
					(c = KeyChars.quots.indexOf(key)) != -1 &&
					(prev == '\n' || prev == '' || selected.indexOf('\n') != -1)) {
						key === '@' ? markText('• ', '\n• ', 'ql') :
						              markText(key +' ', '\n'+ key +' ', 'ql');
				} else
					exit = false;
				if (exit)
					return _z.fall(e);
			}
			if (_TA_ && e.keyCode != 8 && _TextArea_.className === 'ta-inact') {
				_TextArea_.setSelectionRange(end, end);
				_TextArea_.removeAttribute('class');
			}
		} catch(log) {
			console.error(log);
		}
	}
	
	var DF = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'xps', 'rtf'];
	var VF = ['webm', 'ogv', 'ogm', 'mp4', 'm4v'];
	var AF = ["wav", "m4a", "m4r", "aac", "ogg", "mp3", 'opus'];
	var IF = ["jpeg", "jpg", "png", "svg", "gif"];
	
	function handleLinks(a) {
		var f_ext, m_id;
		if (a.host === 'pastebin.com' && (m_id = /\/([\w_-]+)/.exec(a.pathname))) {
			_z.setup(a, {'class': 'cm-button cm-pastebin', 'id': 'pblnk_'+ m_id[1], 'text': 'PASTEBIN: '+ m_id[1], 'rel': 'nofollow' });
		} else
		if (isContain(IF, (f_ext = a.href.split('.').pop()))) {
			var _fn = function(e) {
				var hash = hashCodeURL(a.href),
					name = getFileName(a.href);
				e.target.onerror = IF.freeImg = e.target.onload =  null;
				_z.setup(a, {'class': 'cm-button cm-image', 'id': 'imglnk_'+ hash, 'rel': 'nofollow', 'text': name,
					'title': f_ext.toUpperCase() +', '+ e.target.naturalWidth +'x'+ e.target.naturalHeight });
				a.wImage = _z.setup(e.target, {'class': 'image-attach', 'id': 'image_'+ hash, 'alt': name, 'onclick': 'this.classList.toggle(\'expanded\')'});
			},
			_img = (IF.freeImg || _z.setup('img', {'onerror': function(e) {IF.freeImg = e.target;}}));
			_img.onload = _fn;
			_img.src = a.href;
		} else
		if (isContain(VF, f_ext)) {
			Container.testMedia('Video', a);
		} else
		if (isContain(AF, f_ext)) {
			Container.testMedia('Audio', a);
		} else
		if (isContain(DF, f_ext)) {
			m_id = hashCodeURL(a.href);
			_z.setup(a, {'class': 'cm-button cm-pastebin', 'id': 'pdflnk_'+ m_id, 'text': 'Document: '+ getFileName(a.href), 'rel': 'nofollow' });
		}
	}
	
	function cmButtonHandler(e) {
		if (e.button != 0 || !e.target.className || !e.target.className.indexOf)
			return;
		if (isContain(e.target.className, 'cm-button')) {
			try { _z.fall(e);
				var $btn = e.target, $Id = $btn.id.split('_');
				switch ($Id[0]) {
					case 'pblnk':
						if (!$btn._container) {
							$btn._container = $btn.nextElementSibling.id === 'document_'+ $Id[1] ? $btn.nextElementSibling : _z.setup('div', {'class': 'document-container', 'id': 'document_'+ $Id[1],
								'html': '<span class="mv-frame to-win"></span><iframe frameborder="0" src="//pastebin.com/embed_iframe.php?i='+ $Id[1] +'">'});
						}
						if ($btn._container.inwin) {
							Container.loadFrame($btn._container);
						} else if ($btn.nextElementSibling === $btn._container) {
							$btn._container.remove();
						} else
							_z.after($btn, $btn._container);
						break;
					case 'aflnk':
						_z.each('.cm-stop', function($cm) { $cm.className = 'cm-button cm-play'; })
						if ($btn.nextElementSibling && $btn.nextElementSibling.id === 'audio_'+ $Id[1]) {
							$btn.nextElementSibling.remove();
						} else {
							$btn.className = 'cm-button cm-stop';
							_z.after($btn, Container['Audio']);
							Container['Audio'].id = 'audio_'+ $Id[1];
							Container['Audio'].src = $btn.href;
							Container['Audio'].play();
						}
						break;
					case 'vflnk':
						if (Container['Video'].src !== $btn.href)
							Container['Video'].src = $btn.href;
						if (_EmbedField_ === 0) {
							Container.loadFrame(_z.setup(Container['Video'], {'id': 'video_'+ $Id[1]}));
						} else {
							var $pcont = jumpCont($btn, 'mediacontent'),
								$video = $pcont.querySelector('#video_'+ $Id[1]);
							if ($video) {
								$btn.className = 'cm-button cm-play';
								$video.remove();
							} else {
								$btn.className = 'cm-button cm-stop';
								$video = _z.setup(Container['Video'], {'id': 'video_'+ $Id[1]});
								$pcont.appendChild($video);
								$video.play();
							}
						}
						break;
					case 'imglnk':
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
					case 'pdflnk':
						if (!Container['PDF']) {
							Container['PDF'] = _z.setup('div', {'class': 'pdf-container', 'html': '<iframe frameborder="0" scrolling="auto" width="100%" height="100%">'});
						}
						if (Container['PDF'].id !== 'pdf_'+ $Id[1]) {
							Container['PDF'].firstElementChild.src = '//docs.google.com/gview?embedded=true&url='+ $btn.href;
							Container['PDF'].id = 'pdf_'+ $Id[1]
						}
						Container.loadFrame(Container['PDF']);
						break;
				}
			} catch(log) {
				console.error(log);
			}
		} else if (isContain(e.target.className, 'mv-frame')) {
			if (!e.target.parentNode.inwin) {
				e.target.className = 'mv-frame to-post';
				Container.loadFrame(e.target.parentNode);
				if(!e.target.parentNode.style['width'] && !e.target.parentNode.style['height']) {
					e.target.parentNode.style['width']  = '60%';
					e.target.parentNode.style['height'] = '85%';
				}
			} else {
				e.target.className = 'mv-frame to-win';
				_z.after(document.getElementById('pblnk_'+ e.target.parentNode.id.split('_')[1]), e.target.parentNode);
				Container['Marker'].classList.remove('hidout');
				Container['OVERLAY'].classList.add('hidup');
			}
			e.target.parentNode.inwin = e.target.classList[1] === 'to-post';
		}
	}
	
	function insertListenerS(event){
		if (event.animationName == "init") {
			var $element, $target = event.target;
			switch ($target.id) {
				case 'de-txt-panel':
					if ($target.lastElementChild !== MarkupButtons) {
						MarkupButtons.className = 'buttons-style-'+ ($target.querySelector('.de-abtn') ? 'text' : 'standart');
						$target.appendChild(MarkupButtons);
					}
					break;
				case 'postform':
					if (!_TextArea_) {
						_TextArea_ = _z.setup(document.getElementById('msgbox'), {}, {
							'click': function(e) {this.removeAttribute('class')}
						});
					}
					break;
				default:
					if ($target.className === 'reply de-menu') {
						$element = _z.setup('a', {'class': 'de-menu-item de-src-derpibooru', 'target': '_blank', 'text': 'Поиск по Derpibooru'}, {'click': DerpSearch});
						$target.appendChild($element);
					} else if ($target.tagName === 'BLOCKQUOTE') {
						var scp = $target.querySelectorAll('a[href^="https://soundcloud.com/"], a[href^="http://soundcloud.com/"]');
						if (scp.length > 0) {
							jumpCont($target, 'mediacontent').appendChild(SCPurePlayer.createGroup(scp));
							_z.each(scp, function(a) {
								if (a.nextElementSibling.tagName === 'BR')
									a.nextElementSibling.remove();
								a.remove();
							});
						}
						_z.each($target.querySelectorAll('a[href*="//"]:not(.cm-link):not(.cm-button):not(.irc-reflink):not([href*="soundcloud.com"])'), handleLinks);
					}
			}
		}
	}
	
	_z.setup(window, null, {
		'click': cmButtonHandler,
		'keypress': keyMarks
	});
	
	var pfx = ["webkit", "moz", "MS", "o", ""];
	// animation listener events
	PrefixedEvent("AnimationStart", insertListenerS);
	//PrefixedEvent("AnimationIteration", insertListenerI);
	//PrefixedEvent("AnimationEnd", insertListenerE);
	// apply prefixed event handlers
	function PrefixedEvent(type, callback) {
		for (var p = 0; p < pfx.length; p++) {
			if (!pfx[p]) type = type.toLowerCase();
			document.addEventListener(pfx[p]+type, callback, false);
		}
	}
}/* ===> end <=== */
