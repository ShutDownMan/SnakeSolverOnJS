export const BoardValue = {
  NOTHING: 0,
  SNAKE_SEGMENT: 1,
  FOOD: 2,
  OBSTACLE: 3
};

export default class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.segments = [[]];

    for (let i = 0; i < height; ++i) {
      this.segments[i] = [];
      for (let j = 0; j < width; ++j) {
        this.segments[i][j] = BoardValue.NOTHING;
      }
    }
  }

  getPosition(x, y) {
    // this.segments[y][x] = 0;
    return this.segments[y][x];
  }

  updatePosition(x, y, value) {
    this.segments[y][x] = value;

    return this.segments[y][x];
  }
}
