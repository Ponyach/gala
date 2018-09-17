
/* MD5, SHA512, DES ~ crypt library */
const Crypt = (() => {
	
	const $this = Object.create(null);
	
	const GOODCHARS = './0123456789ABCDEFGABCDEFGHIJKLMNOPQRSTUVWXYZabcdefabcdefghijklmnopqrstuvwxyz';
	const RandChar   = () => GOODCHARS[Math.floor(64 * Math.random())];
	
	function byteToUnsigned(b) {
		var value = Math.floor(b);
		return (value >= 0 ? value : value + 256);
	}

	function fourBytesToInt(b, offset) {
		var value  = byteToUnsigned(b[offset++]);
			value |= (byteToUnsigned(b[offset++]) << 8);
			value |= (byteToUnsigned(b[offset++]) << 16);
			value |= (byteToUnsigned(b[offset++]) << 24);
		return value;
	}

	function _PERM_OP(a, b, n, m, results) {
		var t = ((a >>> n) ^ b) & m;
		a ^= t << n;
		b ^= t;
		results[0] = a;
		results[1] = b;
	}

	function _HPERM_OP(a, n, m) {
		var t = ((a << (16 - n)) ^ a) & m;
		a = a ^ t ^ (t >>> (16 - n));
		return a;
	}

	function DES_setKey(key) {
		var schedule = new Array(32);
		var c = fourBytesToInt(key, 0);
		var d = fourBytesToInt(key, 4);
		var results = new Array(0, 0);
		_PERM_OP(d, c, 4, 0x0f0f0f0f, results);
		d = results[0];
		c = results[1];
		c = _HPERM_OP(c, -2, 0xcccc0000);
		d = _HPERM_OP(d, -2, 0xcccc0000);
		_PERM_OP(d, c, 1, 0x55555555, results);
		d = results[0];
		c = results[1];
		_PERM_OP(c, d, 8, 0x00ff00ff, results);
		c = results[0];
		d = results[1];
		_PERM_OP(d, c, 1, 0x55555555, results);
		d = results[0];
		c = results[1];
		d = (((d & 0x000000ff) << 16) | (d & 0x0000ff00) | ((d & 0x00ff0000) >>> 16) | ((c & 0xf0000000) >>> 4));
		c &= 0x0fffffff;
		var s = 0;
		var t = 0;
		var j = 0;
		for (var i = 0; i < 16; i++) {
			if ($this.shifts2[i]) {
				c = (c >>> 2) | (c << 26);
				d = (d >>> 2) | (d << 26);
			} else {
				c = (c >>> 1) | (c << 27);
				d = (d >>> 1) | (d << 27);
			}
			c &= 0x0fffffff;
			d &= 0x0fffffff;
			s = $this.SKb[0][c & 0x3f] | $this.SKb[1][((c >>> 6) & 0x03) | ((c >>> 7) & 0x3c)] | $this.SKb[2][((c >>> 13) & 0x0f) | ((c >>> 14) & 0x30)] | $this.SKb[3][((c >>> 20) & 0x01) | ((c >>> 21) & 0x06) | ((c >>> 22) & 0x38)];
			t = $this.SKb[4][d & 0x3f] | $this.SKb[5][((d >>> 7) & 0x03) | ((d >>> 8) & 0x3c)] | $this.SKb[6][(d >>> 15) & 0x3f] | $this.SKb[7][((d >>> 21) & 0x0f) | ((d >>> 22) & 0x30)];
			schedule[j++] = ((t << 16) | (s & 0x0000ffff)) & 0xffffffff;
			s = ((s >>> 16) | (t & 0xffff0000));
			s = (s << 4) | (s >>> 28);
			schedule[j++] = s & 0xffffffff;
		}
		return schedule;
	}

	function DES_encrypt(L, R, S, E0, E1, s) {
		var v = R ^ (R >>> 16);
		var u = v & E0;
		v = v & E1;
		u = (u ^ (u << 16)) ^ R ^ s[S];
		var t = (v ^ (v << 16)) ^ R ^ s[S + 1];
		t = (t >>> 4) | (t << 28);
		L ^= $this.SPtrans[1][t & 0x3f] | $this.SPtrans[3][(t >>> 8) & 0x3f] | $this.SPtrans[5][(t >>> 16) & 0x3f] | $this.SPtrans[7][(t >>> 24) & 0x3f] | $this.SPtrans[0][u & 0x3f] | $this.SPtrans[2][(u >>> 8) & 0x3f] | $this.SPtrans[4][(u >>> 16) & 0x3f] | $this.SPtrans[6][(u >>> 24) & 0x3f];
		return L;
	}

	function DES_body(schedule, Eswap0, Eswap1) {
		var left = 0;
		var right = 0;
		var t = 0;
		for (var j = 0; j < 25; j++) {
			for (var i = 0; i < 32; i += 4) {
				left = DES_encrypt(left, right, i, Eswap0, Eswap1, schedule);
				right = DES_encrypt(right, left, i + 2, Eswap0, Eswap1, schedule);
			}
			t = left;
			left = right;
			right = t;
		}
		t = right;
		right = (left >>> 1) | (left << 31);
		left = (t >>> 1) | (t << 31);
		left &= 0xffffffff;
		right &= 0xffffffff;
		var results = new Array(2);
		_PERM_OP(right, left, 1, 0x55555555, results);
		right = results[0];
		left = results[1];
		_PERM_OP(left, right, 8, 0x00ff00ff, results);
		left = results[0];
		right = results[1];
		_PERM_OP(right, left, 2, 0x33333333, results);
		right = results[0];
		left = results[1];
		_PERM_OP(left, right, 16, 0x0000ffff, results);
		left = results[0];
		right = results[1];
		_PERM_OP(right, left, 4, 0x0f0f0f0f, results);
		right = results[0];
		left = results[1];
		return new Array(left, right);
	}

	function DES_crypt(salt, original) {
		
		var length = salt.length;
		
		if (length >= 2) {
			salt = salt.substr(0, 2);
			length = 2;
		}
		for (let i = 0; i < length; i++) {
			salt += RandChar();
		}
		if (/[^./a-zA-Z0-9]/g.test(salt)) {
			salt = RandChar() + RandChar();
		}
		
		var buffer = salt +"           ";
		var key    = new Array(8);
		var length = Math.min(8, original.length);
		
		for (let i = 0; i < length; i++) {
			key[i] = original.charCodeAt(i) << 1;
		}
		
		const b   = new Uint8Array(8);
		const ival = DES_body(
			DES_setKey(key),
			$this.CON_SALT[ salt.charCodeAt(0) ],
			$this.CON_SALT[ salt.charCodeAt(1) ] << 4
		);
		
		for (let i = 0, y = 0; i < 2; i++, y += 4) {
			b[y]   = ((ival[i])        & 0xff);
			b[y+1] = ((ival[i] >>> 8 ) & 0xff);
			b[y+2] = ((ival[i] >>> 16) & 0xff);
			b[y+3] = ((ival[i] >>> 24) & 0xff);
		}
		
		for (let i = 2, y = 0, u = 0x80; i < 13; i++)
		{
			for (let j = 0, c = 0; j < 6; j++) {
				c <<= 1;
				if ((b[y] & u) != 0) c |= 1;
				u >>>= 1;
				if (u == 0) {
					y++;
					u = 0x80;
				}
				buffer = buffer.substr(0, i) + String.fromCharCode($this.CONV_2Char[c]) + buffer.substr(i + 1, buffer.length);
			}
		}
		
		return new Array(buffer, salt);
	}
	
	// Calculate the md5 hash of a string
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
	// + namespaced by: Michael White (http://crestidg.com)
	
	function MD5_crypt( str ) {
		
		const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
		const S21 = 5, S22 = 9 , S23 = 14, S24 = 20;
		const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
		const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
		
		var a = 0x67452301;
		var b = 0xEFCDAB89;
		var c = 0x98BADCFE;
		var d = 0x10325476;
		var x = StrToWords(str);
		
		for (var k = 0; k < x.length; k += 16) {
			let AA = a, BB = b, CC = c, DD = d;
			a=$this.FF(a,b,c,d,x[k+0], S11,0xD76AA478), d=$this.FF(d,a,b,c,x[k+1], S12,0xE8C7B756), c=$this.FF(c,d,a,b,x[k+2], S13,0x242070DB), b=$this.FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=$this.FF(a,b,c,d,x[k+4], S11,0xF57C0FAF), d=$this.FF(d,a,b,c,x[k+5], S12,0x4787C62A), c=$this.FF(c,d,a,b,x[k+6], S13,0xA8304613), b=$this.FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=$this.FF(a,b,c,d,x[k+8], S11,0x698098D8), d=$this.FF(d,a,b,c,x[k+9], S12,0x8B44F7AF), c=$this.FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1), b=$this.FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=$this.FF(a,b,c,d,x[k+12],S11,0x6B901122), d=$this.FF(d,a,b,c,x[k+13],S12,0xFD987193), c=$this.FF(c,d,a,b,x[k+14],S13,0xA679438E), b=$this.FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=$this.GG(a,b,c,d,x[k+1], S21,0xF61E2562), d=$this.GG(d,a,b,c,x[k+6], S22,0xC040B340), c=$this.GG(c,d,a,b,x[k+11],S23,0x265E5A51), b=$this.GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=$this.GG(a,b,c,d,x[k+5], S21,0xD62F105D), d=$this.GG(d,a,b,c,x[k+10],S22,0x2441453 ), c=$this.GG(c,d,a,b,x[k+15],S23,0xD8A1E681), b=$this.GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=$this.GG(a,b,c,d,x[k+9], S21,0x21E1CDE6), d=$this.GG(d,a,b,c,x[k+14],S22,0xC33707D6), c=$this.GG(c,d,a,b,x[k+3], S23,0xF4D50D87), b=$this.GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=$this.GG(a,b,c,d,x[k+13],S21,0xA9E3E905), d=$this.GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8), c=$this.GG(c,d,a,b,x[k+7], S23,0x676F02D9), b=$this.GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=$this.HH(a,b,c,d,x[k+5], S31,0xFFFA3942), d=$this.HH(d,a,b,c,x[k+8], S32,0x8771F681), c=$this.HH(c,d,a,b,x[k+11],S33,0x6D9D6122), b=$this.HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=$this.HH(a,b,c,d,x[k+1], S31,0xA4BEEA44), d=$this.HH(d,a,b,c,x[k+4], S32,0x4BDECFA9), c=$this.HH(c,d,a,b,x[k+7], S33,0xF6BB4B60), b=$this.HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=$this.HH(a,b,c,d,x[k+13],S31,0x289B7EC6), d=$this.HH(d,a,b,c,x[k+0], S32,0xEAA127FA), c=$this.HH(c,d,a,b,x[k+3], S33,0xD4EF3085), b=$this.HH(b,c,d,a,x[k+6], S34,0x4881D05 );
			a=$this.HH(a,b,c,d,x[k+9], S31,0xD9D4D039), d=$this.HH(d,a,b,c,x[k+12],S32,0xE6DB99E5), c=$this.HH(c,d,a,b,x[k+15],S33,0x1FA27CF8), b=$this.HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=$this.II(a,b,c,d,x[k+0], S41,0xF4292244), d=$this.II(d,a,b,c,x[k+7], S42,0x432AFF97), c=$this.II(c,d,a,b,x[k+14],S43,0xAB9423A7), b=$this.II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=$this.II(a,b,c,d,x[k+12],S41,0x655B59C3), d=$this.II(d,a,b,c,x[k+3], S42,0x8F0CCC92), c=$this.II(c,d,a,b,x[k+10],S43,0xFFEFF47D), b=$this.II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=$this.II(a,b,c,d,x[k+8], S41,0x6FA87E4F), d=$this.II(d,a,b,c,x[k+15],S42,0xFE2CE6E0), c=$this.II(c,d,a,b,x[k+6], S43,0xA3014314), b=$this.II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=$this.II(a,b,c,d,x[k+4], S41,0xF7537E82), d=$this.II(d,a,b,c,x[k+11],S42,0xBD3AF235), c=$this.II(c,d,a,b,x[k+2], S43,0x2AD7D2BB), b=$this.II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=$this.safeAdd(a,AA), b=$this.safeAdd(b,BB), c=$this.safeAdd(c,CC), d=$this.safeAdd(d,DD);
		}
		return WordsToStr([a, b, c, d]);
	}
	
	class int64 {
		//A constructor for 64-bit numbers
		constructor(h = 0, l = 0) {
			this.h = h;
			this.l = l;
		}
		//Adds myltiply 64-bit numbers
		//Like the original implementation, does not rely on 32-bit operations
		add(/* a, b, c... */) {
			
			let w = [0,0,0,0];
			let N = arguments;
			
			for (let i = 0; i < N.length; i++) {
				w[0] += N[i].l & 0xffff;
				w[1] += N[i].l >>> 16;
				w[2] += N[i].h & 0xffff;
				w[3] += N[i].h >>> 16;
			}
			
			w[1] += w[0] >>> 16,
			w[2] += w[1] >>> 16,
			w[3] += w[2] >>> 16;
			
			this.l = (w[0] & 0xffff) | (w[1] << 16);
			this.h = (w[2] & 0xffff) | (w[3] << 16);
		}
		//Right-rotates a 64-bit number by shift
		//Won't handle cases of shift >= 32
		//The function revrrot() is for that
		rrot(x, shift) {
			this.l = (x.l >>> shift) | (x.h << (32 - shift));
			this.h = (x.h >>> shift) | (x.l << (32 - shift));
		}
		//Reverses the dwords of the source and then rotates right by shift.
		//This is equivalent to rotation by 32+shift
		revrrot(x, shift) {
			this.l = (x.h >>> shift) | (x.l << (32 - shift));
			this.h = (x.l >>> shift) | (x.h << (32 - shift));
		}
		//Bitwise-shifts right a 64-bit number by shift
		//Won't handle shift>=32, but it's never needed in SHA512
		shr(x, shift) {
			this.l = (x.l >>> shift) | (x.h << (32 - shift));
			this.h = (x.h >>> shift);
		}
		//Copies src into dst, assuming both are 64-bit numbers
		copy(src) {
			this.h = src.h;
			this.l = src.l;
		}
	}
	
	function SHA512_crypt( str ) {
		
		const x = StrToWords(str, true);
		
		//Initial hash values
		const H = new Array(
			new int64( 0x6a09e667  , -205731576  ),
			new int64( -1150833019 , -2067093701 ),
			new int64( 0x3c6ef372  , -23791573   ),
			new int64( -1521486534 , 0x5f1d36f1  ),
			new int64( 0x510e527f  , -1377402159 ),
			new int64( -1694144372 , 0x2b3e6c1f  ),
			new int64( 0x1f83d9ab  , -79577749   ),
			new int64( 0x5be0cd19  , 0x137e2179  )
		);
		
		const T1 = new int64,
		      T2 = new int64,
		
		       a = new int64, e = new int64,
		       b = new int64, f = new int64,
		       c = new int64, g = new int64,
		       d = new int64, h = new int64,
		      //Temporary variables not specified by the document
		      s0 = new int64,
		      s1 = new int64,
		      Ch = new int64,
		     Maj = new int64,
		      r1 = new int64,
		      r2 = new int64,
		      r3 = new int64,
		
		       W = new Array (80);
		
		for (let i = 0; i < 80; i++) {
			W[i] = new int64;
		}
		
		for (let i = 0; i < x.length; i += 32) { //32 dwords is the block size
			
			a.copy( H[0] ); e.copy( H[4] );
			b.copy( H[1] ); f.copy( H[5] );
			c.copy( H[2] ); g.copy( H[6] );
			d.copy( H[3] ); h.copy( H[7] );
			
			for (let j = 0; j < 16; j++) {
				W[j].h = x[ i + 2 * j ];
				W[j].l = x[ i + 2 * j + 1];
			}
			
			for (let j = 16; j < 80; j++) {
				//sigma1
				r1.rrot(    W[j-2], 19);
				r2.revrrot( W[j-2], 29);
				r3.shr(     W[j-2], 6 );
				s1.l = r1.l ^ r2.l ^ r3.l;
				s1.h = r1.h ^ r2.h ^ r3.h;
				//sigma0
				r1.rrot( W[j-15], 1);
				r2.rrot( W[j-15], 8);
				r3.shr(  W[j-15], 7);
				s0.l = r1.l ^ r2.l ^ r3.l;
				s0.h = r1.h ^ r2.h ^ r3.h;
				
				W[j].add(s1, W[j-7], s0, W[j-16]);
			}
			
			for (let j = 0; j < 80; j++) {
				//Ch
				Ch.l = (e.l & f.l) ^ (~e.l & g.l);
				Ch.h = (e.h & f.h) ^ (~e.h & g.h);
				
				//Sigma1
				r1.rrot(e, 14);
				r2.rrot(e, 18);
				r3.revrrot(e, 9);
				s1.l = r1.l ^ r2.l ^ r3.l;
				s1.h = r1.h ^ r2.h ^ r3.h;
				
				//Sigma0
				r1.rrot(a, 28);
				r2.revrrot(a, 2);
				r3.revrrot(a, 7);
				s0.l = r1.l ^ r2.l ^ r3.l;
				s0.h = r1.h ^ r2.h ^ r3.h;
				
				//Maj
				Maj.l = (a.l & b.l) ^ (a.l & c.l) ^ (b.l & c.l);
				Maj.h = (a.h & b.h) ^ (a.h & c.h) ^ (b.h & c.h);
				
				T1.add(h, s1, Ch, $this.sha512[j], W[j]);
				T2.add(s0, Maj);
				
				h.copy(g);
				g.copy(f);
				f.copy(e);
				e.add(d, T1);
				
				d.copy(c);
				c.copy(b);
				b.copy(a);
				a.add(T1, T2);
			}
			H[0].add( H[0], a ); H[4].add( H[4], e );
			H[1].add( H[1], b ); H[5].add( H[5], f );
			H[2].add( H[2], c ); H[6].add( H[6], g );
			H[3].add( H[3], d ); H[7].add( H[7], h );
		}
		//represent the hash as an array of 32-bit dwords
		var hash = new Array(16);
		for (let i = 0; i < 8; i++) {
			hash[2 * i]     = H[i].h;
			hash[2 * i + 1] = H[i].l;
		}
		return WordsToStr(hash, true);
	}
	
	/*
	 * Convert an array of little-endian (default) or big-endian words to a string
	 */
	function WordsToStr( words, be = false ) {
		
		const length = words.length * 32;
		const hexchr = '0123456789abcdef';
		const and    = be ? (j) => (24 - j % 32) : (j) => (j % 32);
		
		for (var str = '', i = 0; i < length; i += 8) {
			let x = (words[ i >> 5 ] >>> and(i)) & 0xFF;
			str  += hexchr.charAt((x >>> 4) & 0x0F)
			     +  hexchr.charAt( x        & 0x0F);
		}
		return str;
	}
	
	/*
	 * Convert a raw string to an array of little-endian (default) or big-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	function StrToWords( str, be = false ) {
		
		const length = str.length * 8;
		const words  = new Array(str.length >> 2);
		const and    = be ? (j) => (24 - j % 32) : (j) => (j % 32);
		
		for (let i = 0; i < words.length; i++) {
			words[i] = 0;
		}
		for (let i = 0; i < length; i += 8) {
			words[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << and(i);
		}
		// append padding to the source string. The format is described in the FIPS.
		if (be) {
			words[   length >> 5 ] |= 128 << (24 - (length & 0x1F));
			words[ ((length + 128 >> 10) << 5) + 31 ] = length;
		} else {
			words[   length >> 5 ] |= 128 <<       (length % 32);
			words[ ((length + 64 >>> 9)  << 4) + 14 ] = length;
		}
		return words;
	}
	
	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	function UTF8_encode(str) {
	
		const length = (str = str.replace(/\r\n/g, "\n")).length;
	
		for (var char = '', i = 0; i <= length; i++) {
			
			let code = str.charCodeAt(i);
			
			/* Decode utf-16 surrogate pairs */
			let su = i + 1 < length ? str.charCodeAt(i + 1) : 0;
			if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= su && su <= 0xDFFF) {
				code = 0x10000 + ((code & 0x03FF) << 10) + (su & 0x03FF);
				i++;
			}
			
			if (code <= 0x7F) {
				char += String.fromCharCode (code);
			} else
			if (code <= 0x7FF) {
				char += String.fromCharCode (0xC0 | ((code >>> 6 ) & 0x1F),
				                             0x80 | ( code         & 0x3F));
			} else
			if (code <= 0xFFFF) {
				char += String.fromCharCode (0xE0 | ((code >>> 12) & 0x0F),
				                             0x80 | ((code >>> 6 ) & 0x3F),
				                             0x80 | ( code         & 0x3F));
			} else
			if (code <= 0x1FFFFF) {
				char += String.fromCharCode (0xF0 | ((code >>> 18) & 0x07),
				                             0x80 | ((code >>> 12) & 0x3F),
				                             0x80 | ((code >>> 6 ) & 0x3F),
				                             0x80 | ( code         & 0x3F));
			}
		}
		return char;
	}
	
	return class self {
		
		static DES(slt, key, enc = true) {
			self.init_des_const();
			
			return DES_crypt( slt, enc ? UTF8_encode(key) : key );
		}
		
		static MD5( str, enc = true ) {
			self.init_md5_const();
			
			return MD5_crypt( enc ? UTF8_encode(str) : str );
		}
		
		static SHA512( str, enc = true ) {
			self.init_sha512_const();
			
			return SHA512_crypt( str ? UTF8_encode(str) : str );
		}
		
		static init_md5_const() {
			
			const _F = (x,y,z) => (x & y) | ((~x) & z);
			const _G = (x,y,z) => (x & z) | (y & (~z));
			const _H = (x,y,z) => (x ^ y ^ z);
			const _I = (x,y,z) => (y ^ (x | (~z)));
			
			const bitRot = (a,b) => (a << b) | (a >>> (32 - b));
			
			$this.FF = (a,b,c,d,x,s,ac) => safeAdd( bitRot( safeAdd(a, safeAdd( safeAdd( _F(b, c, d), x), ac)), s), b);
			$this.GG = (a,b,c,d,x,s,ac) => safeAdd( bitRot( safeAdd(a, safeAdd( safeAdd( _G(b, c, d), x), ac)), s), b);
			$this.HH = (a,b,c,d,x,s,ac) => safeAdd( bitRot( safeAdd(a, safeAdd( safeAdd( _H(b, c, d), x), ac)), s), b);
			$this.II = (a,b,c,d,x,s,ac) => safeAdd( bitRot( safeAdd(a, safeAdd( safeAdd( _I(b, c, d), x), ac)), s), b);
			
			$this.safeAdd = safeAdd;
			
			function safeAdd(a, d) {
				let c = (a & 0xFFFF) + (d & 0xFFFF),
				    b = (a >> 16) + (d >> 16) + (c >> 16);
				return  (b << 16) | (c & 0xFFFF);
			};
			
			Object.defineProperty(self, 'init_md5_const', { value: () => 'use strict' });
			
			return 'use strict';
		}
		
		static init_sha512_const() {
			
			//SHA512 constants
			$this.sha512 = new Array(
				{ h: 0x428a2f98 , l: -685199838  }, { h: 0x71374491 , l: 0x23ef65cd  }, { h: -1245643825, l: -330482897  }, { h: -373957723 , l: -2121671748 },
				{ h: 0x3956c25b , l: -213338824  }, { h: 0x59f111f1 , l: -1241133031 }, { h: -1841331548, l: -1357295717 }, { h: -1424204075, l: -630357736  },
				{ h: -670586216 , l: -1560083902 }, { h: 0x12835b01 , l: 0x45706fbe  }, { h: 0x243185be , l: 0x4ee4b28c  }, { h: 0x550c7dc3 , l: -704662302  },
				{ h: 0x72be5d74 , l: -226784913  }, { h: -2132889090, l: 0x3b1696b1  }, { h: -1680079193, l: 0x25c71235  }, { h: -1046744716, l: -815192428  },
				{ h: -459576895 , l: -1628353838 }, { h: -272742522 , l: 0x384f25e3  }, { h: 0xfc19dc6  , l: -1953704523 }, { h: 0x240ca1cc , l: 0x77ac9c65  },
				{ h: 0x2de92c6f , l: 0x592b0275  }, { h: 0x4a7484aa , l: 0x6ea6e483  }, { h: 0x5cb0a9dc , l: -1119749164 }, { h: 0x76f988da , l: -2096016459 },
				{ h: -1740746414, l: -295247957  }, { h: -1473132947, l: 0x2db43210  }, { h: -1341970488, l: -1728372417 }, { h: -1084653625, l: -1091629340 },
				{ h: -958395405 , l: 0x3da88fc2  }, { h: -710438585 , l: -1828018395 }, { h: 0x6ca6351  , l: -536640913  }, { h: 0x14292967 , l: 0xa0e6e70   },
				{ h: 0x27b70a85 , l: 0x46d22ffc  }, { h: 0x2e1b2138 , l: 0x5c26c926  }, { h: 0x4d2c6dfc , l: 0x5ac42aed  }, { h: 0x53380d13 , l: -1651133473 },
				{ h: 0x650a7354 , l: -1951439906 }, { h: 0x766a0abb , l: 0x3c77b2a8  }, { h: -2117940946, l: 0x47edaee6  }, { h: -1838011259, l: 0x1482353b  },
				{ h: -1564481375, l: 0x4cf10364  }, { h: -1474664885, l: -1136513023 }, { h: -1035236496, l: -789014639  }, { h: -949202525 , l: 0x654be30   },
				{ h: -778901479 , l: -688958952  }, { h: -694614492 , l: 0x5565a910  }, { h: -200395387 , l: 0x5771202a  }, { h: 0x106aa070 , l: 0x32bbd1b8  },
				{ h: 0x19a4c116 , l: -1194143544 }, { h: 0x1e376c08 , l: 0x5141ab53  }, { h: 0x2748774c , l: -544281703  }, { h: 0x34b0bcb5 , l: -509917016  },
				{ h: 0x391c0cb3 , l: -976659869  }, { h: 0x4ed8aa4a , l: -482243893  }, { h: 0x5b9cca4f , l: 0x7763e373  }, { h: 0x682e6ff3 , l: -692930397  },
				{ h: 0x748f82ee , l: 0x5defb2fc  }, { h: 0x78a5636f , l: 0x43172f60  }, { h: -2067236844, l: -1578062990 }, { h: -1933114872, l: 0x1a6439ec  },
				{ h: -1866530822, l: 0x23631e28  }, { h: -1538233109, l: -561857047  }, { h: -1090935817, l: -1295615723 }, { h: -965641998 , l: -479046869  },
				{ h: -903397682 , l: -366583396  }, { h: -779700025 , l: 0x21c0c207  }, { h: -354779690 , l: -840897762  }, { h: -176337025 , l: -294727304  },
				{ h: 0x6f067aa  , l: 0x72176fba  }, { h: 0xa637dc5  , l: -1563912026 }, { h: 0x113f9804 , l: -1090974290 }, { h: 0x1b710b35 , l: 0x131c471b  },
				{ h: 0x28db77f5 , l: 0x23047d84  }, { h: 0x32caab7b , l: 0x40c72493  }, { h: 0x3c9ebe0a , l: 0x15c9bebc  }, { h: 0x431d67c4 , l: -1676669620 },
				{ h: 0x4cc5d4be , l: -885112138  }, { h: 0x597f299c , l: -60457430   }, { h: 0x5fcb6fab , l: 0x3ad6faec  }, { h: 0x6c44198c , l: 0x4a475817  }
			);
			
			Object.defineProperty(self, 'init_sha512_const', { value: () => 'use strict' });
			
			return 'use strict';
		}
		
		static init_des_const() {
			
			$this.CON_SALT = [
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
				0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
				0x0A, 0x0B, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A,
				0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12,
				0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A,
				0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21, 0x22,
				0x23, 0x24, 0x25, 0x20, 0x21, 0x22, 0x23, 0x24,
				0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C,
				0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32, 0x33, 0x34,
				0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C,
				0x3D, 0x3E, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00];
				
			$this.CONV_2Char = [
				0x2E, 0x2F, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35,
				0x36, 0x37, 0x38, 0x39, 0x41, 0x42, 0x43, 0x44,
				0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B, 0x4C,
				0x4D, 0x4E, 0x4F, 0x50, 0x51, 0x52, 0x53, 0x54,
				0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x61, 0x62,
				0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A,
				0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70, 0x71, 0x72,
				0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A];
				
			$this.shifts2 = [
				false, false, true, true, true, true, true, true,
				false, true, true, true, true, true, true, false];
				
			$this.SKb = {
				0: new Array(
					0x00000000, 0x00000010, 0x20000000, 0x20000010,
					0x00010000, 0x00010010, 0x20010000, 0x20010010,
					0x00000800, 0x00000810, 0x20000800, 0x20000810,
					0x00010800, 0x00010810, 0x20010800, 0x20010810,
					0x00000020, 0x00000030, 0x20000020, 0x20000030,
					0x00010020, 0x00010030, 0x20010020, 0x20010030,
					0x00000820, 0x00000830, 0x20000820, 0x20000830,
					0x00010820, 0x00010830, 0x20010820, 0x20010830,
					0x00080000, 0x00080010, 0x20080000, 0x20080010,
					0x00090000, 0x00090010, 0x20090000, 0x20090010,
					0x00080800, 0x00080810, 0x20080800, 0x20080810,
					0x00090800, 0x00090810, 0x20090800, 0x20090810,
					0x00080020, 0x00080030, 0x20080020, 0x20080030,
					0x00090020, 0x00090030, 0x20090020, 0x20090030,
					0x00080820, 0x00080830, 0x20080820, 0x20080830,
					0x00090820, 0x00090830, 0x20090820, 0x20090830),
				1: new Array(
					0x00000000, 0x02000000, 0x00002000, 0x02002000,
					0x00200000, 0x02200000, 0x00202000, 0x02202000,
					0x00000004, 0x02000004, 0x00002004, 0x02002004,
					0x00200004, 0x02200004, 0x00202004, 0x02202004,
					0x00000400, 0x02000400, 0x00002400, 0x02002400,
					0x00200400, 0x02200400, 0x00202400, 0x02202400,
					0x00000404, 0x02000404, 0x00002404, 0x02002404,
					0x00200404, 0x02200404, 0x00202404, 0x02202404,
					0x10000000, 0x12000000, 0x10002000, 0x12002000,
					0x10200000, 0x12200000, 0x10202000, 0x12202000,
					0x10000004, 0x12000004, 0x10002004, 0x12002004,
					0x10200004, 0x12200004, 0x10202004, 0x12202004,
					0x10000400, 0x12000400, 0x10002400, 0x12002400,
					0x10200400, 0x12200400, 0x10202400, 0x12202400,
					0x10000404, 0x12000404, 0x10002404, 0x12002404,
					0x10200404, 0x12200404, 0x10202404, 0x12202404),
				2: new Array(
					0x00000000, 0x00000001, 0x00040000, 0x00040001,
					0x01000000, 0x01000001, 0x01040000, 0x01040001,
					0x00000002, 0x00000003, 0x00040002, 0x00040003,
					0x01000002, 0x01000003, 0x01040002, 0x01040003,
					0x00000200, 0x00000201, 0x00040200, 0x00040201,
					0x01000200, 0x01000201, 0x01040200, 0x01040201,
					0x00000202, 0x00000203, 0x00040202, 0x00040203,
					0x01000202, 0x01000203, 0x01040202, 0x01040203,
					0x08000000, 0x08000001, 0x08040000, 0x08040001,
					0x09000000, 0x09000001, 0x09040000, 0x09040001,
					0x08000002, 0x08000003, 0x08040002, 0x08040003,
					0x09000002, 0x09000003, 0x09040002, 0x09040003,
					0x08000200, 0x08000201, 0x08040200, 0x08040201,
					0x09000200, 0x09000201, 0x09040200, 0x09040201,
					0x08000202, 0x08000203, 0x08040202, 0x08040203,
					0x09000202, 0x09000203, 0x09040202, 0x09040203),
				3: new Array(
					0x00000000, 0x00100000, 0x00000100, 0x00100100,
					0x00000008, 0x00100008, 0x00000108, 0x00100108,
					0x00001000, 0x00101000, 0x00001100, 0x00101100,
					0x00001008, 0x00101008, 0x00001108, 0x00101108,
					0x04000000, 0x04100000, 0x04000100, 0x04100100,
					0x04000008, 0x04100008, 0x04000108, 0x04100108,
					0x04001000, 0x04101000, 0x04001100, 0x04101100,
					0x04001008, 0x04101008, 0x04001108, 0x04101108,
					0x00020000, 0x00120000, 0x00020100, 0x00120100,
					0x00020008, 0x00120008, 0x00020108, 0x00120108,
					0x00021000, 0x00121000, 0x00021100, 0x00121100,
					0x00021008, 0x00121008, 0x00021108, 0x00121108,
					0x04020000, 0x04120000, 0x04020100, 0x04120100,
					0x04020008, 0x04120008, 0x04020108, 0x04120108,
					0x04021000, 0x04121000, 0x04021100, 0x04121100,
					0x04021008, 0x04121008, 0x04021108, 0x04121108),
				4: new Array(
					0x00000000, 0x10000000, 0x00010000, 0x10010000,
					0x00000004, 0x10000004, 0x00010004, 0x10010004,
					0x20000000, 0x30000000, 0x20010000, 0x30010000,
					0x20000004, 0x30000004, 0x20010004, 0x30010004,
					0x00100000, 0x10100000, 0x00110000, 0x10110000,
					0x00100004, 0x10100004, 0x00110004, 0x10110004,
					0x20100000, 0x30100000, 0x20110000, 0x30110000,
					0x20100004, 0x30100004, 0x20110004, 0x30110004,
					0x00001000, 0x10001000, 0x00011000, 0x10011000,
					0x00001004, 0x10001004, 0x00011004, 0x10011004,
					0x20001000, 0x30001000, 0x20011000, 0x30011000,
					0x20001004, 0x30001004, 0x20011004, 0x30011004,
					0x00101000, 0x10101000, 0x00111000, 0x10111000,
					0x00101004, 0x10101004, 0x00111004, 0x10111004,
					0x20101000, 0x30101000, 0x20111000, 0x30111000,
					0x20101004, 0x30101004, 0x20111004, 0x30111004),
				5: new Array(
					0x00000000, 0x08000000, 0x00000008, 0x08000008,
					0x00000400, 0x08000400, 0x00000408, 0x08000408,
					0x00020000, 0x08020000, 0x00020008, 0x08020008,
					0x00020400, 0x08020400, 0x00020408, 0x08020408,
					0x00000001, 0x08000001, 0x00000009, 0x08000009,
					0x00000401, 0x08000401, 0x00000409, 0x08000409,
					0x00020001, 0x08020001, 0x00020009, 0x08020009,
					0x00020401, 0x08020401, 0x00020409, 0x08020409,
					0x02000000, 0x0A000000, 0x02000008, 0x0A000008,
					0x02000400, 0x0A000400, 0x02000408, 0x0A000408,
					0x02020000, 0x0A020000, 0x02020008, 0x0A020008,
					0x02020400, 0x0A020400, 0x02020408, 0x0A020408,
					0x02000001, 0x0A000001, 0x02000009, 0x0A000009,
					0x02000401, 0x0A000401, 0x02000409, 0x0A000409,
					0x02020001, 0x0A020001, 0x02020009, 0x0A020009,
					0x02020401, 0x0A020401, 0x02020409, 0x0A020409),
				6: new Array(
					0x00000000, 0x00000100, 0x00080000, 0x00080100,
					0x01000000, 0x01000100, 0x01080000, 0x01080100,
					0x00000010, 0x00000110, 0x00080010, 0x00080110,
					0x01000010, 0x01000110, 0x01080010, 0x01080110,
					0x00200000, 0x00200100, 0x00280000, 0x00280100,
					0x01200000, 0x01200100, 0x01280000, 0x01280100,
					0x00200010, 0x00200110, 0x00280010, 0x00280110,
					0x01200010, 0x01200110, 0x01280010, 0x01280110,
					0x00000200, 0x00000300, 0x00080200, 0x00080300,
					0x01000200, 0x01000300, 0x01080200, 0x01080300,
					0x00000210, 0x00000310, 0x00080210, 0x00080310,
					0x01000210, 0x01000310, 0x01080210, 0x01080310,
					0x00200200, 0x00200300, 0x00280200, 0x00280300,
					0x01200200, 0x01200300, 0x01280200, 0x01280300,
					0x00200210, 0x00200310, 0x00280210, 0x00280310,
					0x01200210, 0x01200310, 0x01280210, 0x01280310),
				7: new Array(
					0x00000000, 0x04000000, 0x00040000, 0x04040000,
					0x00000002, 0x04000002, 0x00040002, 0x04040002,
					0x00002000, 0x04002000, 0x00042000, 0x04042000,
					0x00002002, 0x04002002, 0x00042002, 0x04042002,
					0x00000020, 0x04000020, 0x00040020, 0x04040020,
					0x00000022, 0x04000022, 0x00040022, 0x04040022,
					0x00002020, 0x04002020, 0x00042020, 0x04042020,
					0x00002022, 0x04002022, 0x00042022, 0x04042022,
					0x00000800, 0x04000800, 0x00040800, 0x04040800,
					0x00000802, 0x04000802, 0x00040802, 0x04040802,
					0x00002800, 0x04002800, 0x00042800, 0x04042800,
					0x00002802, 0x04002802, 0x00042802, 0x04042802,
					0x00000820, 0x04000820, 0x00040820, 0x04040820,
					0x00000822, 0x04000822, 0x00040822, 0x04040822,
					0x00002820, 0x04002820, 0x00042820, 0x04042820,
					0x00002822, 0x04002822, 0x00042822, 0x04042822)
			}
			
			$this.SPtrans = {
				0: new Array(
					0x00820200, 0x00020000, 0x80800000, 0x80820200,
					0x00800000, 0x80020200, 0x80020000, 0x80800000,
					0x80020200, 0x00820200, 0x00820000, 0x80000200,
					0x80800200, 0x00800000, 0x00000000, 0x80020000,
					0x00020000, 0x80000000, 0x00800200, 0x00020200,
					0x80820200, 0x00820000, 0x80000200, 0x00800200,
					0x80000000, 0x00000200, 0x00020200, 0x80820000,
					0x00000200, 0x80800200, 0x80820000, 0x00000000,
					0x00000000, 0x80820200, 0x00800200, 0x80020000,
					0x00820200, 0x00020000, 0x80000200, 0x00800200,
					0x80820000, 0x00000200, 0x00020200, 0x80800000,
					0x80020200, 0x80000000, 0x80800000, 0x00820000,
					0x80820200, 0x00020200, 0x00820000, 0x80800200,
					0x00800000, 0x80000200, 0x80020000, 0x00000000,
					0x00020000, 0x00800000, 0x80800200, 0x00820200,
					0x80000000, 0x80820000, 0x00000200, 0x80020200),
				1: new Array(
					0x10042004, 0x00000000, 0x00042000, 0x10040000,
					0x10000004, 0x00002004, 0x10002000, 0x00042000,
					0x00002000, 0x10040004, 0x00000004, 0x10002000,
					0x00040004, 0x10042000, 0x10040000, 0x00000004,
					0x00040000, 0x10002004, 0x10040004, 0x00002000,
					0x00042004, 0x10000000, 0x00000000, 0x00040004,
					0x10002004, 0x00042004, 0x10042000, 0x10000004,
					0x10000000, 0x00040000, 0x00002004, 0x10042004,
					0x00040004, 0x10042000, 0x10002000, 0x00042004,
					0x10042004, 0x00040004, 0x10000004, 0x00000000,
					0x10000000, 0x00002004, 0x00040000, 0x10040004,
					0x00002000, 0x10000000, 0x00042004, 0x10002004,
					0x10042000, 0x00002000, 0x00000000, 0x10000004,
					0x00000004, 0x10042004, 0x00042000, 0x10040000,
					0x10040004, 0x00040000, 0x00002004, 0x10002000,
					0x10002004, 0x00000004, 0x10040000, 0x00042000),
				2: new Array(
					0x41000000, 0x01010040, 0x00000040, 0x41000040,
					0x40010000, 0x01000000, 0x41000040, 0x00010040,
					0x01000040, 0x00010000, 0x01010000, 0x40000000,
					0x41010040, 0x40000040, 0x40000000, 0x41010000,
					0x00000000, 0x40010000, 0x01010040, 0x00000040,
					0x40000040, 0x41010040, 0x00010000, 0x41000000,
					0x41010000, 0x01000040, 0x40010040, 0x01010000,
					0x00010040, 0x00000000, 0x01000000, 0x40010040,
					0x01010040, 0x00000040, 0x40000000, 0x00010000,
					0x40000040, 0x40010000, 0x01010000, 0x41000040,
					0x00000000, 0x01010040, 0x00010040, 0x41010000,
					0x40010000, 0x01000000, 0x41010040, 0x40000000,
					0x40010040, 0x41000000, 0x01000000, 0x41010040,
					0x00010000, 0x01000040, 0x41000040, 0x00010040,
					0x01000040, 0x00000000, 0x41010000, 0x40000040,
					0x41000000, 0x40010040, 0x00000040, 0x01010000),
				3: new Array(
					0x00100402, 0x04000400, 0x00000002, 0x04100402,
					0x00000000, 0x04100000, 0x04000402, 0x00100002,
					0x04100400, 0x04000002, 0x04000000, 0x00000402,
					0x04000002, 0x00100402, 0x00100000, 0x04000000,
					0x04100002, 0x00100400, 0x00000400, 0x00000002,
					0x00100400, 0x04000402, 0x04100000, 0x00000400,
					0x00000402, 0x00000000, 0x00100002, 0x04100400,
					0x04000400, 0x04100002, 0x04100402, 0x00100000,
					0x04100002, 0x00000402, 0x00100000, 0x04000002,
					0x00100400, 0x04000400, 0x00000002, 0x04100000,
					0x04000402, 0x00000000, 0x00000400, 0x00100002,
					0x00000000, 0x04100002, 0x04100400, 0x00000400,
					0x04000000, 0x04100402, 0x00100402, 0x00100000,
					0x04100402, 0x00000002, 0x04000400, 0x00100402,
					0x00100002, 0x00100400, 0x04100000, 0x04000402,
					0x00000402, 0x04000000, 0x04000002, 0x04100400),
				4: new Array(
					0x02000000, 0x00004000, 0x00000100, 0x02004108,
					0x02004008, 0x02000100, 0x00004108, 0x02004000,
					0x00004000, 0x00000008, 0x02000008, 0x00004100,
					0x02000108, 0x02004008, 0x02004100, 0x00000000,
					0x00004100, 0x02000000, 0x00004008, 0x00000108,
					0x02000100, 0x00004108, 0x00000000, 0x02000008,
					0x00000008, 0x02000108, 0x02004108, 0x00004008,
					0x02004000, 0x00000100, 0x00000108, 0x02004100,
					0x02004100, 0x02000108, 0x00004008, 0x02004000,
					0x00004000, 0x00000008, 0x02000008, 0x02000100,
					0x02000000, 0x00004100, 0x02004108, 0x00000000,
					0x00004108, 0x02000000, 0x00000100, 0x00004008,
					0x02000108, 0x00000100, 0x00000000, 0x02004108,
					0x02004008, 0x02004100, 0x00000108, 0x00004000,
					0x00004100, 0x02004008, 0x02000100, 0x00000108,
					0x00000008, 0x00004108, 0x02004000, 0x02000008),
				5: new Array(
					0x20000010, 0x00080010, 0x00000000, 0x20080800,
					0x00080010, 0x00000800, 0x20000810, 0x00080000,
					0x00000810, 0x20080810, 0x00080800, 0x20000000,
					0x20000800, 0x20000010, 0x20080000, 0x00080810,
					0x00080000, 0x20000810, 0x20080010, 0x00000000,
					0x00000800, 0x00000010, 0x20080800, 0x20080010,
					0x20080810, 0x20080000, 0x20000000, 0x00000810,
					0x00000010, 0x00080800, 0x00080810, 0x20000800,
					0x00000810, 0x20000000, 0x20000800, 0x00080810,
					0x20080800, 0x00080010, 0x00000000, 0x20000800,
					0x20000000, 0x00000800, 0x20080010, 0x00080000,
					0x00080010, 0x20080810, 0x00080800, 0x00000010,
					0x20080810, 0x00080800, 0x00080000, 0x20000810,
					0x20000010, 0x20080000, 0x00080810, 0x00000000,
					0x00000800, 0x20000010, 0x20000810, 0x20080800,
					0x20080000, 0x00000810, 0x00000010, 0x20080010),
				6: new Array(
					0x00001000, 0x00000080, 0x00400080, 0x00400001,
					0x00401081, 0x00001001, 0x00001080, 0x00000000,
					0x00400000, 0x00400081, 0x00000081, 0x00401000,
					0x00000001, 0x00401080, 0x00401000, 0x00000081,
					0x00400081, 0x00001000, 0x00001001, 0x00401081,
					0x00000000, 0x00400080, 0x00400001, 0x00001080,
					0x00401001, 0x00001081, 0x00401080, 0x00000001,
					0x00001081, 0x00401001, 0x00000080, 0x00400000,
					0x00001081, 0x00401000, 0x00401001, 0x00000081,
					0x00001000, 0x00000080, 0x00400000, 0x00401001,
					0x00400081, 0x00001081, 0x00001080, 0x00000000,
					0x00000080, 0x00400001, 0x00000001, 0x00400080,
					0x00000000, 0x00400081, 0x00400080, 0x00001080,
					0x00000081, 0x00001000, 0x00401081, 0x00400000,
					0x00401080, 0x00000001, 0x00001001, 0x00401081,
					0x00400001, 0x00401080, 0x00401000, 0x00001001),
				7: new Array(
					0x08200020, 0x08208000, 0x00008020, 0x00000000,
					0x08008000, 0x00200020, 0x08200000, 0x08208020,
					0x00000020, 0x08000000, 0x00208000, 0x00008020,
					0x00208020, 0x08008020, 0x08000020, 0x08200000,
					0x00008000, 0x00208020, 0x00200020, 0x08008000,
					0x08208020, 0x08000020, 0x00000000, 0x00208000,
					0x08000000, 0x00200000, 0x08008020, 0x08200020,
					0x00200000, 0x00008000, 0x08208000, 0x00000020,
					0x00200000, 0x00008000, 0x08000020, 0x08208020,
					0x00008020, 0x08000000, 0x00000000, 0x00208000,
					0x08200020, 0x08008020, 0x08008000, 0x00200020,
					0x08208000, 0x00000020, 0x00200020, 0x08008000,
					0x08208020, 0x00200000, 0x08200000, 0x08000020,
					0x00208000, 0x00008020, 0x08008020, 0x08200000,
					0x00000020, 0x08208000, 0x00208020, 0x00000000,
					0x08000000, 0x08200020, 0x00008000, 0x00208020)
			}
			
			Object.defineProperty(self, 'init_des_const', { value: () => 'use strict' });
			
			return 'use strict';
		}
	}
})();
