const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const src=['scene','game','ui','living','main'].map(s=>fs.readFileSync('src/'+s+'.js','utf8')).join('\n');
new vm.Script(src.replace(/^import[^\r\n]*[\r\n]*/,''));
fs.writeFileSync('dist/app.js',src);
cp.execFileSync(process.execPath,['build-offline.cjs'],{stdio:'inherit'});
