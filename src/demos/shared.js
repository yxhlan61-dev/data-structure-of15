export function arrayGraph(values) {
    const nodes = values.flatMap((label,id)=>label===null?[]:[{id,label}]);
    const edges = nodes.flatMap(({id})=>id===0?[]:[{from:Math.floor((id-1)/2),to:id,slot:id%2?'left':'right'}]);
    return {nodes,edges};
}

export const toItems = input => input.trim().split(/[,\s，]+/u).filter(Boolean);
export const needs = (condition,message) => { if (!condition) throw new Error(message); };
export const fmt = values => values.length ? values.join(' · ') : '空';
