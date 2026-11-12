const fs=require('node:fs'),path=require('node:path');
const dir=__dirname;
const lib=fs.readFileSync(path.join(dir,'dist/vendor/three.module.js'),'utf8');
const css=fs.readFileSync(path.join(dir,'dist/style.css'),'utf8').replace(/^@import[^\r\n]*[\r\n]*/m,'');
const exportedNames=lib.match(/export\s*\{([^}]+)\};?\s*$/);
if(!exportedNames)throw new Error('Unsupported Three.js bundle');
const names=exportedNames[1].split(',').map(v=>{const [local,alias]=v.trim().split(/\s+as\s+/);return alias?alias+':'+local:local}).join(',');
const engine='const THREE=(()=>{'+lib.slice(0,exportedNames.index)+'\nreturn {'+names+'};})();\n';
const js=engine+fs.readFileSync(path.join(dir,'dist/rules.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'dist/app.js'),'utf8').replace(/^import[^\r\n]*[\r\n]*/, '');
// Function replacements preserve literal dollar signs in JavaScript (especially $$).
const html=fs.readFileSync(path.join(dir,'dist/index.html'),'utf8').replace(/<link rel="stylesheet"[^>]+>/,()=>'<style>'+css+'</style>').replace('<script src="rules.js"></script>','').replace('<script type="module" src="app.js"></script>',()=>'<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
new (require('node:vm').Script)(js,{filename:'offline-game.js'});
if(!html.includes('$$ = s =>')||html.includes('data:text/javascript')||html.includes('<style>500;'))throw new Error('Broken offline bundle');
fs.writeFileSync(path.join(dir,'little-room.html'),html);
console.log('Offline game ready: '+path.join(dir,'little-room.html'));

