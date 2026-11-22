// Four entries share the original last groove, with room between their activation ranges.
const finalLane = { size: 0.75, compact: true }
const finalLaneSpacing = -1.52

export default {
    careerHetic:           { label: 'NASA HUNCH', year: 2023 },
    careerFreelancer:      { label: 'University of Toronto', year: 2025 },
    careerIRLTeacher:      { label: 'SWE @ KorraNet Creative', year: 2026 },
    careerImmersiveGarden: { label: 'SWE @ FlyRank AI', year: 2026 },
    careerOnlineTeacher:   { ...finalLane, label: 'SWE @ UTFR', year: 2026 },

    freshbooks:            { ...finalLane, label: 'SWE @ FreshBooks', color: 'blue', cloneFrom: 'careerOnlineTeacher', year: 2026, offsetZ: finalLaneSpacing, hasEnd: false },
    autodesk:              { ...finalLane, label: 'SWE @ Autodesk', color: 'purple', cloneFrom: 'freshbooks', year: 2027, offsetZ: finalLaneSpacing, hasEnd: false },
    amd:                   { ...finalLane, label: 'SWE @ AMD', color: 'orange', cloneFrom: 'autodesk', year: 2027, offsetZ: finalLaneSpacing, hasEnd: true },
}
