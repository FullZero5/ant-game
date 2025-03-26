const { onPlayerJoin, insertCoin, myPlayer, Joystick } = Playroom;
const { Application, Assets, AnimatedSprite, Graphics, Text } = PIXI;

// Конфигурация игры
const GameConfig = {
  ant: {
    speed: 2,
    acceleration: 0.1,
    scale: 0.2,
    animationSpeed: 0.5,
    idleAnimationSpeed: 0.3,
    movingAnimationSpeed: 0.7
  },
  maze: {
    width: 25,
    height: 25,
    wallColor: 0x654321,
    playerColors: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500],
    defaultColor: 0x000000 // Черный цвет по умолчанию
  },
  player: {
    nameTextStyle: {
      fill: 0xFFFFFF,
      fontSize: 14,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 2
    }
  },
  app: {
    backgroundColor: '#1099bb'
  }
};

class Game {
  constructor() {
    this.players = [];
    this.maze = null;
    this.tileSize = 0;
    this.fpsText = null;
    this.app = null;
    this.antFrames = [];
    this.mazeGraphics = null;
  }

  async init() {
    this.app = new Application({
      resizeTo: window,
      background: GameConfig.app.backgroundColor
    });
    document.body.appendChild(this.app.view);
  
    await this.loadAssets();
    
    this.maze = this.generateMaze();
    this.tileSize = this.calculateTileSize();
    this.initMaze();
    this.initFpsCounter();
  
    return this;
  }

  async loadAssets() {
    const framePromises = [];
    for (let i = 1; i <= 62; i++) {
      framePromises.push(Assets.load(`ants/ant_frame_${i}.png`));
    }
    this.antFrames = await Promise.all(framePromises);
  }

  initMaze() {
    this.mazeGraphics = new Graphics();
    this.drawMaze();
    this.app.stage.addChild(this.mazeGraphics);
  }

  generateMaze() {
    return [
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1],
      [1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
      [1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1],
      [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
  }

  calculateTileSize() {
    const { width, height } = GameConfig.maze;
    return Math.min(this.app.view.width, this.app.view.height) / Math.max(width, height);
  }

  drawMaze() {
    this.mazeGraphics.clear();
    this.mazeGraphics.beginFill(GameConfig.maze.wallColor);
    
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        if (this.maze[y][x] === 1) {
          this.mazeGraphics.drawRect(
            x * this.tileSize, 
            y * this.tileSize, 
            this.tileSize, 
            this.tileSize
          );
        }
      }
    }
    
    this.mazeGraphics.endFill();
  }

  initFpsCounter() {
    this.fpsText = new Text("FPS: 0", { fill: "white", fontSize: 16 });
    this.fpsText.position.set(10, 10);
    this.app.stage.addChild(this.fpsText);
  }

  createPlayer(state) {
    const joystick = new Joystick(state, { type: 'angular' });
    const ant = new AnimatedSprite(this.antFrames);
    
    ant.anchor.set(0.5);
    ant.scale.set(GameConfig.ant.scale);
    ant.animationSpeed = GameConfig.ant.animationSpeed;
    ant.position.set(this.tileSize / 2, this.tileSize + this.tileSize / 2);
    ant.stop();
    
    const profile = state.getProfile();
    let playerColor = GameConfig.maze.defaultColor; // Черный по умолчанию
    
    if (profile?.color) {
      if (typeof profile.color === 'number') {
        playerColor = profile.color;
      } else if (typeof profile.color === 'string') {
        const hex = profile.color.startsWith('#') ? profile.color.slice(1) : profile.color;
        if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
          playerColor = parseInt(hex, 16);
        }
      }
    } else {
      // Если цвет не указан, выбираем из списка по порядку
      const playerIndex = this.players.length % GameConfig.maze.playerColors.length;
      playerColor = GameConfig.maze.playerColors[playerIndex];
    }
    
    ant.tint = playerColor;
    
    const nameText = new Text(
      profile?.name || "Player",
      GameConfig.player.nameTextStyle
    );
    nameText.anchor.set(0.5);
    nameText.y = -30;
    ant.addChild(nameText);
    
    this.app.stage.addChild(ant);
    
    const player = {
      state,
      joystick,
      ant,
      nameText,
      speed: 0,
      lastDirection: 'right',
      wasMoving: false,
      color: playerColor
    };
    
    this.players.push(player);
    return player;
  }

  updatePlayer(player) {
    const { state, joystick, ant } = player;
    const isPressed = joystick.isJoystickPressed();
    const angle = joystick.angle();
    
    const moveX = isPressed ? Math.sin(angle) : 0;
    const moveY = isPressed ? Math.cos(angle) : 0;
    
    player.speed = isPressed 
      ? Math.min(player.speed + GameConfig.ant.acceleration, GameConfig.ant.speed)
      : Math.max(player.speed - GameConfig.ant.acceleration, 0);
    
    this.updateAntAnimation(player);
    
    if (player.speed > 0) {
      this.moveAnt(player, moveX, moveY);
      
      if (this.checkWin(ant.x, ant.y)) {
        state.setState('finished', true);
      }
    } else {
      this.setIdleRotation(player);
    }
    
    return this.getAntState(player);
  }

  updateAntAnimation(player) {
    const { ant } = player;
    const isMoving = player.speed > 0.1;
    
    if (isMoving) {
      const speedRatio = player.speed / GameConfig.ant.speed;
      ant.animationSpeed = GameConfig.ant.idleAnimationSpeed + 
        speedRatio * (GameConfig.ant.movingAnimationSpeed - GameConfig.ant.idleAnimationSpeed);
      if (!player.wasMoving) ant.play();
    } else if (player.wasMoving) {
      ant.stop();
    }
    
    player.wasMoving = isMoving;
  }

  moveAnt(player, moveX, moveY) {
    const { ant } = player;
    const len = Math.sqrt(moveX * moveX + moveY * moveY);
    const normX = len > 0 ? moveX / len : 0;
    const normY = len > 0 ? moveY / len : 0;
    
    const newX = ant.x + normX * player.speed;
    const newY = ant.y + normY * player.speed;
    
    if (!this.checkCollision(newX, ant.y)) ant.x = newX;
    if (!this.checkCollision(ant.x, newY)) ant.y = newY;
    
    if (moveX !== 0 || moveY !== 0) {
      ant.rotation = Math.atan2(normY, normX) + Math.PI / 2;
      player.lastDirection = normX > 0 ? 'right' : 'left';
    }
  }

  setIdleRotation(player) {
    player.ant.rotation = player.lastDirection === 'left' 
      ? -Math.PI / 2 
      : Math.PI / 2;
  }

  getAntState(player) {
    const { ant } = player;
    return {
      x: ant.x,
      y: ant.y,
      rotation: ant.rotation,
      animationSpeed: ant.animationSpeed,
      isPlaying: ant.playing
    };
  }

  updatePlayerState(player, antState) {
    if (!player || !antState) return;
    
    const { ant } = player;
    ant.position.set(antState.x, antState.y);
    ant.rotation = antState.rotation;
    ant.animationSpeed = antState.animationSpeed;
    antState.isPlaying ? ant.play() : ant.stop();
  }

  checkCollision(x, y) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    return tileX < 0 || tileY < 0 || 
           tileX >= this.maze[0].length || 
           tileY >= this.maze.length || 
           this.maze[tileY][tileX] === 1;
  }

  checkWin(x, y) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    return tileX === this.maze[0].length - 1 && tileY === this.maze.length - 2;
  }

  startGameLoop() {
    this.app.ticker.add(() => {
      this.fpsText.text = `FPS: ${Math.round(this.app.ticker.FPS)}`;
      
      const localPlayer = this.players.find(p => p.state === myPlayer());
      if (localPlayer) {
        const newState = this.updatePlayer(localPlayer);
        localPlayer.state.setState('antState', newState);
      }
      
      this.players.forEach(player => {
        const antState = player.state.getState('antState');
        this.updatePlayerState(player, antState);
      });
      
      this.app.stage.children.sort((a, b) => a.y - b.y);
    });
  }

  async run() {
    await this.init();
    
    onPlayerJoin((state) => {
      const player = this.createPlayer(state);
      const initialState = this.getAntState(player);
      state.setState('antState', initialState);
      
      state.onQuit(() => {
        player.ant.destroy();
        this.players = this.players.filter(p => p.state !== state);
      });
    });
    
    this.startGameLoop();
  }
}

// Запуск игры
insertCoin().then(() => new Game().run());