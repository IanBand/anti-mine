import Cell from './Cell.js';
import seedrandom from 'seedrandom';

export default class Board{
    //handles board memory + operations
    constructor(seed, rows, columns, numMines){ //may change to num mines + num anti mines, maybe a mine will just have random value 

        this.seed = seed;
        this.rows = rows;
        this.columns = columns;
        this.numMines = numMines;
        this.totalTiles = columns * rows;

        //instantiate field of cells
        this.field = [];
        for(let i = 0; i < this.columns; i++){
            this.field[i] = [];
            for(let j = 0; j < this.rows; j++){
                this.field[i][j] = new Cell(i,j);
            }
        }

        this.placeMines();

        //choose a kernel as an argument for placeNumbers or make one up
        //https://en.wikipedia.org/wiki/Kernel_(image_processing)

        this.placeNumbersConvolute([1,2,1]);
        //this.placeNumbersConvolute([1,1,1]);

        /*this.placeNumbersKernel([[1,2,1],
                                 [2,8,2],
                                 [1,2,1]]);*/

        

    }
    iterateOverBoard(fi, fo){
        for(let i = 0; i < this.columns; i++){
            fo(i);
            for(let j = 0; j < this.rows; j++){
                fi(i, j);
            }
        }
    }

    placeMines(){ 
        let n = this.numMines, x, y, target,
        rng = seedrandom('' + this.seed + this.rows + this.columns);


        while(n > 0){
            y = Math.floor(rng() * this.columns );
            x = Math.floor(rng() * this.rows );
            target = this.field[y][x];


            //if no mine at x,y
            if(!target.isMine){

                //place mine at target
                //possibilities values (m) for mines are:

                //m = 1
                target.value = 1;

                //m is a random element of {1, -1}
                //target.value = rng() > .5 ? 1 : -1 ;


                //m is a weighted value in (0,1] (tends to be one)
                //let r = rng();
                //target.value = 1 - r * r;


                //m is a value in [-1, 1]
                //target.value = (rng() * 2) - 1;


                /***need to playtest each!!!***/

                target.isMine = true;
                --n;
            }
        }
        
    }
    //let kernel_gauss_comp = [1,2,1];
    placeNumbersConvolute(k0, k_option){ //REWRITE IN C WITH WEBASSEMBLY...?
        //https://www.youtube.com/watch?v=SiJpkucGa1o
        //https://www.youtube.com/watch?v=C_zFhWdM4ic
        //https://en.wikipedia.org/wiki/Multidimensional_discrete_convolution
        //performs a convolution with kernel k 


        //error checking to see if second arg exists/is valid
        let k1 = k0;
        if(typeof k_option === "array"){
            k1 = k_option;
        }


        let field = this.field;

        let tempField = [];
        
        
        //instantiate temp field within first iteration

        //CONVOLVE FROM ORIG INTO TEMP ARRAY
        for(let i = 0; i < this.columns; i++){ //vertical
            
            tempField[i] = [];

            for(let j = 0; j < this.rows; j++){ //horizontal

                let terms = 0;

                tempField[i][j] = 0;

                for(let m = 0; m < k0.length; m++){

                    let offset = m - Math.floor(k0.length/2);

                    //check if kernel is out of bounds
                    if(field[i + offset] && field[i + offset][j]){

                        //convolve on (i,j)
                        tempField[i][j] += field[i + offset][j].value * k0[m]; 
                        ++terms;
                    }
                }
            }
        }

        //CONVOLVE FROM TEMP INTO/OVERWRITITNG ORIG ARRAY
        for(let i = 0; i < this.columns; i++){ //vertical
            for(let j = 0; j < this.rows; j++){ //horizontal

                let terms = 0, csum = 0;
                field[i][j].value = 0;

                for(let m = 0; m < k1.length; m++){

                    let offset = m - Math.floor(k1.length/2);

                    //check if kernel is out of bounds
                    if(field[i] && field[i][j + offset]){

                        //convolve on (i,j)
                        field[i][j].value += tempField[i][j + offset] * k1[m] / 16; 
                        ++terms;
                    }   
                }
            }
        }
    }
    placeNumbersKernel(k){
        let field = this.field;

        let tempField = [];
        
        
        //instantiate temp field within first iteration

        //iterate through image
        for(let i = 0; i < this.columns; i++){ //vertical
            tempField[i] = [];
            for(let j = 0; j < this.rows; j++){ //horizontal
                
                tempField[i][j] = 0;

                //iterate through kernel
                for(let m = 0; m < k.length; m++){

                    let offset_i = m - Math.floor(k.length/2);

                    for(let n = 0; n < k[0].length; n++ ){

                        let offset_j = n - Math.floor(k[0].length/2);
                    
                        //check if kernel is out of bounds
                        if(field[i + offset_i] && field[i + offset_i][j + offset_j]){

                            //compute new val
                            tempField[i][j] += field[i + offset_i][j + offset_j].value * k[m][n]; 
                        }
                    }
                }
            }
        }

        //put temp values in field
        for(let i = 0; i < this.columns; i++){ //vertical
            for(let j = 0; j < this.rows; j++){ //horizontal
                this.field[i][j].value = tempField[i][j];
            }
        }

    }

}