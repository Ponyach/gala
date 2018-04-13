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
