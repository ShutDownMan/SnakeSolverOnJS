import {
  SegmentSizeX,
  SegmentStrokeX,
  SegmentSizeY,
  SegmentStrokeY
} from "/src/index.js";
import { Direction, getAdjcentSegment, GameState } from "/src/game.js";
import { BoardValue } from "/src/board.js";
import Position from "/src/position.js";
import SnakePath from "./snakePath";
import { TagType } from "./boardInfo";
import { ctx } from ".";

export const SnakeState = {
  DEAD: 0,
  MOVE: 1,
  GROW: 2
};

export default class Snake {
  constructor(game, x, y) {
    // console.log("SegmentSize = " + SegmentSize);
    this.game = game;
    this.length = 3;
    this.snakePath = null;

    this.head = new SnakeSegment(x + 2, y, null);
    this.game.board.updatePosition(
      this.head.x,
      this.head.y,
      BoardValue.SNAKE_SEGMENT
    );
    let body = new SnakeSegment(x + 1, y, this.head);
    this.game.board.updatePosition(body.x, body.y, BoardValue.SNAKE_SEGMENT);
    this.head.next = new SnakeSegment(x + 0, y, body);
    this.game.board.updatePosition(
      this.head.next.x,
      this.head.next.y,
      BoardValue.SNAKE_SEGMENT
    );
  }

  start() {
    this.direction = Direction.East;
    this.snakePath = new SnakePath(this.game.board, this);
    this.snakePath.start();
  }

  update() {
    let snakeHeadPos = new Position(this.head.x, this.head.y);
    let foodPos = new Position(this.game.food.x, this.game.food.y);

    // console.log(this.checkCollision());
    if (this.snakePath) {
      this.snakePath.createGraph(this);

      // this.snakePath.boardInfo.logGraph();
      this.direction = this.snakePath.getNextDirection(snakeHeadPos, foodPos);
      // console.log(this.snakePath.boardInfo);
      // this.snakePath.boardInfo.logBoardInfo();
      // console.log("D = " + this.direction);
    }
    let curDirection = this.direction;

    switch (this.checkCollision(curDirection)) {
      case SnakeState.DEAD:
        this.game.gameState = GameState.GAME_OVER;
        break;

      case SnakeState.GROW:
        // console.log("FOOD EATEN");
        this.grow(curDirection);
        this.length++;
        if (this.length === this.game.board.height * this.game.board.width) {
          this.game.gameState = GameState.WIN;
          window.location.reload(false);
          return;
        }
        this.game.spawnFood();
        break;

      case SnakeState.MOVE:
        this.move(curDirection);
        break;

      default:
        break;
    }
    // this.move();
  }

  checkCollision(direction) {
    let nextSegPos = getAdjcentSegment(this.head.x, this.head.y, direction);

    if (!this.isValidPosition(this.game.board, nextSegPos))
      return SnakeState.DEAD;

    switch (this.game.board.segments[nextSegPos.y][nextSegPos.x]) {
      case BoardValue.NOTHING:
        // console.log("NOTHING -> MOVE");
        return SnakeState.MOVE;

      case BoardValue.FOOD:
        // console.log("nextSegPos = ");
        // console.log(nextSegPos);
        // console.log("FoodPos = ");
        // console.log(this.game.food);
        // console.log("FOOD -> GROW");
        //console.log("GROW");
        return SnakeState.GROW;

      case BoardValue.SNAKE_SEGMENT:
        if (
          nextSegPos.x === this.head.next.x &&
          nextSegPos.y === this.head.next.y
        ) {
          // console.log("SNAKE_SEGMENT -> MOVE");
          return SnakeState.MOVE;
        }
        // console.log("SNAKE_SEGMENT -> DEAD");
        return SnakeState.DEAD;

      default:
        // console.log("default -> DEAD");
        //console.log("MOVE");
        return SnakeState.DEAD;
    }
  }

  isValidPosition(board, position) {
    // console.log(board.height);
    return (
      position.x >= 0 &&
      position.y >= 0 &&
      position.x < board.width &&
      position.y < board.height
    );
  }

  move(direction) {
    let nextSegPos = getAdjcentSegment(this.head.x, this.head.y, direction);

    // console.log(this.direction);

    this.game.board.updatePosition(
      nextSegPos.x,
      nextSegPos.y,
      BoardValue.SNAKE_SEGMENT
    );

    if (
      !(nextSegPos.x === this.head.next.x && nextSegPos.y === this.head.next.y)
    ) {
      // clear where the tail used to be, since the snake moved away from
      // there
      this.game.board.updatePosition(
        this.head.next.x,
        this.head.next.y,
        BoardValue.NOTHING
      );
    }

    this.head = this.head.next;

    this.head.x = nextSegPos.x;
    this.head.y = nextSegPos.y;
  }

  grow(direction) {
    let nextSegPos = getAdjcentSegment(this.head.x, this.head.y, direction);

    this.game.board.updatePosition(
      nextSegPos.x,
      nextSegPos.y,
      BoardValue.SNAKE_SEGMENT
    );

    this.head.next = new SnakeSegment(
      nextSegPos.x,
      nextSegPos.y,
      this.head.next
    );

    this.head = this.head.next;
  }

  draw(ctx) {
    let lastSegment = this.head.next;
    let currentSegment = lastSegment.next;

    while (currentSegment !== this.head.next) {
      lastSegment.draw(ctx);

      lastSegment = currentSegment;
      currentSegment = currentSegment.next;
    }

    let strokeBorderX = (SegmentSizeX - SegmentStrokeX) / 2;
    let strokeBorderY = (SegmentSizeY - SegmentStrokeY) / 2;

    ctx.fillStyle = "#bf3";
    ctx.fillRect(
      this.head.x * SegmentSizeX + strokeBorderX,
      this.head.y * SegmentSizeY + strokeBorderY,
      SegmentStrokeX,
      SegmentStrokeY
    );
    this.snakePath.draw(ctx, this.head.next);
  }

  setSnakePath(snakePath) {
    this.snakePath = snakePath;
  }

  getSnakePath() {
    return this.snakePath;
  }
}

class SnakeSegment {
  constructor(x, y, next) {
    this.x = x;
    this.y = y;
    this.next = next;
  }

  start() {}

  update() {}

  draw(ctx) {
    let nodeA = null;
    let nodeB = null;

    if (this.x < this.next.x || this.y < this.next.y) {
      nodeA = this;
      nodeB = this.next;
    } else {
      nodeA = this.next;
      nodeB = this;
    }

    let strokeBorderX = (SegmentSizeX - SegmentStrokeX) / 2;
    let strokeBorderY = (SegmentSizeY - SegmentStrokeY) / 2;
    let dX = nodeB.x - nodeA.x;
    let dY = nodeB.y - nodeA.y;

    ctx.fillStyle = "#0f0";
    ctx.fillRect(
      nodeA.x * SegmentSizeX + strokeBorderX,
      nodeA.y * SegmentSizeY + strokeBorderY,
      (dX + 1) * SegmentStrokeX + 2 * dX * strokeBorderX,
      (dY + 1) * SegmentStrokeY + 2 * dY * strokeBorderY
    );
  }
}
