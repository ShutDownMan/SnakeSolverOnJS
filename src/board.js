/// All states a segment of the board can have
export const BoardValue = {
  NOTHING: 0,
  SNAKE_SEGMENT: 1,
  FOOD: 2,
  OBSTACLE: 3
};

/// Board class, contains all grid spaces of the board
export default class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.segments = [[]];

    /// creates all grid spaces
    for (let i = 0; i < height; ++i) {
      this.segments[i] = [];
      for (let j = 0; j < width; ++j) {
        this.segments[i][j] = BoardValue.NOTHING;
      }
    }
  }

  /// returns state of given position
  getPosition(x, y) {
    // this.segments[y][x] = 0;
    return this.segments[y][x];
  }

  /// updates value of given position
  updatePosition(x, y, value) {
    this.segments[y][x] = value;

    return this.segments[y][x];
  }
}
