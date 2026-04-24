// 道具定义文件
const ITEMS = {
    // 回血道具
    POTION: {
        id: 'potion',
        name: '药水',
        description: '回复50点HP',
        price: 100,
        type: 'heal',
        effect: 50
    },
    SUPER_POTION: {
        id: 'super_potion',
        name: '超级药水',
        description: '回复100点HP',
        price: 200,
        type: 'heal',
        effect: 100
    },
    HYPER_POTION: {
        id: 'hyper_potion',
        name: '高级药水',
        description: '回复200点HP',
        price: 300,
        type: 'heal',
        effect: 200
    },
    // 增伤道具
    ATTACK_UP: {
        id: 'attack_up',
        name: '力量提升',
        description: '提升攻击力20%',
        price: 150,
        type: 'buff',
        effect: 0.2,
        stat: 'attack'
    },
    SPECIAL_ATTACK_UP: {
        id: 'special_attack_up',
        name: '特攻提升',
        description: '提升特攻20%',
        price: 150,
        type: 'buff',
        effect: 0.2,
        stat: 'specialAttack'
    },
    // 增加闪避道具
    EVASION_UP: {
        id: 'evasion_up',
        name: '闪避提升',
        description: '提升闪避率20%',
        price: 200,
        type: 'buff',
        effect: 0.2,
        stat: 'evasion'
    },
    // 减伤道具
    DEFENSE_UP: {
        id: 'defense_up',
        name: '防御提升',
        description: '提升防御力20%',
        price: 150,
        type: 'buff',
        effect: 0.2,
        stat: 'defense'
    },
    SPECIAL_DEFENSE_UP: {
        id: 'special_defense_up',
        name: '特防提升',
        description: '提升特防20%',
        price: 150,
        type: 'buff',
        effect: 0.2,
        stat: 'specialDefense'
    },
    // 造成伤害道具
    THROW_ROCK: {
        id: 'throw_rock',
        name: '投掷岩石',
        description: '对敌方造成50点伤害',
        price: 120,
        type: 'damage',
        effect: 50
    },
    POISON_DART: {
        id: 'poison_dart',
        name: '毒镖',
        description: '对敌方造成80点伤害',
        price: 180,
        type: 'damage',
        effect: 80
    }
};

// 获取所有道具列表
function getAllItems() {
    return Object.values(ITEMS);
}

// 根据ID获取道具
function getItemById(id) {
    return Object.values(ITEMS).find(item => item.id === id);
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ITEMS,
        getAllItems,
        getItemById
    };
} else {
    window.Items = {
        ITEMS,
        getAllItems,
        getItemById
    };
}