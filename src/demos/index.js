import { traversal, traversalConfig } from './traversal.js';
import { rebuild, rebuildConfig } from './rebuild.js';
import { heap, heapConfig } from './heap.js';
import { huffman, huffmanConfig } from './huffman.js';
import { forest, forestConfig } from './forest.js';

export const labs = {
    traversal: { config: traversalConfig, run: traversal },
    rebuild: { config: rebuildConfig, run: rebuild },
    heap: { config: heapConfig, run: heap },
    huffman: { config: huffmanConfig, run: huffman },
    forest: { config: forestConfig, run: forest },
};
