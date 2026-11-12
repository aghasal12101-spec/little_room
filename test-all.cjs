const cp = require('node:child_process');
for (const file of ['test-rules.cjs', 'test-runtime.cjs', 'test-package.cjs']) cp.execFileSync(process.execPath, [file], { stdio: 'inherit' });
