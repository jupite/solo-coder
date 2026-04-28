import '../css/style.css';
import { SelectionPage } from './pages/selection';
import { BattlePage } from './pages/battle';
import { ResultPage } from './pages/result';
import { PokemonDataList, Pokemon } from './pokemon/pokemon';
import { ItemData, PokemonType } from './types';

class Game {
    selectionPage: SelectionPage;
    battlePage: BattlePage;
    resultPage: ResultPage;

    constructor() {
        this.selectionPage = new SelectionPage(this);
        this.battlePage = new BattlePage(this);
        this.resultPage = new ResultPage(this);
        
        this.showSelectionPage();
    }

    showSelectionPage(): void {
        this.selectionPage.show();
        this.battlePage.hide();
        this.resultPage.hide();
    }

    showBattlePage(): void {
        this.selectionPage.hide();
        this.battlePage.show();
        this.resultPage.hide();
    }

    showResultPage(isWin: boolean, playerPokemon: { name: string; currentHp: number; maxHp: number; types: PokemonType[]; color?: number[]; secondaryColor?: number[]; shape?: string; level?: number }, enemyPokemon: { name: string; currentHp: number; maxHp: number; types: PokemonType[]; color?: number[]; secondaryColor?: number[]; shape?: string; level?: number }, turns: number): void {
        this.selectionPage.hide();
        this.battlePage.hide();
        this.resultPage.showResult(isWin, playerPokemon, enemyPokemon, turns);
    }

    startBattle(playerPokemonIds: number[], enemyPokemonIds: number[], backpack: ItemData[]): void {
        const playerPokemon = playerPokemonIds.map(id => {
            const data = PokemonDataList.find(p => p.id === id);
            return data ? new Pokemon(data, 50) : null;
        }).filter(Boolean) as Pokemon[];
        
        const enemyPokemon = enemyPokemonIds.map(id => {
            const data = PokemonDataList.find(p => p.id === id);
            return data ? new Pokemon(data, 50) : null;
        }).filter(Boolean) as Pokemon[];
        
        if (playerPokemon.length > 0 && enemyPokemon.length > 0) {
            this.showBattlePage();
            this.battlePage.startBattle(playerPokemon, enemyPokemon);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});