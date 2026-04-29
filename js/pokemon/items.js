const ITEMS_DATA = [
    {
        id: 'potion',
        name: '药水',
        type: 'heal',
        description: '恢复宝可梦30点HP',
        price: 30,
        value: 30,
        icon: '❤️',
        color: '#4caf50'
    },
    {
        id: 'super_potion',
        name: '超级药水',
        type: 'heal',
        description: '恢复宝可梦60点HP',
        price: 60,
        value: 60,
        icon: '💚',
        color: '#8bc34a'
    },
    {
        id: 'max_potion',
        name: '全复药',
        type: 'heal',
        description: '恢复宝可梦全部HP',
        price: 150,
        value: 9999,
        icon: '💖',
        color: '#e91e63'
    },
    {
        id: 'attack_boost',
        name: '力量强化剂',
        type: 'buff_attack',
        description: '下一次攻击伤害提升50%',
        price: 50,
        value: 1.5,
        icon: '⚔️',
        color: '#f44336'
    },
    {
        id: 'defense_boost',
        name: '护盾药剂',
        type: 'buff_defense',
        description: '下一次受到的伤害降低30%',
        price: 50,
        value: 0.7,
        icon: '🛡️',
        color: '#2196f3'
    },
    {
        id: 'evasion_boost',
        name: '闪避喷雾',
        type: 'buff_evasion',
        description: '下一次闪避率提升50%',
        price: 40,
        value: 0.5,
        icon: '👻',
        color: '#9c27b0'
    },
    {
        id: 'damage_item',
        name: '投掷炸弹',
        type: 'damage',
        description: '对敌方造成40点伤害',
        price: 45,
        value: 40,
        icon: '💣',
        color: '#ff9800'
    }
];

function getItemData(itemId) {
    return ITEMS_DATA.find(item => item.id === itemId);
}

function getAllItems() {
    return [...ITEMS_DATA];
}

function createItem(itemId, quantity = 1) {
    const itemData = getItemData(itemId);
    if (!itemData) return null;
    
    return {
        ...itemData,
        quantity: quantity
    };
}

class Item {
    constructor(itemId, quantity = 1) {
        const itemData = getItemData(itemId);
        if (itemData) {
            Object.assign(this, itemData);
        }
        this.quantity = quantity;
    }
}