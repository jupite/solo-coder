const PokemonTypes = {
    NORMAL: 'normal',
    FIRE: 'fire',
    WATER: 'water',
    ELECTRIC: 'electric',
    GRASS: 'grass',
    ICE: 'ice',
    FIGHTING: 'fighting',
    POISON: 'poison',
    GROUND: 'ground',
    FLYING: 'flying',
    PSYCHIC: 'psychic',
    BUG: 'bug',
    ROCK: 'rock',
    GHOST: 'ghost',
    DRAGON: 'dragon',
    DARK: 'dark',
    STEEL: 'steel',
    FAIRY: 'fairy'
};

const TypeColors = {
    normal: [0.659, 0.659, 0.471, 1.0],
    fire: [0.941, 0.502, 0.188, 1.0],
    water: [0.408, 0.565, 0.941, 1.0],
    electric: [0.973, 0.816, 0.188, 1.0],
    grass: [0.469, 0.784, 0.314, 1.0],
    ice: [0.596, 0.847, 0.847, 1.0],
    fighting: [0.753, 0.188, 0.157, 1.0],
    poison: [0.627, 0.251, 0.627, 1.0],
    ground: [0.878, 0.753, 0.408, 1.0],
    flying: [0.659, 0.565, 0.941, 1.0],
    psychic: [0.973, 0.345, 0.533, 1.0],
    bug: [0.659, 0.722, 0.125, 1.0],
    rock: [0.722, 0.627, 0.220, 1.0],
    ghost: [0.439, 0.345, 0.596, 1.0],
    dragon: [0.439, 0.220, 0.973, 1.0],
    dark: [0.439, 0.345, 0.282, 1.0],
    steel: [0.722, 0.722, 0.816, 1.0],
    fairy: [0.933, 0.600, 0.675, 1.0]
};

const TypeEffectiveness = {
    normal: {
        rock: 0.5,
        ghost: 0,
        steel: 0.5
    },
    fire: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 2,
        bug: 2,
        rock: 0.5,
        dragon: 0.5,
        steel: 2
    },
    water: {
        fire: 2,
        water: 0.5,
        grass: 0.5,
        ground: 2,
        rock: 2,
        dragon: 0.5
    },
    electric: {
        water: 2,
        electric: 0.5,
        grass: 0.5,
        ground: 0,
        flying: 2,
        dragon: 0.5
    },
    grass: {
        fire: 0.5,
        water: 2,
        grass: 0.5,
        poison: 0.5,
        ground: 2,
        flying: 0.5,
        bug: 0.5,
        rock: 2,
        dragon: 0.5
    },
    ice: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 0.5,
        ground: 2,
        flying: 2,
        dragon: 2,
        steel: 0.5
    },
    fighting: {
        normal: 2,
        ice: 2,
        poison: 0.5,
        flying: 0.5,
        psychic: 0.5,
        bug: 0.5,
        rock: 2,
        ghost: 0,
        dark: 2,
        steel: 2,
        fairy: 0.5
    },
    poison: {
        grass: 2,
        poison: 0.5,
        ground: 0.5,
        rock: 0.5,
        ghost: 0.5,
        steel: 0,
        fairy: 2
    },
    ground: {
        fire: 2,
        electric: 2,
        grass: 0.5,
        poison: 2,
        flying: 0,
        bug: 0.5,
        rock: 2,
        steel: 2
    },
    flying: {
        grass: 2,
        fighting: 2,
        bug: 2,
        rock: 0.5,
        steel: 0.5
    },
    psychic: {
        fighting: 2,
        poison: 2,
        psychic: 0.5,
        dark: 0,
        steel: 0.5
    },
    bug: {
        fire: 0.5,
        grass: 2,
        fighting: 0.5,
        poison: 0.5,
        flying: 0.5,
        psychic: 2,
        ghost: 0.5,
        dark: 2,
        steel: 0.5,
        fairy: 0.5
    },
    rock: {
        fire: 2,
        ice: 2,
        fighting: 0.5,
        ground: 0.5,
        flying: 2,
        bug: 2,
        steel: 0.5
    },
    ghost: {
        normal: 0,
        psychic: 2,
        ghost: 2,
        dark: 0.5
    },
    dragon: {
        dragon: 2,
        steel: 0.5,
        fairy: 0
    },
    dark: {
        fighting: 0.5,
        psychic: 2,
        ghost: 2,
        dark: 0.5,
        fairy: 0.5
    },
    steel: {
        fire: 0.5,
        water: 0.5,
        electric: 0.5,
        ice: 2,
        rock: 2,
        steel: 0.5,
        fairy: 2
    },
    fairy: {
        fire: 0.5,
        fighting: 2,
        poison: 0.5,
        dragon: 2,
        dark: 2,
        steel: 0.5
    }
};

function getTypeEffectiveness(moveType, defenderType) {
    if (!TypeEffectiveness[moveType]) {
        return 1;
    }
    
    const effectiveness = TypeEffectiveness[moveType][defenderType];
    return effectiveness !== undefined ? effectiveness : 1;
}

function getStab(moveType, pokemonTypes) {
    return pokemonTypes.includes(moveType) ? 1.5 : 1;
}

function getMoveColor(moveType) {
    return TypeColors[moveType] || TypeColors.normal;
}
