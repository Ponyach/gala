
const possibles = [
    /*    0    */ /* 1 */ /* 2 */ /* 3 */ /* 4 */ /* 5 */ /* 6 */ /* 7 */ /* 8 */
   'boardscript', 'gala', 'mepr', 'coma', 'dast', 'sure', 'moco', 'typo', 'wrwr'
];

const program = require('commander');

program
	.version('1.1.2')
	.option('-M, --min', 'enable code minify.')
	.option('-C, --compatible', 'enable ES6->ES5 code transformation.')
	.option('-U, --userscript', 'build UserScript.')
	.on('--help', () => {

console.log(`
  list of build modules:

    ${ possibles.join(' ') }

  Examples:

    $ node build.js -C -M dast coma
    $ node build.js -U mepr
`)

	}).parse(process.argv);

var __pieceOf = (code) => code;

const startTime  = Date.now();
const fileSystem = require('fs');
const babel      = require('babel-core');
const Readable   = require('stream').Readable;
const uglify     = require('uglify-js');
const options    = {
	comments: true,
	compact: false
}

if (program.compatible) {
	options.plugins = [
		'transform-es2015-arrow-functions',
		'transform-es2015-block-scoping', [
		'transform-es2015-classes', { loose: true }],
		'transform-es2015-computed-properties',
		'transform-es2015-destructuring', [
		'transform-es2015-for-of', { loose: true, assumeArray: true }],
		'transform-es2015-literals',
		'transform-es2015-shorthand-properties',
		'transform-es2015-parameters',
		'transform-es2015-spread', [
		'transform-es2015-template-literals', { loose: true }],
		'transform-es2015-typeof-symbol',
		'transform-es2015-unicode-regex'
	];
	
	if (program.min) {
		options.comments = false;
		options.compact = true;
		__pieceOf = (code) => uglify.minify(code, {
			compress: { booleans: false },
			output: {
				//max_line_len: 255,
				comments: 'all',
				ast: false
			}
		}).code;
	}
}
else if (program.min) {
	options.plugins = [
		'minify-constant-folding',
		'minify-dead-code-elimination',
		'minify-flip-comparisons',
		'minify-guarded-expressions',
		'minify-mangle-names',
		'minify-simplify',
		'transform-member-expression-literals',
		'transform-merge-sibling-variables',
		'transform-property-literals'
	];
	options.comments = false;
	options.compact = true;
}

for (let name of program.args) {
	
	const word = possibles.indexOf(name);
	
	if (word === -1)
		continue;
	
	let output = `../ponyach/lib/javascript/${name}.js`;
	//let output = `build/${name}.js`;
	
	if (word === 0) {
		
		const browserify = require('browserify');
		
		let { code, ast } = babel.transformFileSync(
			name +'.js', {
			comments: false,
			compact : true,
			presets : ['env']
		});
		
		let comment = '';
		let head = '';
		let k = 0;
		
		do {
		         comment  = ast.comments[k++].value;
		         head    += `//${comment}\n`;
		} while (comment != ' ==/UserScript==');
		
		const readin = new Readable;
		readin.push(code);      // transplited code text-string
		readin.push(null);      // indicates end-of-code basically - the end of the stream
		
		browserify([name +'-polyfills.js', readin]).bundle((err, buf) => {
			
			if (err) throw err;
			
			fileSystem.writeFile(output, head + uglify.minify(buf.toString('utf8'), {
				compress: { booleans: false },
				output: {
					//max_line_len: 255,
					comments: false,
					ast: false
				}
			}).code, err => {
				// => [Error: EISDIR: illegal operation on a directory, open <directory>]
				if (err) throw err;
				
				console.info(`\`${name}\` build finished at ${ Date.now() - startTime }ms`) });
		});
	} else {
		
		__buildModules(name).then(code => {
			
			fileSystem.writeFile(output, code, err => {
			// => [Error: EISDIR: illegal operation on a directory, open <directory>]
				if (err) {
					throw err;
				}
				console.info(`\`${name}\` build finished at ${ Date.now() - startTime }ms`);
			});
		});
	}
}

function __buildModules(name) {
	
	return new Promise((resolve, reject) => {
		
		let { code, ast } = babel.transformFileSync(name +'.js', options);
			
		let depends = 0 in ast.comments ? ast.comments[0].value : '';
		let head = 1 in ast.comments ? ast.comments[1].value : 'start '+ name.replace('modules/','') +' block code ===>';
		
		if (depends.substr(0, 7) === '@import') {
			code = options.compact ? `\n/* ${head.replace(/\t/g,' ')} */\n`+__pieceOf(code) +'\n': code.replace('//'+depends,'');
			depends = depends.substr(7).trim().split(/\s*,\s*/);
			
			Promise.all(depends.map(js => __buildModules('modules/'+ js))).then(results => {
				resolve(results.join('\n') + code +'/* <==== end === */\n');
			});
		} else {
			resolve((options.compact ? `\n/* ${depends.replace(/\t/g, ' ')} */\n`+__pieceOf(code) +'\n' : code) +'/* <==== end === */\n');
		}
	});
}

/*
require('https').get({
	hostname : 'cdn.polyfill.io',
	agent    : false,
	port     : 443,
	headers  : {
		"User-Agent"  : 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv 11.0) like Gecko',
		"Content-Type": 'text/plain;charset=UTF-8' },
	path     : '/v2/polyfill'+ patern +'.js?flags=gated&features='+ [
		'Array.from',
		'Math.clz32',
		'Number.MAX_SAFE_INTEGER',
		'Object.assign',
		'Promise',
		'Set',
		'Map',
		'String.prototype.endsWith',
		'String.prototype.repeat',
		'String.prototype.startWith',
		'Symbol',
		'WeakMap'
	].join(',')
}, function(response) {
	
	var polyfill = new String();
	
	response.on('data', (part) => { polyfill += part });
	response.on('end' , (    ) => {
		
		fileSystem.writeFile(name, head + babel.transform( polyfill, {
			comments : false,
			compact  : false
		}).code +'\n'+ code, err => {
		// => [Error: EISDIR: illegal operation on a directory, open <directory>]
			if (err) {
				throw err;
			}
			console.info(`\`${arg}\` build finished at ${ Date.now() - startTime }ms`);
		});
	});
});
*/
