// Original cookie factory plot; the pavilion replaces its machinery.
export const healthcareSite = { x: 12.2511625289917, z: 32.0008544921875 }

// Dry clearing inside the northwestern race loop, away from the racing line.
export const workshopSite = { x: -60, y: 0.6, z: -40 }

// Dry coastal clearing beside the northeastern circuit.
export const contextSite = { x: 70, y: 1, z: -70 }

// Only these specific original foliage instances obstruct the Context Bridge.
// Filter before instancing so the tree trunk, canopy and collider disappear together.
export function contextFoliageReferences(references, kind)
{
    const excluded = kind === 'bush' ? ['Icosphere115', 'Icosphere116'] : kind === 'birch' ? ['treeBody028'] : []
    // GLTFLoader sanitizes names, e.g. treeBody.028 becomes treeBody028.
    return references.filter(reference => !excluded.includes(reference.name.replaceAll('.', '')))
}

// Specific foliage overlapping the rink and its entrance sign.
export function rinkFoliageReferences(references, kind = 'bush')
{
    const excluded = kind === 'bush' ? ['Icosphere070', 'Icosphere052', 'Icosphere053'] : kind === 'cherry' ? ['treeBody022'] : []
    return references.filter(reference => !excluded.includes(reference.name.replaceAll('.', '')))
}
