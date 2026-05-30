/*
Representação do Sokoban

Símbolos comuns:

# = parede / wall
. = objetivo / goal
$ = caixa / box
@ = jogador / player
* = caixa no objetivo / box on goal
+ = jogador no objetivo / player on goal
  = espaço vazio / empty space
*/
    
// Movimentos: (dx, dy)
const MOVES = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];

function parseMap(mapa) {
  const walls = new Set();
  const goals = new Set();
  const boxes = new Set();
  let player = null;

  for (let i = 0; i < mapa.length; i++) {
    for (let j = 0; j < mapa[i].length; j++) {
      const cell = mapa[i][j];
      const pos = `${i},${j}`;

      if (cell === '#') {
        walls.add(pos);
      } else if (cell === '.') {
        goals.add(pos);
      } else if (cell === '$') {
        boxes.add(pos);
      } else if (cell === '@') {
        player = pos;
      } else if (cell === '*') {
        boxes.add(pos);
        goals.add(pos);
      } else if (cell === '+') {
        player = pos;
        goals.add(pos);
      }
    }
  }

  return { walls, goals, boxes, player };
}

function bfsSolve(mapa) {
  const { walls, goals, boxes, player } = parseMap(mapa);

  const start = {
    player,
    boxes: new Set(boxes)
  };

  const queue = [[start, []]];
  const visited = new Set();

  function serialize(state) {
    const boxesArr = Array.from(state.boxes).sort();
    return `${state.player}|${boxesArr.join(';')}`;
  }

  visited.add(serialize(start));

  while (queue.length > 0) {
    const [current, path] = queue.shift();
    const { player, boxes } = current;

    // Verifica vitória
    let win = true;
    for (let box of boxes) {
      if (!goals.has(box)) {
        win = false;
        break;
      }
    }
    if (win) return path;

    const [px, py] = player.split(',').map(Number);

    for (let [dx, dy] of MOVES) {
      const newPlayer = `${px + dx},${py + dy}`;

      if (walls.has(newPlayer)) continue;

      const newBoxes = new Set(boxes);

      // Se houver caixa
      if (boxes.has(newPlayer)) {
        const [bx, by] = newPlayer.split(',').map(Number);
        const newBoxPos = `${bx + dx},${by + dy}`;

        if (walls.has(newBoxPos) || boxes.has(newBoxPos)) continue;

        newBoxes.delete(newPlayer);
        newBoxes.add(newBoxPos);
      }

      const newState = {
        player: newPlayer,
        boxes: newBoxes
      };

      const key = serialize(newState);

      if (!visited.has(key)) {
        visited.add(key);
        queue.push([newState, [...path, [dx, dy]]]);
      }
    }
  }

  return null;
}

function coords2dir(coords) {
  const directionMap = { 
    '[1,0]' : 'D', 
    '[-1,0]' : 'U',
    '[0,1]' : 'R',
    '[0,-1]' : 'L' 
  }
  dir_map = ''
  
  for (let move of coords) {
    dir_map += directionMap[JSON.stringify(move)];
  }
  return dir_map
}

function createNewMapMove(map, originalCoords, moveCoords) {
  let newMap = [...map];
  const replaceStr = (str, pos, c) => {
    return str.substring(0, pos) + c + str.substring(pos + 1);
  }
  const [i, j] = originalCoords;
  const [di, dj] = moveCoords;
  const currentCell = map[i][j];
  const moveCell = map[i+di][j+dj];
  const nextCurrentCell = (currentCell == '*' || currentCell == '+') ? '.' : ' ';
  const boxOrPlayer = (currentCell == '*' || currentCell == '$') ? '$' : '@';
  const nextMoveCell = (moveCell != '.') 
    ? boxOrPlayer 
    : (boxOrPlayer == '@') ? '+' : '*';
  newMap[i] = replaceStr(newMap[i], j, nextCurrentCell);
  newMap[i+di] = replaceStr(newMap[i+di], j+dj, nextMoveCell);

  return newMap;
}

function createMoveMaps(map, player, pathCoords) {
  let moveMapList = [];
  moveMapList.push(map);
  let moveMap = [...map];
  let pCoords = player.split(',').map(Number);

  for (let [di, dj] of pathCoords) {
    const [i, j] = pCoords;
    const nextCell = moveMap[i+di][j+dj];
    if (nextCell == '*' || nextCell == '$') {
      moveMap = createNewMapMove(moveMap, [i+di, j+dj], [di, dj]);
    }
    moveMap = createNewMapMove(moveMap, pCoords, [di, dj]);
    pCoords = [i + di, j + dj];
    moveMapList.push(moveMap);
  }

  return moveMapList;
}

function solve(mapa) {
  const { walls, goals, boxes, player } = parseMap(mapa);
  const pathCoords = bfsSolve(mapa);
  const path = coords2dir(pathCoords);
  const moveMapList = createMoveMaps(mapa, player, pathCoords);

  return { path, moveMapList };
}