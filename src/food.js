import { SegmentSize, SegmentStroke } from "/src/index.js";
import { BoardValue } from "/src/board.js";

export default class Food {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
  }

  start() {
    // this.game.board.segments[this.y][this.x] = BoardValue.FOOD;
  }

  update() {}

  draw(ctx) {
    let strokeBorder = (SegmentSize - SegmentStroke) / 2;

    ctx.fillStyle = "#f00";
    ctx.fillRect(
      this.x * SegmentSize + strokeBorder,
      this.y * SegmentSize + strokeBorder,
      SegmentStroke,
      SegmentStroke
    );
  }
}
