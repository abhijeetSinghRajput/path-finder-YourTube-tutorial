const board = document.getElementById('board');
var cells;
let row, col;
var matrix;
let source_Cordinate;
let target_Cordinate;
renderBoard();
function renderBoard(cellWidth = 22) {
    const root = document.documentElement;
    root.style.setProperty('--cell-width', `${cellWidth}px`);
    row = Math.floor(board.clientHeight / cellWidth);
    col = Math.floor(board.clientWidth / cellWidth);
    board.innerHTML = '';
    cells = [];
    matrix = [];

    for (let i = 0; i < row; i++) {
        const rowArr = [];
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        rowElement.setAttribute('id', `${i}`);

        for (let j = 0; j < col; j++) {
            const colElement = document.createElement('div');
            colElement.classList.add('col');
            colElement.setAttribute('id', `${i}-${j}`);
            cells.push(colElement);
            rowArr.push(colElement);
            rowElement.appendChild(colElement);
        }

        matrix.push(rowArr);
        board.appendChild(rowElement);
    }

    source_Cordinate = set('source');
    target_Cordinate = set('target');
    boardInteraction(cells);
}

const navOptions = document.querySelectorAll('.nav-menu>li>a');
var dropOptions = null;

const removeActive = (elements, parent = false) => {
    elements.forEach(element => {
        if (parent) element = element.parentElement;
        element.classList.remove('active');
    });
}

navOptions.forEach(navOption => {
    navOption.addEventListener('click', () => {
        const li = navOption.parentElement;
        if (li.classList.contains('active')) {
            li.classList.remove('active');
            return;
        }
        removeActive(navOptions, true);
        li.classList.add('active');

        if (li.classList.contains('drop-box')) {
            dropOptions = li.querySelectorAll('.drop-menu>li');

            toggle_dropOption(navOption.innerText);
        }
    })
})


let pixelSize = 22;
let speed = 'normal';
let algorithm = 'BFS';
const visualizeBtn = document.getElementById('visualize');

function toggle_dropOption(target) {
    dropOptions.forEach(dropOption => {
        dropOption.addEventListener('click', () => {
            removeActive(dropOptions);
            dropOption.classList.add('active');

            if (target === 'pixel') {
                pixelSize = +dropOption.innerText.replace('px', '');
                renderBoard(pixelSize);
            }
            else if (target === 'speed') {
                speed = dropOption.innerText;
            }
            else {
                algorithm = dropOption.innerText.split(' ')[0];
                visualizeBtn.innerText = `visualize ${algorithm}`
            }

            removeActive(navOptions, true);
        })
    })
}

document.addEventListener('click', (e) => {
    const navMenu = document.querySelector('.nav-menu');

    if (!navMenu.contains(e.target)) {
        removeActive(navOptions, true);
    }
})



function isValid(x, y) {
    return (x >= 0 && y >= 0 && x < row && y < col)
}
function set(className, x = -1, y = -1) {
    if (isValid(x, y)) {
        matrix[x][y].classList.add(className);
    }
    else {
        x = Math.floor(Math.random() * row);
        y = Math.floor(Math.random() * col);
        matrix[x][y].classList.add(className);
    }

    return { x, y };
}


//=======================================
//======== board interaction 🔵👆 ======
//=======================================

function boardInteraction(cells) {
    let isDrawing = false;
    let isDragging = false;
    let DragPoint = null;

    cells.forEach((cell) => {

        const pointerdown = (e) => {
            if (e.target.classList.contains('source')) {
                DragPoint = 'source';
                isDragging = true;
            }
            else if (e.target.classList.contains('target')) {
                DragPoint = 'target';
                isDragging = true;
            }
            else {
                isDrawing = true;
            }
        }

        const pointermove = (e) => {
            if (isDrawing && !e.target.classList.contains('source') && !e.target.classList.contains('target')) {
                e.target.classList.add('wall');
            }
            else if (DragPoint && isDragging) {
                cells.forEach(cell => {
                    cell.classList.remove(`${DragPoint}`);
                })

                e.target.classList.add(`${DragPoint}`)
                const cordinate = e.target.id.split('-');

                if (DragPoint === 'source') {
                    source_Cordinate.x = +cordinate[0];
                    source_Cordinate.y = +cordinate[1];
                }
                else {
                    target_Cordinate.x = +cordinate[0];
                    target_Cordinate.y = +cordinate[1];
                }
            }
        }
        const pointerup = () => {
            isDragging = false;
            isDrawing = false;
            DragPoint = null;
        }
        cell.addEventListener('pointerdown', pointerdown);
        cell.addEventListener('pointermove', pointermove);
        cell.addEventListener('pointerup', pointerup);
        cell.addEventListener('click', () => {
            cell.classList.toggle('wall');
        })
    });
}

const clearPathBtn = document.getElementById('clearPath');
const clearBoardBtn = document.getElementById('clearBoard');

clearPathBtn.addEventListener('click', clearPath);
clearBoardBtn.addEventListener('click', clearBoard);

function clearPath() {
    cells.forEach(cell => {
        cell.classList.remove('visited');
        cell.classList.remove('path');
    })
}

function clearBoard() {
    cells.forEach(cell => {
        cell.classList.remove('visited');
        cell.classList.remove('wall');
        cell.classList.remove('path');
    })
}




//=======================================
//========= MAZE GENERATION 🧩🧩 =======
//=======================================

var wallToAnimate;
const generateMazeBtn = document.getElementById('generateMazeBtn');

generateMazeBtn.addEventListener('click', () => {
    wallToAnimate = [];
    generateMaze(0, row - 1, 0, col - 1, false, 'horizontal');
    animate(wallToAnimate, 'wall');
})

function generateMaze(rowStart, rowEnd, colStart, colEnd, surroundingWall, orientation) {
    if (rowStart > rowEnd || colStart > colEnd) {
        return;
    }

    if (!surroundingWall) {
        for (let i = 0; i < col; i++) {
            if (!matrix[0][i].classList.contains('source') && !matrix[0][i].classList.contains('target'))
                wallToAnimate.push(matrix[0][i]);

            if (!matrix[row - 1][i].classList.contains('source') && !matrix[row - 1][i].classList.contains('target'))
                wallToAnimate.push(matrix[row - 1][i]);
        }

        for (let i = 0; i < row; i++) {
            if (!matrix[i][0].classList.contains('source') && !matrix[i][0].classList.contains('target'))
                wallToAnimate.push(matrix[i][0]);

            if (!matrix[i][col - 1].classList.contains('source') && !matrix[i][col - 1].classList.contains('target'))
                wallToAnimate.push(matrix[i][col - 1]);
        }

        surroundingWall = true;
    }

    if (orientation === 'horizontal') {
        let possibleRows = [];
        for (let i = rowStart; i <= rowEnd; i += 2) {
            possibleRows.push(i);
        }

        let possibleCols = [];
        for (let i = colStart - 1; i <= colEnd + 1; i += 2) {
            if (i > 0 && i < col - 1)
                possibleCols.push(i);
        }

        let currentRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
        let randomCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];

        for (let i = colStart - 1; i <= colEnd + 1; i++) {
            const cell = matrix[currentRow][i];

            if (!cell || i === randomCol || cell.classList.contains('source') || cell.classList.contains('target'))
                continue;

            wallToAnimate.push(cell);
        }
        //upper subDivision
        generateMaze(rowStart, currentRow - 2, colStart, colEnd, surroundingWall, (currentRow - 2 - rowStart > colEnd - colStart) ? 'horizontal' : 'vertical');

        //bottom subDivision
        generateMaze(currentRow + 2, rowEnd, colStart, colEnd, surroundingWall, (rowEnd - (currentRow + 2) > colEnd - colStart) ? 'horizontal' : 'vertical');
    }
    else {
        let possibleCols = [];
        for (let i = colStart; i <= colEnd; i += 2) {
            possibleCols.push(i);
        }

        let possibleRows = [];
        for (let i = rowStart - 1; i <= rowEnd + 1; i += 2) {
            if (i > 0 && i < row - 1)
                possibleRows.push(i);
        }

        let currentCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];
        let randomRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];


        for (let i = rowStart - 1; i <= rowEnd + 1; i++) {
            if (!matrix[i]) continue;

            const cell = matrix[i][currentCol];

            if (i === randomRow || cell.classList.contains('source') || cell.classList.contains('target'))
                continue;

            wallToAnimate.push(cell);
        }

        //right subDivision
        generateMaze(rowStart, rowEnd, colStart, currentCol - 2, surroundingWall, (rowEnd - rowStart > currentCol - 2 - colStart) ? 'horizontal' : 'vertical');

        //right subDivision
        generateMaze(rowStart, rowEnd, currentCol + 2, colEnd, surroundingWall, (rowEnd - rowStart > colEnd - (currentCol + 2)) ? 'horizontal' : 'vertical');
    }

}






//=======================================
//=========== Path Finding ⚙️🦾 ========
//=======================================
var visitedCell;
var pathToAnimate;

visualizeBtn.addEventListener('click', () => {
    clearPath();
    visitedCell = [];
    pathToAnimate = [];

    switch (algorithm) {
        case 'BFS':
            BFS();
            break;
        case 'Dijkstar\'s':
            Dijsktra();
            break;
        case 'greedy':
            Greedy();
            break;
        case 'A*':
            Astar();
            break;
        case 'DFS':
    if (DFS(source_Cordinate)) visitedCell.push(matrix[source_Cordinate.x][source_Cordinate.y]);

            break;
    
        default:
            break;
    }
    animate(visitedCell, 'visited');
})





//===================== BFS ==================

function BFS() {
    const queue = [];
    const visited = new Set();
    const parent = new Map();

    queue.push(source_Cordinate);
    visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

    while (queue.length > 0) {
        const current = queue.shift();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
            getPath(parent, target_Cordinate);
            return;
        }

        const neighbours = [
            { x: current.x - 1, y: current.y },//up
            { x: current.x, y: current.y + 1 },//right
            { x: current.x + 1, y: current.y },//bottom
            { x: current.x, y: current.y - 1 }//right
        ];

        for (const neighbour of neighbours) {
            const key = `${neighbour.x}-${neighbour.y}`;

            if (isValid(neighbour.x, neighbour.y) &&
                !visited.has(key) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ) {
                queue.push(neighbour);
                visited.add(key);
                parent.set(key, current);
            }
        }
    }
}

function animate(elements, className) {
    let delay = 10;
    if (className === 'path')
        delay *= 3.5;

    for (let i = 0; i < elements.length; i++) {
        setTimeout(() => {
            elements[i].classList.remove('visited');
            elements[i].classList.add(className);
            if (i === elements.length - 1 && className === 'visited') {
                animate(pathToAnimate, 'path');
            }
        }, delay * i);
    }
}

function getPath(parent, target) {
    if (!target) return;
    pathToAnimate.push(matrix[target.x][target.y]);

    const p = parent.get(`${target.x}-${target.y}`);
    getPath(parent, p);
}



//============ Dijsktra's Algorithm ==========

class PriorityQueue {
    constructor() {
        this.elements = [];
        this.length = 0;
    }
    push(data) {
        this.elements.push(data);
        this.length++;
        this.upHeapify(this.length - 1);
    }
    pop() {
        this.swap(0, this.length - 1);
        const popped = this.elements.pop();
        this.length--;
        this.downheapify(0);
        return popped;
    }

    upHeapify(i) {
        if (i === 0) return;
        const parent = Math.floor((i - 1) / 2);
        if (this.elements[i].cost < this.elements[parent].cost) {
            this.swap(parent, i);
            this.upHeapify(parent);
        }
    }
    downheapify(i) {
        let minNode = i;
        const leftChild = (2 * i) + 1;
        const rightChild = (2 * i) + 2;

        if (leftChild < this.length && this.elements[leftChild].cost < this.elements[minNode].cost) {
            minNode = leftChild;
        }
        if (rightChild < this.length && this.elements[rightChild].cost < this.elements[minNode].cost) {
            minNode = rightChild;
        }

        if (minNode !== i) {
            this.swap(minNode, i);
            this.downheapify(minNode);
        }
    }
    isEmpty() {
        return this.length === 0;
    }
    swap(x, y) {
        [this.elements[x], this.elements[y]] = [this.elements[y], this.elements[x]];
    }
}

function Dijsktra() {
    const pq = new PriorityQueue();
    const parent = new Map();
    const distance = [];

    for (let i = 0; i < row; i++) {
        const INF = [];
        for (let j = 0; j < col; j++) {
            INF.push(Infinity);
        }
        distance.push(INF);
    }

    distance[source_Cordinate.x][source_Cordinate.y] = 0;
    pq.push({ cordinate: source_Cordinate, cost: 0 });

    while (!pq.isEmpty()) {
        const { cordinate: current, cost: distanceSoFar } = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
            getPath(parent, target_Cordinate);
            return;
        }

        const neighbours = [
            { x: current.x - 1, y: current.y },//up
            { x: current.x, y: current.y + 1 },//right
            { x: current.x + 1, y: current.y },//bottom
            { x: current.x, y: current.y - 1 }//right
        ];

        for (const neighbour of neighbours) {
            const key = `${neighbour.x}-${neighbour.y}`;

            if (isValid(neighbour.x, neighbour.y) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ) {
                //Assuming edge weight = 1, between adjacent vertices
                const edgeWeight = 1;
                const distanceToNeighbour = distanceSoFar + edgeWeight;

                if (distanceToNeighbour < distance[neighbour.x][neighbour.y]) {
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    pq.push({ cordinate: neighbour, cost: distanceToNeighbour });
                    parent.set(key, current);
                }
            }
        }
    }
}


//============== Greedy Algorithm ============

function heuristicValue(node) {
    return Math.abs(node.x - target_Cordinate.x) + Math.abs(node.y - target_Cordinate.y);
}

function Greedy() {
    const queue = new PriorityQueue();
    const visited = new Set();
    const parent = new Map();

    queue.push({ cordinate: source_Cordinate, cost: heuristicValue(source_Cordinate) });
    visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

    while (queue.length > 0) {
        const { cordinate: current } = queue.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
            getPath(parent, target_Cordinate);
            return;
        }

        const neighbours = [
            { x: current.x - 1, y: current.y },//up
            { x: current.x, y: current.y + 1 },//right
            { x: current.x + 1, y: current.y },//bottom
            { x: current.x, y: current.y - 1 }//right
        ];

        for (const neighbour of neighbours) {
            const key = `${neighbour.x}-${neighbour.y}`;

            if (isValid(neighbour.x, neighbour.y) &&
                !visited.has(key) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ) {
                queue.push({ cordinate: neighbour, cost: heuristicValue(neighbour) });
                visited.add(key);
                parent.set(key, current);
            }
        }
    }
}


//============== Astar Algorithm =============
//Dijkstar's + Greedy = Astar
//distance + heuristic 

function Astar() {
    const queue = new PriorityQueue();;
    const visited = new Set();//closedset
    const queued = new Set();//openset
    const parent = new Map();
    const gScore = [];

    for (let i = 0; i < row; i++) {
        const INF = [];
        for (let j = 0; j < col; j++) {
            INF.push(Infinity);
        }
        gScore.push(INF);
    }

    gScore[source_Cordinate.x][source_Cordinate.y] = 0;
    queue.push({ cordinate: source_Cordinate, cost: heuristicValue(source_Cordinate) });
    visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

    while (queue.length > 0) {
        const { cordinate: current } = queue.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
            getPath(parent, target_Cordinate);
            return;
        }

        visited.add(`${current.x}-${current.y}`);

        const neighbours = [
            { x: current.x - 1, y: current.y },//up
            { x: current.x, y: current.y + 1 },//right
            { x: current.x + 1, y: current.y },//bottom
            { x: current.x, y: current.y - 1 }//right
        ];

        for (const neighbour of neighbours) {
            const key = `${neighbour.x}-${neighbour.y}`;

            if (isValid(neighbour.x, neighbour.y) &&
                !visited.has(key) &&
                !queued.has(key) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ) {

                //Assuming edge weight = 1, between adjacent vertices
                const edgeWeight = 1;
                const gScoreToNeighbour = gScore[current.x][current.y] + edgeWeight;
                const fScore = gScoreToNeighbour + heuristicValue(neighbour);

                if (gScoreToNeighbour < gScore[neighbour.x][neighbour.y]) {
                    gScore[neighbour.x][neighbour.y] = gScoreToNeighbour;

                    queue.push({ cordinate: neighbour, cost: fScore });
                    queued.add(key);//openset

                    parent.set(key, current);
                }
            }
        }
    }
}

//=============== DFS Algorithm ==============
const visited = new Set();
function DFS(current) {
    //base case
    if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
        return true;
    }

    visitedCell.push(matrix[current.x][current.y]);
    visited.add(`${current.x}-${current.y}`);

    const neighbours = [
        { x: current.x - 1, y: current.y },//up
        { x: current.x, y: current.y + 1 },//right
        { x: current.x + 1, y: current.y },//bottom
        { x: current.x, y: current.y - 1 }//right
    ];

    for (const neighbour of neighbours) {
        if (isValid(neighbour.x, neighbour.y) &&
            !visited.has(`${neighbour.x}-${neighbour.y}`) &&
            !matrix[neighbour.x][neighbour.y].classList.contains('wall')) {
            if (DFS(neighbour)) {
                pathToAnimate.push(matrix[neighbour.x][neighbour.y]);
                return true;
            }

        }
    }

    return false;
}
