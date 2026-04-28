import { PokemonType, MoveCategory, MoveData } from '../types';

export const PokemonMoves: Record<string, Omit<MoveData, 'id'>> = {
    tackle: {
        name: '撞击',
        type: PokemonType.NORMAL,
        power: 40,
        accuracy: 100,
        pp: 35,
        category: MoveCategory.PHYSICAL,
        description: '用整个身体撞击对手。'
    },
    scratch: {
        name: '抓挠',
        type: PokemonType.NORMAL,
        power: 40,
        accuracy: 100,
        pp: 35,
        category: MoveCategory.PHYSICAL,
        description: '用锋利的爪子抓挠对手。'
    },
    ember: {
        name: '火花',
        type: PokemonType.FIRE,
        power: 40,
        accuracy: 100,
        pp: 25,
        category: MoveCategory.SPECIAL,
        description: '喷出小火焰攻击对手。'
    },
    flamethrower: {
        name: '喷射火焰',
        type: PokemonType.FIRE,
        power: 90,
        accuracy: 100,
        pp: 15,
        category: MoveCategory.SPECIAL,
        description: '喷出强烈的火焰攻击对手。'
    },
    fireBlast: {
        name: '大字爆炎',
        type: PokemonType.FIRE,
        power: 110,
        accuracy: 85,
        pp: 5,
        category: MoveCategory.SPECIAL,
        description: '用大字形的火焰攻击对手。'
    },
    waterGun: {
        name: '水枪',
        type: PokemonType.WATER,
        power: 40,
        accuracy: 100,
        pp: 25,
        category: MoveCategory.SPECIAL,
        description: '喷射水流攻击对手。'
    },
    hydroPump: {
        name: '水炮',
        type: PokemonType.WATER,
        power: 110,
        accuracy: 80,
        pp: 5,
        category: MoveCategory.SPECIAL,
        description: '用高压水柱攻击对手。'
    },
    surf: {
        name: '冲浪',
        type: PokemonType.WATER,
        power: 90,
        accuracy: 100,
        pp: 15,
        category: MoveCategory.SPECIAL,
        description: '用巨大的波浪攻击对手。'
    },
    vineWhip: {
        name: '藤鞭',
        type: PokemonType.GRASS,
        power: 45,
        accuracy: 100,
        pp: 25,
        category: MoveCategory.PHYSICAL,
        description: '用藤蔓抽打对手。'
    },
    razorLeaf: {
        name: '飞叶快刀',
        type: PokemonType.GRASS,
        power: 55,
        accuracy: 95,
        pp: 25,
        category: MoveCategory.PHYSICAL,
        description: '用锋利的叶子切割对手。'
    },
    solarBeam: {
        name: '阳光烈焰',
        type: PokemonType.GRASS,
        power: 120,
        accuracy: 100,
        pp: 10,
        category: MoveCategory.SPECIAL,
        description: '聚集阳光发射强烈光束。'
    },
    thunderShock: {
        name: '电击',
        type: PokemonType.ELECTRIC,
        power: 40,
        accuracy: 100,
        pp: 30,
        category: MoveCategory.SPECIAL,
        description: '用电流攻击对手。'
    },
    thunderbolt: {
        name: '十万伏特',
        type: PokemonType.ELECTRIC,
        power: 90,
        accuracy: 100,
        pp: 15,
        category: MoveCategory.SPECIAL,
        description: '用强烈的电击攻击对手。'
    },
    quickAttack: {
        name: '电光一闪',
        type: PokemonType.NORMAL,
        power: 40,
        accuracy: 100,
        pp: 30,
        category: MoveCategory.PHYSICAL,
        description: '以极快的速度攻击对手。'
    },
    ironTail: {
        name: '铁尾',
        type: PokemonType.STEEL,
        power: 100,
        accuracy: 75,
        pp: 15,
        category: MoveCategory.PHYSICAL,
        description: '用坚硬的尾巴攻击对手。'
    },
    bite: {
        name: '咬碎',
        type: PokemonType.NORMAL,
        power: 60,
        accuracy: 100,
        pp: 25,
        category: MoveCategory.PHYSICAL,
        description: '用锋利的牙齿撕咬对手。'
    },
    dragonRage: {
        name: '龙之怒',
        type: PokemonType.DRAGON,
        power: 40,
        accuracy: 100,
        pp: 10,
        category: MoveCategory.SPECIAL,
        description: '释放龙的怒火。'
    },
    dragonClaw: {
        name: '龙爪',
        type: PokemonType.DRAGON,
        power: 80,
        accuracy: 100,
        pp: 15,
        category: MoveCategory.PHYSICAL,
        description: '用锋利的龙爪攻击对手。'
    },
    psychic: {
        name: '精神强念',
        type: PokemonType.PSYCHIC,
        power: 90,
        accuracy: 100,
        pp: 10,
        category: MoveCategory.SPECIAL,
        description: '用强大的精神力攻击对手。'
    },
    confusion: {
        name: '念力',
        type: PokemonType.PSYCHIC,
        power: 50,
        accuracy: 100,
        pp: 25,
        category: MoveCategory.SPECIAL,
        description: '用较弱的精神力攻击对手。'
    },
    shadowBall: {
        name: '影子球',
        type: PokemonType.GHOST,
        power: 80,
        accuracy: 100,
        pp: 15,
        category: MoveCategory.SPECIAL,
        description: '投掷一团黑影攻击对手。'
    },
    lick: {
        name: '舌舔',
        type: PokemonType.GHOST,
        power: 30,
        accuracy: 100,
        pp: 30,
        category: MoveCategory.PHYSICAL,
        description: '用舌头舔舐对手。'
    },
    rockThrow: {
        name: '落石',
        type: PokemonType.ROCK,
        power: 50,
        accuracy: 90,
        pp: 15,
        category: MoveCategory.PHYSICAL,
        description: '投掷岩石攻击对手。'
    },
    rockSlide: {
        name: '岩崩',
        type: PokemonType.ROCK,
        power: 75,
        accuracy: 90,
        pp: 10,
        category: MoveCategory.PHYSICAL,
        description: '用大量岩石攻击对手。'
    },
    iceBeam: {
        name: '冰冻光束',
        type: PokemonType.ICE,
        power: 90,
        accuracy: 100,
        pp: 10,
        category: MoveCategory.SPECIAL,
        description: '发射冰冻光线攻击对手。'
    },
    powderSnow: {
        name: '细雪',
        type: PokemonType.ICE,
        power: 40,
        accuracy: 100,
        pp: 25,
        category: MoveCategory.SPECIAL,
        description: '用冰冷的雪攻击对手。'
    },
    wingAttack: {
        name: '翅膀攻击',
        type: PokemonType.FLYING,
        power: 60,
        accuracy: 100,
        pp: 35,
        category: MoveCategory.PHYSICAL,
        description: '用翅膀攻击对手。'
    },
    thunder: {
        name: '打雷',
        type: PokemonType.ELECTRIC,
        power: 110,
        accuracy: 70,
        pp: 10,
        category: MoveCategory.SPECIAL,
        description: '用强烈的雷电攻击对手。'
    },
    sing: {
        name: '唱歌',
        type: PokemonType.NORMAL,
        power: 0,
        accuracy: 55,
        pp: 15,
        category: MoveCategory.STATUS,
        description: '用悦耳的歌声让对手入睡。'
    },
    moonblast: {
        name: '月亮之力',
        type: PokemonType.FAIRY,
        power: 95,
        accuracy: 100,
        pp: 15,
        category: MoveCategory.SPECIAL,
        description: '借助月亮的力量攻击对手。'
    },
    playRough: {
        name: '嬉闹',
        type: PokemonType.FAIRY,
        power: 90,
        accuracy: 90,
        pp: 10,
        category: MoveCategory.PHYSICAL,
        description: '与对手嬉闹并攻击。'
    },
    supersonic: {
        name: '超音波',
        type: PokemonType.NORMAL,
        power: 0,
        accuracy: 55,
        pp: 20,
        category: MoveCategory.STATUS,
        description: '发出特殊的声波让对手混乱。'
    },
    poisonFang: {
        name: '毒牙',
        type: PokemonType.POISON,
        power: 50,
        accuracy: 100,
        pp: 15,
        category: MoveCategory.PHYSICAL,
        description: '用毒牙撕咬对手。'
    },
    bubble: {
        name: '泡泡',
        type: PokemonType.WATER,
        power: 40,
        accuracy: 100,
        pp: 30,
        category: MoveCategory.SPECIAL,
        description: '喷出无数泡泡攻击对手。'
    },
    hypnosis: {
        name: '催眠术',
        type: PokemonType.PSYCHIC,
        power: 0,
        accuracy: 60,
        pp: 20,
        category: MoveCategory.STATUS,
        description: '施加催眠让对手入睡。'
    },
    doubleSlap: {
        name: '连环巴掌',
        type: PokemonType.NORMAL,
        power: 15,
        accuracy: 85,
        pp: 10,
        category: MoveCategory.PHYSICAL,
        description: '用巴掌连续拍打对手。'
    }
};

export function getMove(moveId: string): MoveData | null {
    const moveData = PokemonMoves[moveId];
    if (!moveData) return null;
    return {
        ...moveData,
        id: moveId,
        currentPp: moveData.pp
    };
}