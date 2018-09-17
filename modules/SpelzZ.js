
var _z = (function() {
	/* SpelzZ - a lightweight Node Work Tool */
	function __for_each(arr, Fn) {
		Array.prototype.slice.call((typeof arr === 'string' ? document.querySelectorAll(arr) : arr), 0).forEach(Fn);
	}
	function __map(arr, Fn) {
		return Array.prototype.map.call((typeof arr === 'string' ? document.querySelectorAll(arr) : arr), Fn);
	}
	function __node_build(el, _Attrs, _Events) {
		if (el) {
			if (typeof el === 'string') {
				el = document.createElement(el);
			}
			if (_Attrs) {
				for (let key in _Attrs) {
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
						if (Array.isArray(_Events['remove'][type])) {
							_Events['remove'][type].forEach(fn => {
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
	function __find_node(el, search) {
		var target, Find = typeof search === 'function' ? search : () => el.querySelector(search);
		
		while (el) {
			if (target = Find(el)) {
				return (target instanceof Element ? target : el);
			}
			if (!(el = el.parentNode)) {
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
		map  : __map,
		each : __for_each,
		setup: __node_build,
		route: __find_node,
		documentListener: {
			add: __prefixed_listener.bind(null, 'add'),
			rm: __prefixed_listener.bind(null, 'rm')
		},
		replace: function(elems, nodes) { /* to replace with */
			elems = typeof elems === 'string' ? document.querySelectorAll(elems) : elems instanceof Element ? [elems] : elems;
			nodes = nodes instanceof Element ? [nodes] : nodes;
			for (var i = 0, k = nodes.length - 1; i < elems.length; i++) {
				elems[i].parentNode.replaceChild((nodes[i] || nodes[k].cloneNode(true)), elems[i]);
			}
		},
		remove: function(elems) { /* elements to remove */
			var toRm = (child) => { child.parentNode.removeChild(child) };
			elems instanceof Element ? toRm(elems) : __for_each(elems, toRm);
		}
	}
})();
