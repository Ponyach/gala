/*
	PHP to Javascript compatibility Layer
*/
var array  = Array;
var chop   = rtrim;
var count  = strlen;
var mb_strlen = strlen;
var mb_substr = substr;
var mb_strpos = strpos;
var rawurldecode = decodeURI;
var array_search = strpos;

function strlen( $string ) {
	return $string.length;
}

function method_exists($object, $method_name) {
	return $method_name in $object;
}

function trim( $str, $character_mask = '\s\t\n\r\x00\x0B' ) { // http://php.net/manual/ru/function.trim.php

	return $str.replace(new RegExp ("^["+$character_mask+"]+|["+$character_mask+"]+$", 'g'), '');
}

function rtrim( $str, $character_mask = '\s\t\n\r\x00\x0B' ) { // http://php.net/manual/ru/function.rtrim.php

	return $str.replace(new RegExp ("["+$character_mask+"]+$", 'g'), '');
}

function ltrim( $str, $character_mask = '\s\t\n\r\x00\x0B' ) { // http://php.net/manual/ru/function.ltrim.php

	return $str.replace(new RegExp ("^["+$character_mask+"]+", 'g'), '');
}

function preg_quote( $str, $delimiter ) { // http://php.net/manual/ru/function.preg-quote.php

	let $character_mask = /\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-/.source;

	if ($delimiter) {
		$character_mask += '\\'+ $delimiter.split('').join('\\');
	}

	return $str.replace(new RegExp ("(["+ $character_mask +"])", 'g'), "\\$1");
}

function preg_split( $pattern, $subject ) { // http://php.net/manual/ru/function.preg-split.php

	return $subject.split( $pattern );
}

function preg_match( $pattern, $subject, $matches = [], $flags ) { // http://php.net/manual/ru/function.preg-match.php

	if ($pattern = $subject.match( $pattern )) {
	
		switch ($flags) {
		case 'PREG_UNMATCHED_AS_NULL': $pattern = $pattern.map(key => (key || null)); break;
		case 'PREG_OFFSET_CAPTURE'   : $pattern = $pattern.map(key => [key, $subject.indexOf(key)]); break;
		}
	
		return Object.assign( $matches, $pattern ).length;
	}

	return false;
}

function preg_replace( $pattern, $replacement, $subject ) { // http://php.net/manual/ru/function.preg-replace.php

	if (Array.isArray($subject)) {
		return $subject.map($str => preg_replace( $pattern, $replacement, $str ));
	}

	if (Array.isArray($pattern)) {
	
		if (!Array.isArray($replacement))
			$replacement = $pattern.map(() => $replacement);
	
		for (var i = 0; i < $pattern.length; i++) {
			$subject = $subject.replace($pattern[i], ($replacement[i] || ''));
		}
	} else {
		$subject.replace($pattern, $replacement);
	}

	return $subject;
}

function preg_replace_callback ( $pattern , $callback , $subject ) { // http://php.net/manual/ru/function.preg-replace-callback.php

	return (new Array).concat($pattern).map(arg => $callback( $subject.match( arg )));
}

function isset() { // http://php.net/manual/ru/function.isset.php

	return Object.values( arguments ).every( key => key !== undefined && key !== null );
}

function explode( $delimiter, $str ) { // http://php.net/manual/ru/function.explode.php

	return $str.split( $delimiter );
}

function join( $glue, $pieces ) { // http://php.net/manual/ru/function.join.php

	return $pieces.join( $glue );
}

function strpos( $haystack, $needle, $offset = 0 ) { // http://php.net/manual/ru/function.strpos.php

	return ($haystack = $haystack.indexOf( $needle, $offset )) !== -1 && $haystack;
}

function substr( $string , $start, $length ) { // http://php.net/manual/ru/function.substr.php

	return $string.substr( $start, $length );
}

function str_repeat( $input , $multiplier ) { // http://php.net/manual/ru/function.str-repeat.php

	return $input.repeat( $multiplier );
}

function str_replace( $search, $replace, $subject ) { // http://php.net/manual/ru/function.str-replace.php

	if (Array.isArray($subject)) {
		return $subject.map($str => str_replace( $search, $replace, $str ));
	}

	if (Array.isArray($search)) {
	
		if (!Array.isArray($replace))
			$replace = $search.map(() => $replace);
	
		for (var i = 0; i < $search.length; i++) {
			$subject = $subject.replace( new RegExp ('['+ preg_quote($search[i]) +']', 'g'), ($replace[i] || '') );
		}
	} else {
		$subject.replace( new RegExp ('['+ preg_quote($search) +']', 'g'), $replace );
	}

	return $subject;
}

function strstr( $haystack, $needle, $before_needle ) { // http://php.net/manual/ru/function.strstr.php

	return $before_needle ? $haystack.substr(0, $haystack.indexOf($needle) ) : $haystack.substr( $haystack.indexOf($needle) );
}

function empty( $var ) { // http://php.net/manual/ru/function.empty.php

	return !$var || !($var.length >= 0 ? $var.length : isNaN(+$var));
}

function end( $array ) { // http://nl1.php.net/manual/ru/function.end.php

	if (!Array.isArray($array)) {
		$array = Object.values($array);
	}

	return $array[ $array.length - 1 ];
}


function in_array( $needle, $haystack ) { // http://nl1.php.net/manual/ru/function.in-array.php

	if (!Array.isArray($haystack)) {
		$haystack = Object.values($haystack);
	}

	return $haystack.indexOf( $needle ) !== -1;
}

function array_push( $array, $mixed ) { // http://nl1.php.net/manual/ru/function.array-push.php

	return $array.push($mixed);
}

function array_slice( $array, $offset, $length ) { // http://nl1.php.net/manual/ru/function.array-slice.php

	return $array.slice($offset, $length);
}

function array_splice( $array, $offset, $length ) { // http://nl1.php.net/manual/ru/function.array-splice.php

	return $array.splice($offset, $length);
}

function array_map( $callback, $array1 ) { // http://nl1.php.net/manual/ru/function.array-map.php

	return $array1.map($callback);
}

function array_pop( $array ) { // http://nl1.php.net/manual/ru/function.array-pop.php
	return $array.pop();
}

function strpbrk( $haystack, $char_list ) { // http://nl1.php.net/manual/ru/function.strpbrk.php

	var $offset = -1;
	var $greatr = $haystack.length;

	for (var i = 0, c; i < $char_list.length; i++) {
	
		if ((c = $haystack.indexOf($char_list[i])) > -1 && c < $greatr) {
			$offset = $greatr = c;
		}
	}

	return $offset != -1 && $haystack.substr( $offset );
}

function strtolower( $string ) { // http://nl1.php.net/manual/ru/function.strtolower.php
	return $string.toLowerCase();
}

function is_string( $var ) { // http://nl1.php.net/manual/ru/function.is-string.php
	return typeof $var === 'string';
}

function is_bool( $var ) { // http://nl1.php.net/manual/ru/function.is-bool.php
	return typeof $var === 'boolean';
}

function htmlspecialchars( $string, $flags ) { // http://nl1.php.net/manual/ru/function.htmlspecialchars.php

	$string = $string.replace(/&/g, '&amp;');

	switch ($flags) {
	case 'ENT_NOQUOTES': break;
	case 'ENT_QUOTES'  : $string = $string.replace(/'/g, '&apos;');
	default            : $string = $string.replace(/"/g, '&quot;');
	}

	return $string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function call_user_func( $callback, $parameter ) { // http://nl1.php.net/manual/ru/function.call-user-func.php

	return arguments.length > 2 ? $callback.apply(this, Object.values( arguments ).slice(1)) : $callback.call(this, $parameter);
}

function call_user_func_array( $callback, $param_arr ) { // http://nl1.php.net/manual/ru/function.call-user-func-array.php

	return $callback.apply(this, $param_arr);
}
