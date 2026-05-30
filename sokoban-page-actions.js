let solveMap = null;
let currentPage = 0;

function loadCombos() {
    const dropdownA = document.getElementById("comboA");
    const dropdownB = document.getElementById("comboB");
    for (let i=0; i<10; i++) {
        // Text, Value
        let txt = ("0" + String(i+1)).slice(-2);
        dropdownA.add(new Option(txt, txt));
        dropdownB.add(new Option(txt, txt));
    }
}

function loadMapOnScreen() {
    const levelA = document.getElementById('comboA').value;
    const levelB = document.getElementById('comboB').value;
    const map = getMap(levelA, levelB);
    if (map) {
        drawMap(map);
        blockControls(true);
        clearMapTextArea();
        clearSolutionTextArea();
    }
}

function limparMapa() {
    clearMap();
    blockControls(true);
    clearMapTextArea();
    clearSolutionTextArea();
}

function blockControls(blocked) {
    document.getElementById('first').disabled = blocked;
    document.getElementById('prev').disabled = blocked;
    document.getElementById('next').disabled = blocked;
    document.getElementById('last').disabled = blocked;
}

function solveGame() {
    if (memoryMap) {
        blockControls(false);
        currentPage = 0;
        solveMap = solve(memoryMap);
        updatePageCounter();
        clearMapTextArea();
        updateSolutionTextArea();
    }
}

function updatePageCounter() {
    document.getElementById('page-counter').innerHTML = 
        currentPage + ' / ' + (solveMap.moveMapList.length - 1);
}

function changePage(page) {
    if ((page < 0) || (!solveMap) || (page >= solveMap.moveMapList.length)) {
        return;
    }
    let mapPage = solveMap.moveMapList[page];
    playerPos = (page == 0) ? 'D' : solveMap.path[page-1];
    drawMap(mapPage);
    updatePageCounter();
    clearMapTextArea();
}

function nextPage() {
    if (solveMap && currentPage + 1 < solveMap.moveMapList.length) {
        changePage(++currentPage);
    }
}

function firstPage() {
    currentPage = 0;
    changePage(currentPage);
}

function lastPage() {
    if (solveMap) {
        currentPage = solveMap.moveMapList.length - 1;
        changePage(currentPage);
    }
}

function prevPage() {
    if (solveMap && currentPage > 0) {
        changePage(--currentPage);
    }
}

function clearMapTextArea() {
    document.getElementById('textarea').value = '';    
}

function clearSolutionTextArea() {
    document.getElementById('textarea-solucao').value = '';
}

function updateSolutionTextArea() {
    const dirMap = { 'U' : '⬆️', 'D' : '⬇️', 'L' : '⬅️' , 'R' : '➡️' };
    document.getElementById('textarea-solucao').value = 
        solveMap.path.split('').map(c => dirMap[c]).join(', ');
}