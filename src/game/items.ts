import { ItemType, ItemData } from '../types';

export const ITEMS: Record<string, ItemData> = {
    POTION: {
        id: 'potion',
        name: '药水',
        description: '回复50点HP',
        price: 100,
        type: ItemType.HEAL,
        effect: 50
    },
    SUPER_POTION: {
        id: 'super_potion',
        name: '超级药水',
        description: '回复100点HP',
        price: 200,
        type: ItemType.HEAL,
        effect: 100
    },
    HYPER_POTION: {
        id: 'hyper_potion',
        name: '高级药水',
        description: '回复200点HP',
        price: 300,
        type: ItemType.HEAL,
        effect: 200
    },
    ATTACK_UP: {
        id: 'attack_up',
        name: '力量提升',
        description: '提升攻击力20%',
        price: 150,
        type: ItemType.BUFF,
        effect: 0.2,
        stat: 'attack'
    },
    SPECIAL_ATTACK_UP: {
        id: 'special_attack_up',
        name: '特攻提升',
        description: '提升特攻20%',
        price: 150,
        type: ItemType.BUFF,
        effect: 0.2,
        stat: 'specialAttack'
    },
    EVASION_UP: {
        id: 'evasion_up',
        name: '闪避提升',
        description: '提升闪避率20%',
        price: 200,
        type: ItemType.BUFF,
        effect: 0.2,
        stat: 'evasion'
    },
    DEFENSE_UP: {
        id: 'defense_up',
        name: '防御提升',
        description: '提升防御力20%',
        price: 150,
        type: ItemType.BUFF,
        effect: 0.2,
        stat: 'defense'
    },
    SPECIAL_DEFENSE_UP: {
        id: 'special_defense_up',
        name: '特防提升',
        description: '提升特防20%',
        price: 150,
        type: ItemType.BUFF,
        effect: 0.2,
        stat: 'specialDefense'
    },
    THROW_ROCK: {
        id: 'throw_rock',
        name: '投掷岩石',
        description: '对敌方造成50点伤害',
        price: 120,
        type: ItemType.DAMAGE,
        effect: 50
    },
    POISON_DART: {
        id: 'poison_dart',
        name: '毒镖',
        description: '对敌方造成80点伤害',
        price: 180,
        type: ItemType.DAMAGE,
        effect: 80
    }
};

export function getAllItems(): ItemData[] {
    return Object.values(ITEMS);
}

export function getItemById(id: string): ItemData | undefined {
    return Object.values(ITEMS).find(item => item.id === id);
}