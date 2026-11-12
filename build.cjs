// Concatenate the browser sources, then package the single-file offline game.
const fs = require('node:fs'), vm = require('node:vm'), cp = require('node:child_process');
const order = ['data', 'textures', 'models', 'scene', 'game', 'ui', 'living', 'main'];
const src = "import * as THREE from './vendor/three.module.js';\n" + order.map(s => fs.readFileSync('src/' + s + '.js', 'utf8')).join('\n');
new vm.Script(src.replace(/^import[^\r\n]*[\r\n]*/, ''), { filename: 'app.js' });
fs.writeFileSync('dist/app.js', src);
fs.copyFileSync('src/rules.js', 'dist/rules.js');
cp.execFileSync(process.execPath, ['build-offline.cjs'], { stdio: 'inherit' });
