import {colorMap} from '../functions/ColorMap.js';
/**
 * 
 * SUBSCRIBES TO: tileStateUpdated, gameWon, gameLost, reset
 * 
 * BROADCASTS: tileClick, tilesRendered
 * 
 */
export default class BoardRender extends EventTarget{
    //initiate board elements, handle animations, handle click events
    constructor(container, board, settings, broadcaster){
        
        super();
        this.settings = settings;
        this.broadcaster = broadcaster;
        this.container = container;
        this.boardData = board;
        this.elements = [];
        this.build();
        this.addEventListener('reset', (e) => {
            this.destroy();
            this.build();
        }, false);
        this.addEventListener('tileStateUpdated', (e) => this.updateAllAppearance(), false);
        this.addEventListener('gameLost', (e) => this.revealAllExceptMines(), false);
        this.addEventListener('gameWon', (e) => this.revealAll(), false);
        
    }

    destroy(){
        while(this.container.firstChild){
            this.container.removeChild(this.container.firstChild); 
        }
    }
    build(){
        //choose color
        this.colorChoice = Math.floor( Math.random() * this.settings.gradients.length);
        console.log("color scheme #" + (this.colorChoice + 1));

        this.colorChoice = 1;

        //build board
        for(let i = 0; i < this.boardData.rows; i++){

            this.elements[i] = [];

            //should a reference to row be saved?
            let row = this.container.appendChild(document.createElement("div"));
            row.id = `row-${i}`;
            row.className = `game-row`;

            for(let j = 0; j < this.boardData.columns; j++){

                this.elements[i][j] = row.appendChild(document.createElement("div"));
                let targetElement = this.elements[i][j];

                let cellObj = this.boardData.field[i][j];

                //apply tags
                targetElement.id = cellObj.id; //unused... maybe use for animation?
                targetElement.className = 'cell unselectable';
                targetElement.oncontextmenu = () => {return false};
                targetElement.x = i;
                targetElement.y = j;
                targetElement.style.height = this.settings.cellSize;
                targetElement.style.width = this.settings.cellSize;

                //init tile style
                this.coverTile(i,j);

                if(this.settings.debug && this.settings.debug.active && this.settings.debug.uncoverAll){
                    this.uncoverTile(i,j);
                }
                
            }
        }
    }
    coverTile(x,y){
        let targetData = this.boardData.field[x][y];
        let targetElement = this.elements[x][y];

        //apply class
        targetElement.classList.add('cell-covered');

        //click behavior
        targetElement.onclick = (e) => this.broadcaster.dispatchEvent(new CustomEvent('tileReveal', {detail: {x: e.target.x, y: e.target.y }}));

        //left click behavior
        targetElement.oncontextmenu = (e) => {
            //this.broadcaster.dispatchEvent(new CustomEvent('tileClick', {detail: {x: e.target.x, y: e.target.y }})); ...overcomplicates things...?

            targetElement.classList.remove(`cell-flagged-${targetData.flagState}`);
            targetData.flagState = (targetData.flagState + 1) % 3;
            targetElement.classList.add(`cell-flagged-${targetData.flagState}`);
            
            if(targetData.flagState === 0) targetElement.textContent = '';
            else targetElement.textContent = '+';


            return false;
        };

        if(this.settings.debug && this.settings.debug.active && this.settings.debug.indicate_hidden_mine && targetData.isMine){
            targetElement.style.background = '#ff0000'
        }
    }

    uncoverTile(x, y){

        let targetData = this.boardData.field[x][y];
        let targetElement = this.elements[x][y];
        
        //console.log(targetData);
        //console.log(targetElement);

        //***render uncovered tile***

        //update classes
        targetElement.classList.remove('cell-covered');
        targetElement.classList.add('cell-revealed');

        //remove flag text
        targetElement.textContent = '';
        

        //update click functionality
        targetElement.onclick = null;
        targetElement.oncontextmenu = () => false;

        //append number container if one does not exist
        if(targetElement.childNodes.length == 0 && this.settings.displayNums){

            //this only works for linear kernels
            let cellChild = targetElement.appendChild(document.createElement("div"));
            cellChild.className = `cell-value`;
            cellChild.innerHTML = targetData.value;
            //apply mine classes to tiles that are mines
            if(targetData.isMine){
                targetElement.classList.add('cell-mine');
                cellChild.classList.add('cell-value-mine');
            }

        }
        // would be cool if color mapping was done before the game
        //colorMap(tileVal, kWeight, cutoff, multiplier)
        let n = colorMap(targetData.value, this.settings.kernelWeight, 0.7, 4.5);

        targetElement.style.background = this.settings.gradients[this.colorChoice][n];

        if(this.settings.debug && this.settings.debug.active && this.settings.debug.showMines){
            
            if(targetData.isMine && targetData.value > 0){
                targetElement.style.background = '#ff2200';
            }
            if(targetData.isMine && targetData.value < 0){
                targetElement.style.background = '#00ff22';
            }
            if(targetData.isMine && targetData.value == 0){
                targetElement.style.background = '#2200ff';
            }   
        }
    }
    updateAllAppearance(){ //inefficent, should only update a list of tiles that have actually been updated
        for(let i = 0; i < this.boardData.rows; i++){
            for(let j = 0; j < this.boardData.columns; j++){
                if(this.boardData.field[i][j].revealed) this.uncoverTile(i,j);
            }
        }
    }
    revealAllExceptMines(){ //inefficent, should only update a list of tiles that have actually been updated
        for(let i = 0; i < this.boardData.rows; i++){
            for(let j = 0; j < this.boardData.columns; j++){
                if(!this.boardData.field[i][j].isMine)this.uncoverTile(i,j);
                else this.elements[i][j].onclick = null; //remove onclick from unrevealed mines
            }
        }
    }
    revealAll(){ //inefficent, should only update a list of tiles that have actually been updated
        for(let i = 0; i < this.boardData.rows; i++){
            for(let j = 0; j < this.boardData.columns; j++){
                this.uncoverTile(i,j);
            }
        }
    }

    validCoordinate(x,y){
        return this.boardData.field[x] && this.boardData.field[x][y];
    }
    //https://fontawesome.com/icons/atom?style=solid
    //https://fontawesome.com/icons/bomb?style=solid
    //https://fontawesome.com/icons/bullseye?style=solid
    //https://fontawesome.com/icons/carrot?style=solid
    //https://fontawesome.com/icons/centos?style=brands
    //
}