import Board from "/src/board.js";
import Snake from "/src/snake.js";
import Food from "/src/food.js";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SegmentSize,
  SegmentStroke,
  getRandomInt
} from "/src/index.js";
import Position from "./Position";
import InputHandler from "./inputHandler";
import { BoardValue } from "./board";

export const GameState = {
  RUNNING: 0,
  PAUSED: 1,
  MAIN_MENU: 2,
  GAME_OVER: 3,
  NEW_LEVEL: 4
};

export const Direction = {
  West: 0,
  North: 1,
  East: 2,
  South: 3
};

export default class Game {
  constructor(gameWidth, gameHeight) {
    console.log("GAME_WIDTH = " + GAME_WIDTH);

    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;

    this.gameState = GameState.RUNNING;

    this.length = 3;

    this.board = new Board(
      this.gameWidth / SegmentSize,
      this.gameHeight / SegmentSize
    );
    /*
    this.snake = new Snake(
      this.gameWidth / SegmentSize / 2,
      this.gameHeight / SegmentSize / 2
    );
*/
    this.snake = new Snake(this, 0, 0);
    this.food = new Food(this, -1, -1);

    this.gameObjects = [this.food, this.snake];
    this.inputHandler = new InputHandler(this);
  }

  start() {
    if (
      this.gameState === GameState.PAUSED ||
      this.gameState === GameState.MAIN_MENU
    )
      return;

    this.spawnFood();
  }

  update() {
    [...this.gameObjects].forEach(object => object.update());
  }

  draw(ctx) {
    [...this.gameObjects].forEach(object => object.draw(ctx));
  }

  spawnFood() {
    let newX = 0;
    let newY = 0;

    do {
      newX = getRandomInt(this.gameWidth / SegmentSize);
      newY = getRandomInt(this.gameHeight / SegmentSize);
    } while (this.board.getPosition(newX, newY) !== BoardValue.NOTHING);
    //} while (0);

    this.food.x = newX;
    this.food.y = newY;
    this.board.updatePosition(newX, newY, BoardValue.FOOD);
  }
}

export function getAdjcentSegment(x, y, direction) {
  let newX = x;
  let newY = y;

  if (direction % 2) {
    newY += direction - 2;
  } else {
    newX += direction - 1;
  }

  return new Position(newX, newY);
}
