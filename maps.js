const emojis = {
    "-": " ",
    O: "🚪",
    X: "💣",
    I: "🎁",
    PLAYER: "💀",
    BOMB_COLLISION: "🔥",
    GAME_OVER: "👎",
    WIN: "🏆",
    HEART: '❤️'
  };
  const timeGame = 100;
  const mapSize = 11;
  const cellsSize = (mapSize - 1)/2;
  const levels = 10;

  const maps = [];
  const directions = {'top': 0, 'right': 1, 'down': 2, 'left': 3};
  const xDir = [0, 1, 0, -1];
  const yDir = [-1, 0, 1, 0];

  let cells;

  function positionIsInMap(x, y)
  {
      return 0 <= x && x < mapSize && 0 <= y && y < mapSize;
  }
  function index(x, y)
  {
    if (!positionIsInMap(x, y)) return -1;
    return x + y * mapSize;
  }
  function randomIndex(length)
  {
    return Math.floor(Math.random() * length);
  }
  function setMap(start)
  {
    const map = Array(mapSize * mapSize).fill('-');

    // bordes del mapa
    for (let x=0; x<mapSize; x++)
    {
      map[index(x, 0)] = 'X';
      map[index(x, mapSize-1)] = 'X';
    }
    for (let y=0; y<mapSize; y++)
    {
      map[index(0, y)] = 'X';
      map[index(mapSize-1, y)] = 'X';
    }
    // esquinas de las celdas
    for (let y=2; y<mapSize; y+=2)
      for (let x=2; x<mapSize; x+=2)
        map[index(x, y)] = 'X';

    // creacion del laberinto
    cells = [];
    for (let y=1; y<mapSize; y+=2)
      for (let x=1; x<mapSize; x+=2)
        cells.push(new Cell(x, y));
    let end = createMaze(start);

    for (let i=0; i<cells.length; i++)
    {
      // agrega el inicio y final del nivel
      if (cells[i].start)
        map[index(cells[i].x, cells[i].y)] = 'O';
      else if (cells[i].end)
        map[index(cells[i].x, cells[i].y)] = 'I';
      // agrega bombas adicionales de forma aleatoria
      for (let j=0; j<4; j++)
        if (cells[i].walls[j])
            map[cells[i].indexTranslated(cells[i].x, cells[i].y, 1, j)] = 'X';
    }
    maps.push(map);
    return end;
  }

  function createMaze(start)
  {
    let stack = [];
    let current = cells[start];
    current.visited = true;
    current.start = true;
    let counter = 1;
    let end;
    while (true)
    {
      let next = current.checkNeighbors();
      if (next)
      {
        next.visited = true;
        stack.push(current);
        removeWalls(current, next);
        current = next;
        counter++;
        if (counter == cells.length)
        {
          end = current.indexTransformed(current.x, current.y);
          current.end = true;
        }
      }
      else if (stack.length > 0)
        current = stack.pop();
      else  break;
    }
    return end;
  }
  function removeWalls(current, next)
  {
    if ((current.x - next.x) == 2)
      current.walls[directions['left']] = next.walls[directions['right']] = false;
    else
      current.walls[directions['right']] = next.walls[directions['left']] = false;
    if ((current.y - next.y) == 2)
      current.walls[directions['top']] = next.walls[directions['down']] = false;
    else
      current.walls[directions['down']] = next.walls[directions['top']] = false;
  }
  
  function Cell(x, y)
  {
    this.x = x;
    this.y = y;
    this.walls = [true, true, true, true];
    this.visited = false;
    this.start = false;
    this.end = false;

    this.indexTransformed = function(x, y)
    {
      if (!positionIsInMap(x, y)) return -1;
      return Math.floor(x/2) + Math.floor(y/2) * (mapSize-1)/2;
    }
    this.indexTranslated = function(x, y, length, dir)
    {
      x += xDir[dir] * length;
      y += yDir[dir] * length;
      if (length == 2)  return this.indexTransformed(x, y);  
      return index(x, y);
    }
    this.checkNeighbors = function()
    {
      var neighbors = [];
      for (let i=0; i<4; i++)
      {
        let cell = cells[this.indexTranslated(x, y, 2, i)];
        if (cell != undefined && !cell.visited)
          neighbors.push(cell);
      }
      if (neighbors.length > 0)
        return neighbors[randomIndex(neighbors.length)];
      return undefined;
    }
  }

  window.addEventListener('load', createMaps);

  function createMaps()
  {
    let j = 0;
    for (let i=0; i<levels; i++)
      j = setMap(j);
  }
