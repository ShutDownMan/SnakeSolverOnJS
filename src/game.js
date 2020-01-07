import Board from "/src/board.js";
import Snake from "/src/snake.js";
import Food from "/src/food.js";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SegmentSizeX,
  SegmentStrokeX,
  SegmentSizeY,
  SegmentStrokeY,
  getRandomInt
} from "/src/index.js";
import Position from "./position";
import InputHandler from "./inputHandler";
import { BoardValue } from "./board";
import { SegmentCountX, SegmentCountY } from ".";

export const GameState = {
  RUNNING: 0,
  PAUSED: 1,
  MAIN_MENU: 2,
  GAME_OVER: 3,
  WIN: 4
};

export const Direction = {
  West: 0,
  North: 1,
  East: 2,
  South: 3,
  NONE: -1
};

export default class Game {
  constructor(gameWidth, gameHeight) {
    console.log("GAME_WIDTH = " + GAME_WIDTH);
    console.log("GAME_HEIGHT = " + GAME_HEIGHT);

    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  start() {
    this.gameState = GameState.RUNNING;

    this.board = new Board(
      this.gameWidth / SegmentSizeX,
      this.gameHeight / SegmentSizeY
    );

    this.snake = new Snake(this, 0, 0);
    this.food = new Food(-1, -1);

    this.gameObjects = [this.food, this.snake];

    this.snake.start();
    this.food.start();

    this.spawnFood();
  }

  update() {
    if (this.gameState === GameState.WIN) {
      return;
    }
    [...this.gameObjects].forEach(object => object.update());
  }

  draw(ctx) {
    [...this.gameObjects].forEach(object => object.draw(ctx));
  }

  spawnFood() {
    let newX = 0;
    let newY = 0;

    do {
      newX = getRandomInt(this.gameWidth / SegmentSizeX);
      newY = getRandomInt(this.gameHeight / SegmentSizeY);
    } while (this.board.getPosition(newX, newY) !== BoardValue.NOTHING);
    //} while (0);

    //console.log("HEY " + newY + " " + newX);

    this.food.x = newX;
    this.food.y = newY;
    // console.log("NEW FOOD ON:");
    // console.log(this.food);
    this.board.updatePosition(newX, newY, BoardValue.FOOD);
  }

  drawGuideGrid(ctx) {
    let i;

    for (i = 0; i < SegmentCountX + 2; i += 2) {
      ctx.fillStyle = "#000";
      ctx.fillRect(
        i * SegmentSizeX - (SegmentSizeX - SegmentStrokeX) / 2,
        0,
        SegmentSizeX - SegmentStrokeX,
        SegmentCountY * SegmentSizeY
      );
    }
    for (i = 0; i < SegmentCountY + 2; i += 2) {
      ctx.fillStyle = "#000";
      ctx.fillRect(
        0,
        i * SegmentSizeY - (SegmentSizeY - SegmentStrokeY) / 2,
        SegmentCountX * SegmentSizeX,
        SegmentSizeY - SegmentStrokeY
      );
    }
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
