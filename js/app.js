class PokemonGame {
    constructor() {
        this.selectionPage = null;
        this.battlePage = null;
        this.resultPage = null;
        
        this.init();
    }

    init() {
        this.selectionPage = new SelectionPage(this);
        this.battlePage = new BattlePage(this);
        this.resultPage = new ResultPage(this);
        
        this.showSelectionPage();
    }

    showSelectionPage() {
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

    startBattle(playerPokemonIds, enemyPokemonIds, playerBackpack = []) {
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

    showResultPage(isWin, playerPokemon, enemyPokemon, turns) {
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

document.addEventListener('DOMContentLoaded', () => {
    window.pokemonGame = new PokemonGame();
});
