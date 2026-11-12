const cp=require('node:child_process');
for(const file of ['test-v2.cjs','test-v3.cjs','test-v5.cjs','test-package.cjs'])cp.execFileSync(process.execPath,[file],{stdio:'inherit'});
