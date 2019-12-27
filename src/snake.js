import { SegmentSize, SegmentStroke } from "/src/index.js";
import { Direction, getAdjcentSegment, GameState } from "/src/game.js";
import { BoardValue } from "/src/board.js";
import Position from "/src/Position.js";

export const SnakeState = {
  DEAD: 0,
  MOVE: 1,
  GROW: 2
};

export default class Snake {
  constructor(game, x, y) {
    // console.log("SegmentSize = " + SegmentSize);
    this.game = game;

    this.head = new SnakeSegment(x + 4, y, null);
    let body = new SnakeSegment(x + 3, y, this.head);
    this.head.next = new SnakeSegment(x + 2, y, body);

    this.direction = Direction.East;
  }

  start() {}

  update() {
    // console.log(this.checkCollision());
    switch (this.checkCollision()) {
      case SnakeState.DEAD:
        this.game.gameState = GameState.GAME_OVER;
        break;
      case SnakeState.MOVE:
        this.move();
        break;
      case SnakeState.GROW:
        this.grow();
        this.length++;
        this.game.spawnFood();
        break;
      default:
        break;
    }
    // this.move();
  }

  checkCollision() {
    let nextSegPos = getAdjcentSegment(
      this.head.x,
      this.head.y,
      this.direction
    );

    // console.log(nextSegPos);

    if (!this.isValidPosition(this.game.board, nextSegPos))
      return SnakeState.DEAD;

    switch (this.game.board.segments[nextSegPos.y][nextSegPos.x]) {
      case BoardValue.NOTHING:
        console.log("MOVE");
        return SnakeState.MOVE;

      case BoardValue.SNAKE_SEGMENT:
      case BoardValue.OBSTACLE:
        return SnakeState.DEAD;

      case BoardValue.FOOD:
        console.log("GROW");
        return SnakeState.GROW;

      default:
        console.log("MOVE");
        return SnakeState.MOVE;
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

  move() {
    let nextSegPos = getAdjcentSegment(
      this.head.x,
      this.head.y,
      this.direction
    );

    // console.log(this.direction);

    this.game.board.updatePosition(nextSegPos.x, nextSegPos.y, 1);

    if (
      !(nextSegPos.x === this.head.next.x && nextSegPos.y === this.head.next.y)
    ) {
      // clear where the tail used to be, since the snake moved away from
      // there
      this.game.board.updatePosition(this.head.next.x, this.head.next.y, 0);
    }

    this.head = this.head.next;

    this.head.x = nextSegPos.x;
    this.head.y = nextSegPos.y;
  }

  grow() {
    let nextSegPos = getAdjcentSegment(
      this.head.x,
      this.head.y,
      this.direction
    );

    this.game.board.updatePosition(nextSegPos.x, nextSegPos.y, 2);

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

    let strokeBorder = (SegmentSize - SegmentStroke) / 2;

    ctx.fillStyle = "#bf3";
    ctx.fillRect(
      this.head.x * SegmentSize + strokeBorder,
      this.head.y * SegmentSize + strokeBorder,
      SegmentStroke,
      SegmentStroke
    );
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

    let strokeBorder = (SegmentSize - SegmentStroke) / 2;
    let dX = nodeB.x - nodeA.x;
    let dY = nodeB.y - nodeA.y;

    ctx.fillStyle = "#0f0";
    ctx.fillRect(
      nodeA.x * SegmentSize + strokeBorder,
      nodeA.y * SegmentSize + strokeBorder,
      (dX + 1) * SegmentStroke + 2 * dX * strokeBorder,
      (dY + 1) * SegmentStroke + 2 * dY * strokeBorder
    );
  }
}
