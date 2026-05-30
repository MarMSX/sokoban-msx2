let tileset = null;
let playerPos = 'D';
let canvas = null;
let context = null;
let palCanvas = null;
let palContext = null;
let memoryMap = null;
let currentTilePal = null;
const tilePalMap = ['#', '.', '$', '*', ' ', '@', '+'];
const tileWidth = 36;
const tileHeight = 32;

function clearMap() {
    let map = Array(MAP_H).fill(" ".repeat(MAP_W));
    memoryMap = null;
    playerPos = 'D';
    drawMap(map);
    clearMapTextArea();
}

function loadGameMap() {
    canvas = document.getElementById('gameCanvas');
    context = canvas.getContext('2d');
    tileset = new Image();
    tileset.src = 'tiles.png';

    tileset.onload = function() {
        clearMap();
        createTilePalette();
        addEventListeners();
    }
}

function addEventListeners() {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;       
        onMapClick(x,y);
    });

    palCanvas.addEventListener('click', (event) => {
        const rect = palCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        onTileClick(x, y);
    });    
}

function onMapClick(x, y) {
    const mapX = Math.floor(x / (tileWidth + 1));
    const mapY = Math.floor(y / (tileHeight + 1));
    const element = tilePalMap[currentTilePal];
    setMapValue(mapX, mapY, element);
}

function setMapValue(j, i, el) {
    let line = memoryMap[i];
    memoryMap[i] = line.substring(0, j) + el + line.substring(j+1);
    drawMap(memoryMap);    
}

function drawMap(map) {
    memoryMap = [...map];
    for (let y=0; y < map.length; y++) {
        const line = map[y];
        for (let x=0; x<line.length; x++) {
            drawTile([x, y], line.charAt(x));
        }
    }
}

function drawTile(posGameMap, tile) {
    let posTileMap;

    if (tile != '@' && tile != '+') {
        switch (tile) {
            case '#' : posTileMap = [0,0]; break;
            case '.' : posTileMap = [1,0]; break;
            case '$' : posTileMap = [2,0]; break;
            case '*' : posTileMap = [3,0]; break;
            case ' ' : posTileMap = [4,0]; break;
        }
    } else {
        let y = (tile == '@') ? 1 : 2;
        switch (playerPos) {
            case 'D' : posTileMap = [0, y]; break;
            case 'U' : posTileMap = [1, y]; break;
            case 'R' : posTileMap = [2, y]; break;
            case 'L' : posTileMap = [3, y]; break;
        }
    }

    // drawImage(image, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH)
    context.drawImage(
        tileset, 
        tileWidth * posTileMap[0],
        tileHeight * posTileMap[1],
        tileWidth, tileHeight,
        (tileWidth + 1) * posGameMap[0],
        (tileHeight + 1) * posGameMap[1],
        tileWidth, tileHeight
    )
}

function createTilePalette() {
    palCanvas = document.getElementById('gameTileCanvas');
    palContext = palCanvas.getContext('2d');
    const tilePos = [[0,0], [36,0], [72,0], [108,0], [144,0], [0,32], [0,64]];

    palContext.strokeStyle = 'black';
    palContext.font = "18px Courier";
    for (let i=0; i<7; i++) {
        palContext.drawImage(
            tileset, 
            tilePos[i][0],
            tilePos[i][1],
            tileWidth, tileHeight,
            3 + (tileWidth + 3) * i,
            3,
            tileWidth, tileHeight
        )
        palContext.fillText(`"${tilePalMap[i]}"`, 3 + (tileWidth + 3) * i, 65);
    }

    onTileClick(180,0);
}

function onTileClick(x, y) {
    const tilePos = Math.floor(x / 39);
    currentTilePal = tilePos;

    palContext.strokeStyle = 'white';
    palContext.lineWidth = 3;
    for (let i=0; i<7; i++) {
        palContext.strokeRect(i*39+ 1, 1, 39, 36);
    }

    palContext.strokeStyle = 'red';
    palContext.strokeRect(tilePos*39+ 1, 1, 39, 36);
}

function loadMapFromPage() {
    const newMap = JSON.parse(document.getElementById('textarea').value);

    if (!Array.isArray(newMap)) {
        setErrorMsg(true, "O mapa deve ser um array de strings.")
        return;
    }
    for (let line of newMap) {
        if (typeof line != "string") {
            setErrorMsg(true, "O mapa deve ser um array de strings.");
            return;
        }
        if (![...line].every(c => tilePalMap.includes(c))) {
            setErrorMsg(true, `Caractere(s) inválido(s).`);
            return;
        }
    }
    memoryMap = adjustMap(newMap);
    drawMap(memoryMap);
    setErrorMsg(false);
    clearSolutionTextArea();
}

function saveMapFromPage() {
    const compressedMap = compressMap(memoryMap);
    document.getElementById('textarea').value = JSON.stringify(compressedMap);
    setErrorMsg(false);
}

function setErrorMsg(activate, msg=null) {
    if (activate) {
        document.getElementById('msg-erro').style = "display: black; color: #f00; font-size: 12px";
        document.getElementById('msg-erro').innerHTML = msg;
    } else {
        document.getElementById('msg-erro').style = "display: none";
    }
}