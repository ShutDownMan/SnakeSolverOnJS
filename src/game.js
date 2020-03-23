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
import { BoardValue } from "./board";
import { SegmentCountX, SegmentCountY } from ".";
import SnakePath from "./snakePath";

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

    this.snakes = [];
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gameState = GameState.MAIN_MENU;
    this.snakePath = null;
  }

  start() {
    this.gameState = GameState.RUNNING;

    this.board = new Board(
      this.gameWidth / SegmentSizeX,
      this.gameHeight / SegmentSizeY
    );

    this.snakePath = new SnakePath();
    this.snakePath.start(this.board);

    let snake1 = new Snake(this);
    snake1.startBody(0, 0, "#13b510", "#0f0");

    let snake2 = new Snake(this);
    snake2.startBody(0, 4, "#f9b811", "#f9ee11");

    let snake3 = new Snake(this);
    snake3.startBody(0, 8, "#430e84", "#510ab5");

    let snake4 = new Snake(this);
    snake4.startBody(0, 12, "#1099b5", "#15c7ea");

    this.food = new Food(-1, -1);

    this.snakes.push(snake1);
    this.snakes.push(snake2);
    this.snakes.push(snake3);
    this.snakes.push(snake4);

    this.gameObjects = [this.food, ...this.snakes];

    [...this.snakes].forEach(object => object.start());
    //    this.snake.start();
    this.food.start();

    this.spawnFood();
  }

  update() {
    [...this.gameObjects].forEach(object => {
      this.snakePath.createGraph(this.snakes);
      object.update();
    });

    if (this.food.eaten) {
      let sum = 0;
      this.snakes.forEach(snake => {
        sum += snake.length;
      });

      if (sum === this.board.width * this.board.width) {
        this.gameState = GameState.WIN;
        return;
      } else {
        this.spawnFood();
      }
    }
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
    this.food.eaten = false;
    // console.log("NEW FOOD ON:");
    // console.log(this.food);
    this.board.updatePosition(newX, newY, BoardValue.FOOD);
  }

  drawGuideGrid(ctx) {
    let i;

    for (i = 0; i < SegmentCountX + 2; i += 2) {
      ctx.fillStyle = "#111";
      ctx.fillRect(
        i * SegmentSizeX - (SegmentSizeX - SegmentStrokeX) / 2,
        0,
        SegmentSizeX - SegmentStrokeX,
        SegmentCountY * SegmentSizeY
      );
    }
    for (i = 0; i < SegmentCountY + 2; i += 2) {
      ctx.fillStyle = "#111";
      ctx.fillRect(
        0,
        i * SegmentSizeY - (SegmentSizeY - SegmentStrokeY) / 2,
        SegmentCountX * SegmentSizeX,
        SegmentSizeY - SegmentStrokeY
      );
    }
  }

  drawGuideTree(ctx) {
    this.snakePath.createGraph(this.snakes);
    [...this.snakes].forEach(snake =>
      this.snakePath.draw(ctx, snake.head.next)
    );
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

export function translateToBoard(x, y, width, height) {
  let newX = x;
  let newY = y;

  if (x < 0) {
    newX = x + width;
  } else {
    newX = x % width;
  }

  if (y < 0) {
    newY = y + height;
  } else {
    newY = y % height;
  }

  return new Position(newX, newY);
}
