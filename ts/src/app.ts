import { SelectionPage } from './pages/selection';
import { BattlePage } from './pages/battle';
import { ResultPage } from './pages/result';
import type { Item, Pokemon } from './types';

export class PokemonGame {
  selectionPage: SelectionPage | null;
  battlePage: BattlePage | null;
  resultPage: ResultPage | null;

  constructor() {
    this.selectionPage = null;
    this.battlePage = null;
    this.resultPage = null;

    this.init();
  }

  init(): void {
    this.selectionPage = new SelectionPage(this);
    this.battlePage = new BattlePage(this);
    this.resultPage = new ResultPage(this);

    this.showSelectionPage();
  }

  showSelectionPage(): void {
    if (this.battlePage) {
      this.battlePage.hide();
    }
    if (this.resultPage) {
      this.resultPage.hide();
    }
    if (this.selectionPage) {
      this.selectionPage.show();
    }
  }

  startBattle(playerPokemonIds: number[], enemyPokemonIds: number[], playerBackpack: Record<string, Item> = {}): void {
    if (this.selectionPage) {
      this.selectionPage.hide();
    }
    if (this.resultPage) {
      this.resultPage.hide();
    }
    if (this.battlePage) {
      this.battlePage.show();
      this.battlePage.startBattle(playerPokemonIds, enemyPokemonIds, playerBackpack);
    }
  }

  showResultPage(isWin: boolean, playerPokemon: Pokemon, enemyPokemon: Pokemon, turns: number): void {
    if (this.selectionPage) {
      this.selectionPage.hide();
    }
    if (this.battlePage) {
      this.battlePage.hide();
    }
    if (this.resultPage) {
      this.resultPage.showResult(isWin, playerPokemon, enemyPokemon, turns);
    }
  }
}

declare global {
  interface Window {
    pokemonGame: PokemonGame;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.pokemonGame = new PokemonGame();
});