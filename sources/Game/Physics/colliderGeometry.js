// Rapier expects packed XYZ positions, never the backing buffer of an
// interleaved position/normal/UV attribute exported by some glTF tools.
export function colliderVertices(geometry)
{
    const position=geometry.getAttribute('position')
    if(!position.isInterleavedBufferAttribute && !position.normalized && position.itemSize===3 && position.array instanceof Float32Array)
        return position.array

    const vertices=new Float32Array(position.count*3)
    for(let i=0;i<position.count;i++)
    {
        vertices[i*3]=position.getX(i)
        vertices[i*3+1]=position.getY(i)
        vertices[i*3+2]=position.getZ(i)
    }
    return vertices
}

export function colliderIndices(geometry)
{
    const index=geometry.getIndex()
    if(index && !index.isInterleavedBufferAttribute && index.array instanceof Uint32Array)
        return index.array

    const indices=new Uint32Array(index?index.count:geometry.getAttribute('position').count)
    for(let i=0;i<indices.length;i++)indices[i]=index?index.getX(i):i
    return indices
}
