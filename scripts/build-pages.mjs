import { cpSync, mkdirSync, rmSync } from 'node:fs';

const project = new URL('../', import.meta.url);
const output = new URL('dist/', project);
const assets = ['index.html', 'styles', 'src'];

rmSync(output, { recursive: true, force: true });
mkdirSync(output);

for (const asset of assets) {
    cpSync(new URL(asset, project), new URL(asset, output), { recursive: true });
}
