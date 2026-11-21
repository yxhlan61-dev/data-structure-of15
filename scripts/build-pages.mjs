import { cpSync, mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const project = new URL('../', import.meta.url);
const output = new URL('dist/', project);
const assets = ['index.html', 'favicon.svg', 'styles', 'src'];

rmSync(output, { recursive: true, force: true });
mkdirSync(output);

for (const asset of assets) {
    cpSync(new URL(asset, project), new URL(asset, output), { recursive: true });
}
const hashes={};
function collect(dir,prefix='') {
    for(const item of readdirSync(dir,{withFileTypes:true})) {
        const relative=prefix+item.name,url=new URL(item.name+(item.isDirectory()?'/':''),dir);
        if(item.isDirectory())collect(url,relative+'/');
        else hashes[relative]=createHash('sha256').update(readFileSync(url)).digest('hex');
    }
}
collect(output);
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:fileURLToPath(project),encoding:'utf8'}).trim();
writeFileSync(new URL('revision.json',output),JSON.stringify({commit,assets:hashes},null,2)+'\n');
console.log(`Built ${Object.keys(hashes).length} assets from ${commit}`);
