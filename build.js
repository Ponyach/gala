
const possibles = [
  /* 0: */  'gala',
  /* 1: */  'boardscript',
  /* +2: */ 'dast', 'mepr', 'coma', 'sure', 'moco', 'typo', 'wrwr'
];

const program   = require('commander');

program
	.version('1.0.0')
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

var patern = program.min ? '.min' : '';

const startTime  = Date.now();
const fileSystem = require('fs');
const babylon    = require('babylon');
const browserify = require('browserify');
const babel      = require('babel-core');
const Readable   = require('stream').Readable;
const presets    = [['env', {
	uglify : program.min
}]];

//program.min && presets.push(require('babel-preset-minify'))

for (let arg of program.args) {
	
	let word = possibles.indexOf(arg);
	
	if (word + 1) {
		
		if (word > 1) {
			__buildModules(arg).then(result => {
			
				var { code, map, ast } = babel.transformFromAst(babylon.parse(result, {
					allowReturnOutsideFunction: true,
					useBuiltIns: true
				}), result, { presets });
			
				if (program.userscript) {
					code = babel.transformFileSync(arg +'.meta.js').code +'\n'+ code;
					patern = '.user';
				}
			
				fileSystem.writeFile('build/'+ arg + patern +'.js', code, err => {
				// => [Error: EISDIR: illegal operation on a directory, open <directory>]
					if (err) {
						throw err;
					}
					console.log("The file was saved!");
				});
			});
			
		} else {
			
			let { code, ast } = babel.transformFileSync(
				arg +'.js', {
				comments : false,
				compact  : false,
				presets
			});
			
			let comment = ast.comments[0].value;
			let name    = '../ponyach/lib/javascript/'+ arg + patern +'.js';
			
			if (word) {
				
				let head = '';
				let k    = 0;
				
				do {
				         comment  = ast.comments[k++].value;
				         head    += `//${comment}\n`;
				} while (comment != ' ==/UserScript==');
				
				fileSystem.writeFile(name, head, err => { if (err) throw err; });
				
				const readin = new Readable;
				readin.push(code);      // transplited code text-string
				readin.push(null);      // indicates end-of-code basically - the end of the stream
				
				const writeout = browserify([arg +'-polyfills.js', readin]).bundle();
				writeout.pipe( fileSystem.createWriteStream(name, { flags: 'a' }) );
				writeout.on('end', () => console.info(`\`${arg}\` build finished at ${ Date.now() - startTime }ms`));
				
			} else {
				
				fileSystem.writeFile(name, '/*'+ comment +'*/\n'+ babel.transformFileSync(
					arg +'-polyfills.js', {
					comments : false,
					compact  : program.min
				}).code +'\n'+ code, err => {
				// => [Error: EISDIR: illegal operation on a directory, open <directory>]
					if (err) {
						throw err;
					}
					console.info(`\`${arg}\` build finished at ${ Date.now() - startTime }ms`);
				});
			}
		}
	}
}

function __buildModules(name) {
	
	return new Promise((resolve, reject) => {
		
		var { code, map, ast } = babel.transformFileSync(
			'modules/'+ name +'.js', {
			comments: false,
			compact: false
		});
		
		if (ast.comments.length && ast.comments[0].value.substring(0, 7) === '@import') {
			let depends = ast.comments[0].value.substring(7).trim().split(', ');
			
			Promise.all(depends.map(__buildModules)).then(results => {
				resolve(results.join('') + code);
			});
		} else {
			resolve(code);
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

