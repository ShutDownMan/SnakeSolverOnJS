import {
  SegmentSizeX,
  SegmentSizeY,
  SegmentStrokeX,
  SegmentStrokeY
} from "/src/index.js";
import { BoardValue } from "/src/board.js";

export default class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  start() {
    // this.game.board.segments[this.y][this.x] = BoardValue.FOOD;
  }

  update() {}

  draw(ctx) {
    let strokeBorderX = (SegmentSizeX - SegmentStrokeX) / 2;
    let strokeBorderY = (SegmentSizeY - SegmentStrokeY) / 2;

    ctx.fillStyle = "#f00";
    ctx.fillRect(
      this.x * SegmentSizeX + strokeBorderX,
      this.y * SegmentSizeY + strokeBorderY,
      SegmentStrokeX,
      SegmentStrokeY
    );

    //    console.log("Hello!");
  }
}
