import { esc } from './dom.js';

function layout(graph, width) {
    const {nodes,edges} = graph;
    const parented = new Set(edges.map(e=>e.to));
    const outgoing = new Map();
    for (const edge of edges) {
        if (!outgoing.has(edge.from)) outgoing.set(edge.from,[]);
        outgoing.get(edge.from).push(edge);
    }
    const points = new Map();
    let maxDepth = 0;
    if (edges.some(e=>e.slot==='general')) {
        let cursor = 0;
        function place(id,depth) {
            const children = (outgoing.get(id)||[]).map(e=>place(e.to,depth+1));
            const x = children.length ? (children[0]+children.at(-1))/2 : cursor++;
            maxDepth = Math.max(maxDepth,depth);
            points.set(id,[x,depth]);
            return x;
        }
        for (const node of nodes) if (!parented.has(node.id)) { place(node.id,0); cursor++; }
    } else {
        let cursor = 0;
        function place(id,depth) {
            const children=outgoing.get(id)||[];
            const left=children.find(e=>e.slot==='left');
            const right=children.find(e=>e.slot==='right');
            if (left) place(left.to,depth+1);
            points.set(id,[cursor++,depth]);
            maxDepth=Math.max(maxDepth,depth);
            if (right) place(right.to,depth+1);
        }
        for (const node of nodes) if (!parented.has(node.id)) { place(node.id,0); cursor++; }
    }
    const xs=[...points.values()].map(p=>p[0]);
    const min=Math.min(...xs), max=Math.max(...xs);
    const yStep=maxDepth>4?42:57;
    const margin=Math.min(63, width/7);
    for (const [id,[x,depth]] of points) {
        points.set(id,[min===max ? width/2 : margin+(x-min)/(max-min)*(width-margin*2),32+depth*yStep]);
    }
    return {points,height:Math.max(125,70+maxDepth*yStep)};
}
export function drawTree(graph,state={},width=550) {
    const {nodes,edges}=graph, {active=[],visited=[],now,shownEdges}=state;
    if (!nodes.length) return `<svg class="plot" viewBox="0 0 ${width} 126" role="img" aria-label="空树"><text class="plot-label" x="${width/2}" y="65">空树</text></svg>`;
    const {points,height}=layout(graph,width);
    const arc=edges.map(e=>{
        const [x1,y1]=points.get(e.from),[x2,y2]=points.get(e.to);
        const key=`${e.from}:${e.to}`;
        const style = shownEdges && !shownEdges.includes(key) ? 'removed' : active.includes(e.to)?'live':'';
        return `<line class="edge ${style}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>${e.label && style!=='removed'?`<text class="edge-label" x="${(x1+x2)/2}" y="${(y1+y2)/2}">${esc(e.label)}</text>`:''}`;
    }).join('');
    return `<svg class="plot" viewBox="0 0 ${width} ${height}" role="img" aria-label="当前树结构">${arc}${nodes.map(({id,label})=>{
        const [x,y]=points.get(id), count=[...String(label)].length;
        const style=[visited.includes(id)?'visited':'',active.includes(id)?'active':'',now===id?'visit-now':''].join(' ');
        const radius = width<400 ? 15 : nodes.length>11 ? 14 : 18;
        const boxWidth=Math.max(radius*2,Math.min(count*9+10,90));
        const shape=count<=2?`<circle class="node-shape" cx="${x}" cy="${y}" r="${radius}"/>`:
            `<rect class="node-shape" x="${x-boxWidth/2}" y="${y-radius}" width="${boxWidth}" height="${radius*2}" rx="${radius}"/>`;
        return `<g class="${style}">${shape}<text class="node-text" x="${x}" y="${y}">${esc(label)}</text></g>`;
    }).join('')}</svg>`;
}
