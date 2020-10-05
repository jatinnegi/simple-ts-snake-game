import { AutoBind } from "../Decorators/AutoBind";

enum SnakeDirection {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowRight = "ArrowRight",
  ArrowLeft = "ArrowLeft",
  Pause = "Space",
}

interface Position {
  x: number;
  y: number;
}

const SNAKE_SIZE = 15;
const SNAKE_SPEED = 70;

export class SnakeGame {
  private gameCanvas: HTMLCanvasElement;
  private gameCtx: CanvasRenderingContext2D;
  private snakeMotion: NodeJS.Timeout | null;
  private snakeDirection: SnakeDirection;
  private snake: Position[] | null;
  private fruit: Position | null;
  private prevX: number | null;
  private prevY: number | null;
  private score: number;
  private ScoreElement: HTMLSpanElement;
  private GameStatus: HTMLHeadingElement;
  private isGameOver: boolean;

  constructor() {
    this.gameCanvas = document.getElementById(
      "game-canvas"
    )! as HTMLCanvasElement;

    this.gameCtx = this.gameCanvas.getContext("2d")!;
    this.snakeMotion = null;
    this.snakeDirection = SnakeDirection.ArrowRight;
    this.snake = [];
    this.fruit = null;
    this.prevX = null;
    this.prevY = null;
    this.score = 0;
    this.ScoreElement = document.getElementById("score")! as HTMLSpanElement;
    this.GameStatus = document.getElementById(
      "game-status"
    )! as HTMLHeadingElement;
    this.isGameOver = false;

    this.initCanvas();
    this.initSnake();
    this.initFruit();
    this.startGame();
  }

  initCanvas() {
    this.gameCanvas.height = 495;
    this.gameCanvas.width = 450;
  }

  initSnake() {
    const seedX = parseFloat(Math.random().toFixed(1));
    const seedY = parseFloat(Math.random().toFixed(1));
    const x =
      Math.round(seedX * 435) % 15 < 8
        ? Math.round(seedX * 435) - (Math.round(seedX * 435) % 15)
        : Math.round(seedX * 435) + (15 - (Math.round(seedX * 435) % 15));
    const y =
      Math.round(seedY * 480) % 15 < 8
        ? Math.round(seedY * 480) - (Math.round(seedY * 480) % 15)
        : Math.round(seedY * 480) + (15 - (Math.round(seedY * 480) % 15));

    const head: Position = {
      x,
      y,
    };

    this.snake!.push(head);

    this.drawSnake();
  }

  // fruit x max 435
  // fruit y max 480

  initFruit() {
    this.initFruitPosition();
    this.drawFruit();
  }

  initFruitPosition() {
    let overlap = false;

    do {
      const seedX = parseFloat(Math.random().toFixed(1));
      const seedY = parseFloat(Math.random().toFixed(1));
      const x =
        Math.round(seedX * 435) % 15 < 8
          ? Math.round(seedX * 435) - (Math.round(seedX * 435) % 15)
          : Math.round(seedX * 435) + (15 - (Math.round(seedX * 435) % 15));
      const y =
        Math.round(seedY * 480) % 15 < 8
          ? Math.round(seedY * 480) - (Math.round(seedY * 480) % 15)
          : Math.round(seedY * 480) + (15 - (Math.round(seedY * 480) % 15));

      this.snake!.forEach((snakePart, index) => {
        if (snakePart.x === x && snakePart.y === y) {
          overlap = true;
        }
        if (index === this.snake!.length - 1) {
          overlap = false;
        }
      });

      if (!overlap) this.fruit = { x, y };
    } while (overlap);
  }

  drawSnake() {
    this.snake!.forEach((snakePart) => {
      this.gameCtx.fillStyle = "red";
      this.gameCtx.fillRect(snakePart.x, snakePart.y, SNAKE_SIZE, SNAKE_SIZE);
      this.gameCtx.strokeRect(snakePart.x, snakePart.y, SNAKE_SIZE, SNAKE_SIZE);
    });
  }

  drawFruit() {
    this.gameCtx.fillStyle = "purple";

    this.gameCtx.fillRect(this.fruit!.x, this.fruit!.y, 15, 15);
  }

  startGame() {
    this.snakeMotion = setInterval(() => {
      this.snake!.forEach((snakePart) => {
        this.clearCanvas();
        snakePart.x = snakePart.x + 15;

        if (snakePart.x === this.gameCanvas.width) {
          snakePart.x = 0;
        }
        if (this.snakeAteFruit()) {
          this.initFruitPosition();
          this.increaseSnakeLength();
          this.updateScore();
          this.clearCanvas();
          this.drawFruit();
        }
      });
      this.drawSnake();
      this.drawFruit();
    }, SNAKE_SPEED);

    window.addEventListener("keydown", this.handleCommand);
  }

  @AutoBind
  handleCommand(e: KeyboardEvent) {
    if (
      e.code === SnakeDirection.ArrowUp &&
      this.snakeDirection !== SnakeDirection.ArrowUp &&
      !this.isGameOver
    ) {
      if (
        this.snake!.length > 1 &&
        this.snakeDirection === SnakeDirection.ArrowDown
      ) {
        return;
      }
      this.gamePause();
      this.snakeMotion = setInterval(() => {
        this.clearCanvas();
        this.snake!.forEach((snakePart, index) => {
          if (index === 0) {
            this.prevX = snakePart.x;
            this.prevY = snakePart.y;
            snakePart.y = snakePart.y - 15;
            if (snakePart.y < 0) {
              snakePart.y = this.gameCanvas.height - 15;
            }
            if (this.checkIfSnakeDead(snakePart.x, snakePart.y)) {
              this.gameOver();
            }
          } else {
            const prevX = snakePart.x;
            const prevY = snakePart.y;
            snakePart.x = this.prevX!;
            snakePart.y = this.prevY!;
            this.prevX = prevX;
            this.prevY = prevY;
          }

          if (this.snakeAteFruit()) {
            this.initFruit();
            this.increaseSnakeLength();
            this.updateScore();
            this.clearCanvas();
            this.drawFruit();
          }
        });
        this.drawSnake();
        this.drawFruit();
        this.snakeDirection = SnakeDirection.ArrowUp;
      }, SNAKE_SPEED);
    } else if (
      e.code === SnakeDirection.ArrowDown &&
      this.snakeDirection !== SnakeDirection.ArrowDown &&
      !this.isGameOver
    ) {
      if (
        this.snake!.length > 1 &&
        this.snakeDirection === SnakeDirection.ArrowUp
      ) {
        return;
      }
      this.gamePause();
      this.snakeMotion = setInterval(() => {
        this.snake!.forEach((snakePart, index) => {
          this.clearCanvas();

          if (index === 0) {
            this.prevX = snakePart.x;
            this.prevY = snakePart.y;
            snakePart.y = snakePart.y + 15;
            if (snakePart.y > this.gameCanvas.height - 15) {
              snakePart.y = 0;
            }
            if (this.checkIfSnakeDead(snakePart.x, snakePart.y)) {
              this.gameOver();
            }
          } else {
            const prevX = snakePart.x;
            const prevY = snakePart.y;
            snakePart.x = this.prevX!;
            snakePart.y = this.prevY!;
            this.prevX = prevX;
            this.prevY = prevY;
          }

          if (this.snakeAteFruit()) {
            this.initFruit();
            this.increaseSnakeLength();
            this.updateScore();
            this.clearCanvas();
            this.drawFruit();
          }
        });
        this.drawSnake();
        this.drawFruit();
        this.snakeDirection = SnakeDirection.ArrowDown;
      }, SNAKE_SPEED);
    } else if (
      e.code === SnakeDirection.ArrowLeft &&
      this.snakeDirection !== SnakeDirection.ArrowLeft &&
      !this.isGameOver
    ) {
      if (
        this.snake!.length > 1 &&
        this.snakeDirection === SnakeDirection.ArrowRight
      ) {
        return;
      }
      this.gamePause();
      this.snakeMotion = setInterval(() => {
        this.snake!.forEach((snakePart, index) => {
          this.clearCanvas();

          if (index === 0) {
            this.prevX = snakePart.x;
            this.prevY = snakePart.y;
            snakePart.x = snakePart.x - 15;
            if (snakePart.x < 0) {
              snakePart.x = this.gameCanvas.width - 15;
            }
            if (this.checkIfSnakeDead(snakePart.x, snakePart.y)) {
              this.gameOver();
            }
          } else {
            const prevX = snakePart.x;
            const prevY = snakePart.y;
            snakePart.x = this.prevX!;
            snakePart.y = this.prevY!;
            this.prevX = prevX;
            this.prevY = prevY;
          }

          if (this.snakeAteFruit()) {
            this.initFruit();
            this.increaseSnakeLength();
            this.updateScore();
            this.clearCanvas();
            this.drawFruit();
          }
        });
        this.drawSnake();
        this.drawFruit();
        this.snakeDirection = SnakeDirection.ArrowLeft;
      }, SNAKE_SPEED);
    } else if (
      e.code === SnakeDirection.ArrowRight &&
      this.snakeDirection !== SnakeDirection.ArrowRight &&
      !this.isGameOver
    ) {
      if (
        this.snake!.length > 1 &&
        this.snakeDirection === SnakeDirection.ArrowLeft
      ) {
        return;
      }
      this.gamePause();
      this.snakeMotion = setInterval(() => {
        this.snake!.forEach((snakePart, index) => {
          this.clearCanvas();
          if (index === 0) {
            this.prevX = snakePart.x;
            this.prevY = snakePart.y;
            snakePart.x = snakePart.x + 15;
            if (snakePart.x > this.gameCanvas.width - 15) {
              snakePart.x = 0;
            }
            if (this.checkIfSnakeDead(snakePart.x, snakePart.y)) {
              this.gameOver();
            }
          } else {
            const prevX = snakePart.x;
            const prevY = snakePart.y;
            snakePart.x = this.prevX!;
            snakePart.y = this.prevY!;
            this.prevX = prevX;
            this.prevY = prevY;
          }

          if (this.snakeAteFruit()) {
            this.initFruit();
            this.increaseSnakeLength();
            this.updateScore();
            this.clearCanvas();
            this.drawFruit();
          }
        });
        this.drawSnake();
        this.drawFruit();
        this.snakeDirection = SnakeDirection.ArrowRight;
      }, SNAKE_SPEED);
    } else if (e.code === SnakeDirection.Pause) {
      this.gamePause();
    }
  }

  checkIfSnakeDead(x: number, y: number): boolean {
    for (let i = 1; i < this.snake!.length; i++) {
      if (this.snake![i].x === x && this.snake![i].y === y) {
        return true;
      }
    }
    return false;
  }

  snakeAteFruit(): boolean {
    if (
      this.snake![0].x === this.fruit!.x &&
      this.snake![0].y === this.fruit!.y
    ) {
      return true;
    }
    return false;
  }

  increaseSnakeLength() {
    const tail = this.snake![this.snake!.length - 1];
    let snakePart: Position;

    if (this.snakeDirection === SnakeDirection.ArrowRight) {
      if (this.snake!.length === 1) {
        snakePart = { x: tail.x - 15, y: tail.y };
      } else {
        snakePart = { x: tail.x, y: tail.y };
      }
    } else if (this.snakeDirection === SnakeDirection.ArrowLeft) {
      if (this.snake!.length === 1) {
        snakePart = { x: tail.x + 15, y: tail.y };
      } else {
        snakePart = { x: tail.x, y: tail.y };
      }
    } else if (this.snakeDirection === SnakeDirection.ArrowUp) {
      if (this.snake!.length === 1) {
        snakePart = { x: tail.x, y: tail.y + 15 };
      } else {
        snakePart = { x: tail.x, y: tail.y };
      }
    } else if (this.snakeDirection === SnakeDirection.ArrowDown) {
      if (this.snake!.length === 1) {
        snakePart = { x: tail.x, y: tail.y - 15 };
      } else {
        snakePart = { x: tail.x, y: tail.y };
      }
    }

    this.snake!.push(snakePart!);
  }

  updateScore() {
    this.score += 10;
    this.ScoreElement.innerText = this.score.toString();
  }

  clearCanvas() {
    this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
  }

  gameOver() {
    clearInterval(this.snakeMotion!);
    this.isGameOver = true;
    this.GameStatus.innerText = `Game Over! Your score is ${this.score}`;
  }

  gamePause() {
    clearInterval(this.snakeMotion!);
  }
}
