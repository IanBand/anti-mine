export default class BoardRender{
    //initiate board elements, handle animations, handle click events
    constructor(container, board){
        this.container = container;
        this.boardData = board;
        this.elements = [];

        //build board
        for(let i = 0; i < this.boardData.columns; i++){

            this.elements[i] = [];

            //should a reference to row be saved?
            let row = container.appendChild(document.createElement("div"));
            row.id = `row-${i}`;
            row.className = `game-row`;

            for(let j = 0; j < this.boardData.rows; j++){

                this.elements[i][j] = row.appendChild(document.createElement("div"));
                let targetElement = this.elements[i][j];

                let cellObj = this.boardData.field[i][j];

                //apply tags
                targetElement.id = cellObj.id; //unused... maybe use for animation?
                targetElement.className = 'cell';
                targetElement.x = j;
                targetElement.y = i;

                this.updateTileAppearence(i,j);
                
            }
        }
    }
    updateTileAppearence(x, y){

        let targetData = this.boardData.field[x][y];
        let targetElement = this.elements[x][y];

        if(!targetData.uncovered){
            //render covered tyle
            targetElement.classList.add('cell-covered');
            targetElement.classList.remove('cell-revealed'); //not needed unless tiles can be re-covered
            targetElement.onclick = (e) => {
                console.log('' + e.target.x + ', ' + e.target.y);
                this.boardData.uncoverTile(x,y);

                //rerender all... could also rerender only tiles that are updated
                this.updateAllAppearance();
            };
            return;
        }
        
        //***render uncovered tile***

        //update classes
        targetElement.classList.remove('cell-covered');
        targetElement.classList.add('cell-revealed');

        //update click functionality
        targetElement.onclick = null;

        //show number
        let cellChild = targetElement.appendChild(document.createElement("div"));
        cellChild.className = `cell-value`;
        cellChild.innerHTML = targetData.value;
        //apply mine classes to tiles that are mines
        if(targetData.isMine){
            targetElement.classList.add('cell-mine');
            cellChild.classList.add('cell-value-mine');
        }


        //map value => color value
        //assumes .value is in the range [-1,1]
        //colorval mapping is slapdashed as fuck but need MVP
        let normalize_midpoint = 0.6;
        let normalize_weight = 1.3;

        //manually cap color val at 0 and 255
        let colorVal =  Math.max(0, Math.min((targetData.value/normalize_weight + normalize_midpoint) * 255, 255));
        targetElement.style.background = `rgb(${Math.floor(colorVal / 2)},${Math.floor(colorVal / 1)},${Math.floor(colorVal / 1.2)})`;


    }
    updateAllAppearance(){
        for(let i = 0; i < this.boardData.columns; i++){
            for(let j = 0; j < this.boardData.rows; j++){
                this.updateTileAppearence(i,j);
            }
        }
    }
    //https://fontawesome.com/icons/atom?style=solid
    //https://fontawesome.com/icons/bomb?style=solid
    //https://fontawesome.com/icons/bullseye?style=solid
    //https://fontawesome.com/icons/carrot?style=solid
    //https://fontawesome.com/icons/centos?style=brands
    //
}