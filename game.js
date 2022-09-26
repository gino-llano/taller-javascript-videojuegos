// Estado del juego.
// Puede ser PLAY, PAUSE, LOSE, WIN.
// El estado PLAY se da cuando el jugador está jugando.
// El estado PAUSE se da cuando el juego está en pausa.
// El estado LOSE se da cuando se pierde el juego.
// El estado WIN se da cuando se gana el juego.
let game_state = 'PLAY';
// Nivel en el que se encuentra el jugador.
let level = 0;
// Cantidad de monedas que han sido recogidas en un nivel.
let coins = 0;
// Vidas que tiene el juegador.
let health = initial_health;
// Tiempo que le queda al jugador para terminar el juego.
let time = initial_time;
// Guarda la función que se ejecuta de forma automática cada cierto tiempo.
let interval;

// Objeto que representa al juego.
function Game()
{
    this.canvas = new Canvas();
    this.player = new Player();
    this.info = new Info();
    // Objeto que guarda a los botones del juego.
    this.buttons = 
    {
        up: document.querySelector('#up'),
        right: document.querySelector('#right'),
        left: document.querySelector('#left'),
        down: document.querySelector('#down'),
        pause: document.querySelector('#pause'),
        restart: document.querySelector('#restart'),
        menu: document.querySelector('#menu'),
        toggle: function()
        {
            if (game_state == 'PLAY' || game_state == 'PAUSE')
                this.pause.classList.toggle('paused');
            this.restart.classList.toggle('inactive');
            this.menu.classList.toggle('inactive');
        }
    };
    // Objeto que guarda a las marcas de tiempo para que se calcule el tiempo que le queda al
    // jugador para terminar el juego.
    this.time_stamps =
    {
        start: Date.now(),
        pause: undefined
    };
    // Función que se llama para iniciar el juego.
    this.start = function()
    {
        this.canvas.resize(this.player);
        this.info.show();
    }
    // Función que se llama para pausar o renaudar el juego.
    this.pause = function()
    {
        if (game_state == 'PLAY' || game_state == 'PAUSE')
        {
            if (game_state == 'PLAY')
            {
                this.time_stamps.pause = Date.now();  
                game_state = 'PAUSE';
            }
            else
            {
                this.time_stamps.start += (Date.now() - this.time_stamps.pause);
                game_state = 'PLAY';
            }
            this.buttons.toggle();
            this.canvas.draw_level(this.player);
        }
    }
    // Función que se llama para terminar el juego.
    // Recibe una cadena que indica si el jugador ganó o perdió.
    this.end = function(type)
    {
        game_state = type;
        clearInterval(interval);
        if (type == 'WIN')   this.info.show_record_time();
        this.buttons.toggle();
    }
    // Función que se ejecuta de forma automática cada cierto tiempo.
    this.automatic_function = function()
    {
        if (game_state == 'PLAY')
        {
            time = Number((initial_time - ((Date.now() - this.time_stamps.start) / 1000)).toFixed(1));
            if (time <= 0)
            {
                this.end('LOSE');
                this.canvas.draw_level(this.player);
            }
            this.info.show_time();
        }
    }
    // Función que se ejecuta cuando surge un evento que mueve al jugador.
    // Recibe el incremento que se le hace a la posición del jugador.
    this.handle_movement = function(amount)
    {
        let key = this.player.move(amount);
        if (key != undefined)
        {
            if (key == 'WALL')
            {
                health--;
                if (health == 0)        this.end('LOSE');
            }
            else if (key == 'COIN')
            {
                health++;
                coins++;
            }  
            else if (key == 'END' && coins == initial_coins)
            {
                if (level == levels - 1)    this.end('WIN');
                else
                {
                    coins = 0;
                    level++;
                }
            }
            this.info.show();
            this.canvas.draw_level(this.player);
        }
    }
    // Función que se ejecuta cuando se presiona una tecla del teclado.
    this.read_key_input = function(event)
    {
        switch (event.key)
        {
            case 'ArrowUp':
                this.handle_movement(new Vector_2d(0, -1));
                break;
            case 'ArrowDown':
                this.handle_movement(new Vector_2d(0, 1));
                break;
            case 'ArrowLeft':
                this.handle_movement(new Vector_2d(-1, 0));
                break;
            case 'ArrowRight':
                this.handle_movement(new Vector_2d(1, 0));
                break;
            case 'Escape':
                this.pause();
        }
    }

}
// Objeto que representa al canvas en el que se dibuja los mapas del juego.
function Canvas()
  {
    // Selector del elemento html.
    this.selector = document.querySelector('#game');
    // Contexto del canvas.
    this.context = this.selector.getContext('2d');
    // Ancho y alto del canvas.
    this.size;
    // Ancho y alto de un emoji dentro del canvas.
    this.emoji_size;
    // Función que se ejecuta al inicio del juego o cuando se cambia las dimensiones de la ventana.
    // Recibe al objeto que representa al jugador.
    this.resize = function(player)
    {
        // Se calcula el ancho y alto del canvas y de los emoji.
        let scale = window.innerWidth < 768 ? 0.9 : 0.7;
        this.size = Math.min(window.innerWidth, window.innerHeight) * scale;  
        this.selector.setAttribute('width', this.size);
        this.selector.setAttribute('height', this.size);
        this.emoji_size = this.size / map_size;
        this.context.font = this.emoji_size + 'px sans-serif';
        this.context.textAlign = 'end';
        // Se dibuja el mapa cada vez que se redimensiona la ventana.
        this.draw_level(player);
    }
    // Función que dibuja un emoji en el canvas.
    // Recibe la posición y el emoji.
    this.draw_emoji = function(pos, emoji)
    {
        const posX = this.emoji_size * (pos.x + 1) + this.emoji_size * 0.20;
        const posY = this.emoji_size * (pos.y + 1) - this.emoji_size * 0.15;
        this.context.fillText(emoji, posX, posY);
    }
    // Función que dibuja un mapa.
    // Recibe al objeto que representa al jugador.
    this.draw_level = function(player)
    {
      this.context.clearRect(0, 0, this.size, this.size);
        for (let y=0; y<map_size; y++)
            for (let x=0; x<map_size; x++)
            {
                let pos = new Vector_2d(x, y);
                // Si no está en pausa, se dibuja el mapa.
                if (game_state != 'PAUSE')
                {
                    const key = maps[level][pos.get_index()];
                    this.draw_emoji(pos, emojis[key]);
                    // Si la posición del jugador no es válida, se asigna la posición de inicio.
                    if (!player.pos.is_valid() && key == 'START')
                      player.pos = pos;
                }
                else this.draw_emoji(pos, emojis['BLOCK']);
            }
        // Si no está en pausa, se dibuja al jugador.
        if (game_state != 'PAUSE')
            this.draw_emoji(player.pos, emojis[game_state == 'LOSE' || game_state == 'WIN' ? game_state : 'PLAYER']);
    }
  }
// Objeto que representa al jugador.
function Player()
{
    // Posición del jugador.
    this.pos = new Vector_2d();
    // Función que se ejecuta cuando se mueve al jugador.
    // Recibe el incremento que se le hace a la posición del jugador.
    // Retorna el elemento que estaba en la nueva posición del jugador.
    this.move = function(amount)
    {
        let key = undefined;
        // Si no está en pausa y no ha terminado el juego, se mueve al jugador.
        if (game_state == 'PLAY')
        {
            this.pos = this.pos.add(amount);
            // Se contiene al jugador dentro del mapa con el efecto "pacman".
            this.pos.x = this.contain_in_map(this.pos.x);
            this.pos.y = this.contain_in_map(this.pos.y);
            key = maps[level][this.pos.get_index()];
            if (key == 'WALL' || key == 'COIN')
                maps[level][this.pos.get_index()] = 'EMPTY';
        }
        return key;
    }
    // Función que contiene un índice dentro del mapa con el efecto "pacman".
    this.contain_in_map = function(index)
    {
        if (index < 0)         return map_size - 1;
        if (index == map_size) return 0;
        return index;
    }
}
// Objeto que guarda la información que se le muestra al jugador.
// Esta información es las vidas, el nivel, el tiempo que queda y el tiempo récord.
function Info()
{
    // Elementos html.
    this.health = document.querySelector('#health');
    this.level = document.querySelector('#level');
    this.time = document.querySelector('#time');
    this.record_time = document.querySelector('#record-time');
    // Funciones que actualizan el contenido de los elementos html.
    this.show_health = () => this.health.innerHTML = health;
    this.show_level = () => this.level.innerHTML = level+1;
    this.show_time = () => this.time.innerHTML = time;
    this.show_record_time = function()
    {
        if (localStorage.getItem('recordTime') == null)
            localStorage.setItem('recordTime', 0);
        else if (Number(localStorage.getItem('recordTime')) < time && game_state == 'WIN')
            localStorage.setItem('recordTime', time);
        this.record_time.innerHTML = localStorage.getItem('recordTime');
    }
    // Función que actualiza el contenido de los elementos html de las vidas y el nivel.
    this.show_health_and_level = function()
    {
        this.show_health();
        this.show_level();
    }
    // Función que actualiza el contenido de todos los elementos html.
    this.show = function()
    {
        this.show_health_and_level();
        this.show_time();
        this.show_record_time();
    }
};
// Función que crea los mapas del juego.
function create_maps()
{
    let map = new Map();
    for (let i=0; i<levels; i++)
    {
        map.set();
        maps.push(map.array);
    }
}
// Función que se llama cuando se carga la página.
function start_game()
{
    create_maps();
    let game = new Game();
    game.start();
    window.addEventListener('resize',() => game.canvas.resize(game.player));
    window.addEventListener('keydown', (event) => game.read_key_input(event));
    game.buttons.up.addEventListener('click', () => game.handle_movement(new Vector_2d(0, -1)));
    game.buttons.left.addEventListener('click', () => game.handle_movement(new Vector_2d(-1, 0)));
    game.buttons.right.addEventListener('click', () => game.handle_movement(new Vector_2d(1, 0)));
    game.buttons.down.addEventListener('click', () => game.handle_movement(new Vector_2d(0, 1)));
    game.buttons.pause.addEventListener('click', () => game.pause());
    interval = setInterval(() => game.automatic_function(), 100);
}

// Evento que se activa cuando se carga la página.
window.addEventListener('load', start_game);






