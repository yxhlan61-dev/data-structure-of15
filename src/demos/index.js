import { traversal, traversalConfig } from './traversal.js';
import { rebuild, rebuildConfig } from './rebuild.js';
import { heap, heapConfig } from './heap.js';
import { huffman, huffmanConfig } from './huffman.js';
import { forest, forestConfig } from './forest.js';
import * as linear from './linear.js';
import * as strings from './strings-arrays.js';
import * as graphs from './graphs.js';
import * as searching from './searching.js';
import * as sorting from './sorting.js';
import { criticalPath, criticalPathConfig } from './critical-path.js';

export const labs = {
    traversal: { config: traversalConfig, run: traversal },
    rebuild: { config: rebuildConfig, run: rebuild },
    heap: { config: heapConfig, run: heap },
    huffman: { config: huffmanConfig, run: huffman },
    forest: { config: forestConfig, run: forest },
    'critical-path': {config:criticalPathConfig,run:criticalPath},
};
for (const [id, source, fn] of [
    ['list',linear,'list'],
    ['queue',linear,'queue'],['expression',linear,'expression'],['pascal',linear,'pascal'],
    ['matching',strings,'matching'],
    ['graph-traversal',graphs,'graphTraversal'],['topological',graphs,'topological'],['dijkstra',graphs,'dijkstra'],['mst',graphs,'mst'],
    ['binary',searching,'binary'],['bst',searching,'bst'],['avl',searching,'avl'],['hash',searching,'hash'],
    ['sorting',sorting,'sorting'],['distribution',sorting,'distribution']
]) labs[id]={config:source[`${fn}Config`],run:source[fn]};
