  const images = 
  {
    END: new Image(),
    PLAYER: new Image(),
    LOSE: new Image(),
    WIN: new Image(),
    COIN: new Image()
  };
  images.END.src = 'https://cdn-icons-png.flaticon.com/512/3223/3223283.png';
  images.PLAYER.src = 'https://cdn-icons-png.flaticon.com/512/3404/3404173.png';
  images.LOSE.src = 'https://cdn-icons-png.flaticon.com/512/8538/8538367.png';
  images.WIN.src = 'https://cdn-icons-png.flaticon.com/512/1933/1933704.png';
  images.COIN.src = 'https://cdn-icons-png.flaticon.com/512/2529/2529396.png';


  // Cantidad de niveles del juego.
  const levels = 10;
  // Cantidad de vidas al inicio del juego.
  const initial_health = 1;
  // Tiempo en segundos que se tiene para terminar el juego.
  const initial_time = 100;
  // Cantidad de monedas por nivel.
  const initial_coins = 1;
  // Ancho y alto de los mapas del juego.
  // Debe ser un número impar para que funcione el algoritmo que genera el laberinto. 
  const map_size = 13;
  // Arreglo que guarda los mapas del juego.
  const maps = [];
  // Objeto que le asigna un número a una dirección.
  const dir_keys = {'top': 0, 'right': 1, 'down': 2, 'left': 3};
  // Arreglo que guarda los vectores que se le suman a una posición
  // para que se traslade una unidad en una dirección.
  // Guarda relación con el orden en que están las direcciones en el objeto dir_keys.
  const dir = [];
  dir.push(new Vector_2d(0, -1));
  dir.push(new Vector_2d(1, 0));
  dir.push(new Vector_2d(0, 1));
  dir.push(new Vector_2d(-1, 0));

  // Devuelve un número aleatorio entre 0 y length-1
  function random_index(length)
  {
    return Math.floor(Math.random() * length);
  }
  // Objeto que representa a un vector en dos dimensiones.
  function Vector_2d(x = undefined, y = undefined)
  {
    this.x = x;
    this.y = y;
    // Esta función recibe otro vector y retorna true si son iguales o false si no.
    this.equals = (other) => this.x == other.x && this.y == other.y;
    // Esta función recibe un número y retorna el vector escalado.
    this.scale = (k) => new Vector_2d(k * this.x, k * this.y);
    // Esta función recibe otro vector y retorna la suma.
    this.add = (other) => new Vector_2d(this.x + other.x, this.y + other.y);
    // Esta función recibe otro vector y retorna la resta.
    this.substract = (other) => this.add(other.scale(-1));
    // Esta función recibe una dirección y, opcionalmente, una longitud.
    // Retorna el vector trasladado.
    this.get_translated = (indexDir, length = 1) => this.add(dir[indexDir].scale(length));
    // Esta función retorna true si el vector está en el mapa y false si no.
    this.is_in_map = () => 0 <= this.x && this.x < map_size && 0 <= this.y && this.y < map_size;
    // Esta función retorna el índice del arreglo del mapa correspondiente al vector.
    this.get_index = () => this.is_in_map() ? this.x + this.y * map_size : -1;
    // Esta función retorna el índice del arreglo del mapa correspondiente al vector trasladado. 
    this.get_index_translated = (indexDir, length = 1) => this.get_translated(indexDir, length).get_index();
    // Esta función asigna undefined a las coordenadas del vector.
    this.clear = function()
    {
      this.x = undefined;
      this.y = undefined;
    }
    // Esta función retorna false si las coordenadas son undefined y true si no.
    this.is_valid = () => this.x != undefined && this.y != undefined;
  }
  // Objeto que representa a una celda.
  // Una celda tiene una posición, un arreglo de booleanos que indica si tiene una pared en alguna dirección y
  // un booleano que indica si ha sido visitado.
  function Cell(pos)
  {
    this.pos = pos;
    this.walls = [true, true, true, true];
    this.visited = false;
  }
  // Objeto que guarda el arreglo del submapa.
  /*
    El siguiente gráfico representa al mapa y al submapa.
         0  1  2  3  4  5  6  7  8  9  10
      0  X  X  X  X  X  X  X  X  X  X  X
      1  X  #     #     #     #     #  X
      2  X     X     X     X     X     X
      3  X  #     #     #     #     #  X
      4  X     X     X     X     X     X
      5  X  #     #     #     #     #  X
      6  X     X     X     X     X     X
      7  X  #     #     #     #     #  X
      8  X     X     X     X     X     X
      9  X  #     #     #     #     #  X
      10 X  X  X  X  X  X  X  X  X  X  X
    Este es el estado de un mapa antes de agregarle paredes de forma aleatoria.
    El X representa a las paredes.
    El # representa a las posiciones que conforman el submapa y se consideran para el algoritmo.
    A estas posiciones se les llama celdas.
    Todas las celdas tienen entre 2 a 4 celdas vecinas (arriba, derecha, abajo, izquierda).
    Entre dos celdas adjacentes hay una pared.
    Al inicio del algoritmo todas la celdas tienen todas sus paredes.
    El algoritmo se encarga de remover algunas paredes de forma que se genera un laberinto.
    Más información: https://www.youtube.com/watch?v=HyK_Q5rrcr4
  */
  function Cell_Map()
  {
    this.array;
    this.sub_map_size = (map_size-1)/2;
    // Índice inicial del submapa.
    this.start_index = random_index(this.sub_map_size ** 2);
    // Esta función llena el arreglo del submapa con celdas.
    // Luego llama al algoritmo que remueve algunas paredes entre celdas.
    this.set = function()
    {
      this.array = [];
      for (let y=1; y<map_size; y+=2)
        for (let x=1; x<map_size; x+=2)
          this.array.push(new Cell(new Vector_2d(x, y)));
      this.remove_walls();
    }
    // Esta función es el algoritmo para crear el laberinto.
    this.remove_walls = function()
    {
      // Pila que guarda las celdas visitadas.
      let stack = [];
      // Celda actual.
      let current = this.array[this.start_index];
      current.visited = true;
      // Bucle que se detiene cuando ya se visitaron todas las celdas y la pila está vacía
      while (true)
      {
        let next = this.get_next_cell(current.pos);
        if (next)
        {
          next.visited = true;
          stack.push(current);
          this.remove_wall(current, next);
          current = next;
        }
        else if (stack.length > 0)
          current = stack.pop();
        else  break;
      }
    }
    // Esta función recibe la celda actual y la siguiente.
    // Se encarga de remover la pared entre estas dos celdas.
    this.remove_wall = function(current, next)
    {
      if ((current.pos.x - next.pos.x) == 2)
        current.walls[dir_keys['left']] = next.walls[dir_keys['right']] = false;
      else if ((current.pos.x - next.pos.x) == -2)
        current.walls[dir_keys['right']] = next.walls[dir_keys['left']] = false;
      else if ((current.pos.y - next.pos.y) == 2)
        current.walls[dir_keys['top']] = next.walls[dir_keys['down']] = false;
      else
        current.walls[dir_keys['down']] = next.walls[dir_keys['top']] = false;
    }
    // Esta función recibe un punto del mapa y devuelve el índice del arreglo del submapa correspondiente.
    // Si el punto no está en el mapa retorna -1.
    this.get_index_transformed = (pos) => pos.is_in_map() ? (pos.x-1)/2 + (pos.y-1)/2 * this.sub_map_size : -1;
    // Esta función recibe un índice del arreglo del submapa y devuelve el punto del mapa correspondiente.
    this.get_pos_transformed = (index) => new Vector_2d((index % this.sub_map_size) * 2 + 1,
                                                        (Math.floor(index / this.sub_map_size)) * 2 + 1);
    // Esta función recibe un punto del mapa, calcula el índice del arreglo del submapa correspondiente
    // y asigna este valor al índice inicial.
    this.set_start_index = (pos) => this.start_index = this.get_index_transformed(pos);
    // Esta función retorna el punto del mapa correspondiente con el índice inicial del arreglo del submapa.
    this.get_start_pos = () => this.get_pos_transformed(this.start_index);
    // Esta función recibe un punto del mapa y crea un arreglo de las celdas adjacentes que aún no han sido visitadas.
    // Si el arreglo no está vacío retorna una de estas celdas de forma aleatoria.
    // Si el arreglo está vacío retorna undefined.
    this.get_next_cell = function(pos)
    {
      var neighbors = [];
      for (let i=0; i<4; i++)
      {
        let pos_translated = pos.get_translated(i, 2);
        let cell = this.array[this.get_index_transformed(pos_translated)];
        if (cell && !cell.visited)
          neighbors.push(cell);
      }
      return neighbors.length > 0 ? neighbors[random_index(neighbors.length)] : undefined;
    }
    // Esta función recibe el arreglo del mapa para agregarle la posición inicial y paredes adicionales.
    this.modify_map = function(map_array)
    {
      map_array[this.get_start_pos().get_index()] = 'START';
      for (let cell of this.array)
        for (let j=0; j<4; j++)
          if (cell.walls[j])
            map_array[cell.pos.get_index_translated(j)] = 'WALL';
    }
  }
  // Objeto que guarda el arreglo del mapa.
  function Map()
  {
    this.array;
    this.cell_map = new Cell_Map();
    // Esta función llena el arreglo del mapa con diferentes elementos.
    this.set = function()
    {
      // Se establece el estado inicial del mapa.
      this.set_initial_state();
      // Se crea el laberinto.
      this.cell_map.set();
      this.cell_map.modify_map(this.array);
      // Se calcula la posición final del mapa.
      let start_pos = this.cell_map.get_start_pos();
      let end_pos = this.find_longest_path(undefined, start_pos, 0).pos;
      this.array[end_pos.get_index()] = 'END';
      this.cell_map.set_start_index(end_pos);
      // Se colocan las monedas.
      this.locate_coins();
    }
    // Esta función establece el estado inicial del arreglo del mapa.
    this.set_initial_state = function()
    {
      this.array = Array(map_size ** 2).fill('EMPTY');
      for (let x=0; x<map_size; x++)
      {
        let posUp = new Vector_2d(x, 0);
        let posDown = new Vector_2d(x, map_size-1);
        this.array[posUp.get_index()] = this.array[posDown.get_index()] = 'WALL';
      }
      for (let y=0; y<map_size; y++)
      {
        let posLeft = new Vector_2d(0, y);
        let posRight = new Vector_2d(map_size-1, y);
        this.array[posLeft.get_index()] = this.array[posRight.get_index()] = 'WALL';
      }
      for (let y=2; y<map_size; y+=2)
        for (let x=2; x<map_size; x+=2)
          this.array[new Vector_2d(x, y).get_index()] = 'WALL';
    }
    // Esta función recursiva calcula la posición más alejada de la posición que se pase como argumento.
    this.find_longest_path = function(previous_pos, pos_, length_)
    {
      let obj = {pos: pos_, length: length_};
      for (let i=0; i<4; i++)
      {
        let pos_translated = pos_.get_translated(i);
        if (this.array[pos_translated.get_index()] == 'EMPTY' &&
            (previous_pos == undefined || !pos_translated.equals(previous_pos)))
        {
          let other = this.find_longest_path(pos_, pos_translated, length_ + 1);
          if (obj.length < other.length)
            obj = other;
        }
      }
      return obj;
    }
    // Esta función coloca las monedas de forma aleatoria.
    this.locate_coins = function()
    {
      // Se colocan las monedas
      for (let i=0; i<initial_coins; i++)
      {
        let j;
        do
        {
          j = random_index(map_size ** 2);
        } while(this.array[j] != 'EMPTY');
        this.array[j] = 'COIN';
      }
    }
  }