const PokemonMoves = {
    tackle: {
        name: '撞击',
        type: PokemonTypes.NORMAL,
        power: 40,
        accuracy: 100,
        pp: 35,
        category: 'physical',
        description: '用整个身体撞击对手。'
    },
    scratch: {
        name: '抓挠',
        type: PokemonTypes.NORMAL,
        power: 40,
        accuracy: 100,
        pp: 35,
        category: 'physical',
        description: '用锋利的爪子抓挠对手。'
    },
    ember: {
        name: '火花',
        type: PokemonTypes.FIRE,
        power: 40,
        accuracy: 100,
        pp: 25,
        category: 'special',
        description: '喷出小火焰攻击对手。'
    },
    flamethrower: {
        name: '喷射火焰',
        type: PokemonTypes.FIRE,
        power: 90,
        accuracy: 100,
        pp: 15,
        category: 'special',
        description: '喷出强烈的火焰攻击对手。'
    },
    fireBlast: {
        name: '大字爆炎',
        type: PokemonTypes.FIRE,
        power: 110,
        accuracy: 85,
        pp: 5,
        category: 'special',
        description: '用大字形的火焰攻击对手。'
    },
    waterGun: {
        name: '水枪',
        type: PokemonTypes.WATER,
        power: 40,
        accuracy: 100,
        pp: 25,
        category: 'special',
        description: '喷射水流攻击对手。'
    },
    hydroPump: {
        name: '水炮',
        type: PokemonTypes.WATER,
        power: 110,
        accuracy: 80,
        pp: 5,
        category: 'special',
        description: '用高压水柱攻击对手。'
    },
    surf: {
        name: '冲浪',
        type: PokemonTypes.WATER,
        power: 90,
        accuracy: 100,
        pp: 15,
        category: 'special',
        description: '用巨大的波浪攻击对手。'
    },
    vineWhip: {
        name: '藤鞭',
        type: PokemonTypes.GRASS,
        power: 45,
        accuracy: 100,
        pp: 25,
        category: 'physical',
        description: '用藤蔓抽打对手。'
    },
    razorLeaf: {
        name: '飞叶快刀',
        type: PokemonTypes.GRASS,
        power: 55,
        accuracy: 95,
        pp: 25,
        category: 'physical',
        description: '用锋利的叶子切割对手。'
    },
    solarBeam: {
        name: '阳光烈焰',
        type: PokemonTypes.GRASS,
        power: 120,
        accuracy: 100,
        pp: 10,
        category: 'special',
        description: '聚集阳光发射强烈光束。'
    },
    thunderShock: {
        name: '电击',
        type: PokemonTypes.ELECTRIC,
        power: 40,
        accuracy: 100,
        pp: 30,
        category: 'special',
        description: '用电流攻击对手。'
    },
    thunderbolt: {
        name: '十万伏特',
        type: PokemonTypes.ELECTRIC,
        power: 90,
        accuracy: 100,
        pp: 15,
        category: 'special',
        description: '用强烈的电击攻击对手。'
    },
    quickAttack: {
        name: '电光一闪',
        type: PokemonTypes.NORMAL,
        power: 40,
        accuracy: 100,
        pp: 30,
        category: 'physical',
        description: '以极快的速度攻击对手。'
    },
    ironTail: {
        name: '铁尾',
        type: PokemonTypes.STEEL,
        power: 100,
        accuracy: 75,
        pp: 15,
        category: 'physical',
        description: '用坚硬的尾巴攻击对手。'
    },
    bite: {
        name: '咬碎',
        type: PokemonTypes.NORMAL,
        power: 60,
        accuracy: 100,
        pp: 25,
        category: 'physical',
        description: '用锋利的牙齿撕咬对手。'
    },
    dragonRage: {
        name: '龙之怒',
        type: PokemonTypes.DRAGON,
        power: 40,
        accuracy: 100,
        pp: 10,
        category: 'special',
        description: '释放龙的怒火。'
    },
    dragonClaw: {
        name: '龙爪',
        type: PokemonTypes.DRAGON,
        power: 80,
        accuracy: 100,
        pp: 15,
        category: 'physical',
        description: '用锋利的龙爪攻击对手。'
    },
    psychic: {
        name: '精神强念',
        type: PokemonTypes.PSYCHIC,
        power: 90,
        accuracy: 100,
        pp: 10,
        category: 'special',
        description: '用强大的精神力攻击对手。'
    },
    confusion: {
        name: '念力',
        type: PokemonTypes.PSYCHIC,
        power: 50,
        accuracy: 100,
        pp: 25,
        category: 'special',
        description: '用较弱的精神力攻击对手。'
    },
    shadowBall: {
        name: '影子球',
        type: PokemonTypes.GHOST,
        power: 80,
        accuracy: 100,
        pp: 15,
        category: 'special',
        description: '投掷一团黑影攻击对手。'
    },
    lick: {
        name: '舌舔',
        type: PokemonTypes.GHOST,
        power: 30,
        accuracy: 100,
        pp: 30,
        category: 'physical',
        description: '用舌头舔舐对手。'
    },
    rockThrow: {
        name: '落石',
        type: PokemonTypes.ROCK,
        power: 50,
        accuracy: 90,
        pp: 15,
        category: 'physical',
        description: '投掷岩石攻击对手。'
    },
    rockSlide: {
        name: '岩崩',
        type: PokemonTypes.ROCK,
        power: 75,
        accuracy: 90,
        pp: 10,
        category: 'physical',
        description: '用大量岩石攻击对手。'
    },
    iceBeam: {
        name: '冰冻光束',
        type: PokemonTypes.ICE,
        power: 90,
        accuracy: 100,
        pp: 10,
        category: 'special',
        description: '发射冰冻光线攻击对手。'
    },
    powderSnow: {
        name: '细雪',
        type: PokemonTypes.ICE,
        power: 40,
        accuracy: 100,
        pp: 25,
        category: 'special',
        description: '用冰冷的雪攻击对手。'
    }
};

function getMove(moveId) {
    return PokemonMoves[moveId] || null;
}
