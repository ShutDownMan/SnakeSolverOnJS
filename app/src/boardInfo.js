import { Direction } from "./game";
import { infinite } from ".";
import Position from "./position";

export const TagType = {
  WHITE: 0,
  BLACK: 1,
  GREY: 2
};

export default class BoardInfo {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.segmentsInfo = [[]];

    /// creates all grid spaces
    for (let i = 0; i < height; ++i) {
      this.segmentsInfo[i] = [];
      for (let j = 0; j < width; ++j) {
        this.segmentsInfo[i][j] = new SegmentInfo();
      }
    }
  }

  get(x, y) {
    return this.segmentsInfo[y][x];
  }

  getAdjacentNode(source, direction) {
    let adjNode = new Position(source.x, source.y);

    adjNode.qPosition = (direction + 2) % 4;

    if (direction % 2) {
      adjNode.y += direction - 2;
    } else {
      adjNode.x += direction - 1;
    }

    return adjNode;
  }

  translateToBoard(source) {
    let newX = 0;
    let newY = 0;

    if (source.x < 0) {
      newX = source.x + this.width;
    } else {
      newX = source.x % this.width;
    }

    if (source.y < 0) {
      newY = source.y + this.height;
    } else {
      newY = source.y % this.height;
    }

    return new Position(newX, newY);
  }

  isBoundaryAdjacent(nodeA, nodeB) {
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y) > 1;
  }

  clean() {
    for (let i = 0; i < this.height; ++i) {
      for (let j = 0; j < this.width; ++j) {
        this.segmentsInfo[i][j].clean();
      }
    }
  }

  cleanEdges() {
    for (let i = 0; i < this.height; ++i) {
      for (let j = 0; j < this.width; ++j) {
        this.segmentsInfo[i][j].cleanEdges();
      }
    }
  }

  cleanTreeTags() {
    for (let i = 0; i < this.height; ++i) {
      for (let j = 0; j < this.width; ++j) {
        this.segmentsInfo[i][j].cleanTreeTag();
      }
    }
  }

  isValidPosition(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  hasFreeEdge(src) {
    let i;
    let currentNode;

    for (i = 0; i < 4; ++i) {
      currentNode = this.getAdjacentNode(src, i);

      if (this.isValidPosition(currentNode)) {
        if (this.get(currentNode.x, currentNode.y).isFree()) return true;
      }
    }

    return false;
  }

  logGraph() {
    let i, j;
    let str = "";

    for (i = 0; i < this.height; ++i) {
      for (j = 0; j < this.width; ++j) {
        str += "#";
        if (this.segmentsInfo[i][j].edges[2]) {
          // ABR
          str += "--";
        } else {
          str += "   ";
        }
      }
      str += "\n\r";
      for (j = 0; j < this.width; ++j) {
        if (this.segmentsInfo[i][j].edges[3]) {
          // ABR
          str += " |    ";
        } else {
          str += "     ";
        }
      }
      str += "\n\r";
    }

    console.log(str);
  }

  logBoardInfo() {
    let i, j;
    let str = "";

    str += "GCOST: \n\r";
    for (i = 0; i < this.height; ++i) {
      for (j = 0; j < this.width; ++j) {
        str += "" + this.segmentsInfo[i][j].gCost + " ";
      }
      str += "\n\r";
    }
    str += "DIR: \n\r";
    for (i = 0; i < this.height; ++i) {
      for (j = 0; j < this.width; ++j) {
        str += "" + this.segmentsInfo[i][j].direction + " ";
      }
      str += "\n\r";
    }
    console.log(str);
  }
}

export class SegmentInfo {
  constructor() {
    this.edges = [0, 0, 0, 0];
    this.tag = TagType.WHITE;
    this.treeTag = TagType.WHITE;
    this.direction = Direction.NONE;
    this.hCost = infinite;
    this.gCost = infinite;
    this.fCost = infinite;
  }

  clean() {
    this.tag = TagType.WHITE;
    this.direction = Direction.NONE;
    this.hCost = infinite;
    this.gCost = infinite;
    this.fCost = infinite;
  }

  cleanEdges() {
    this.edges = [0, 0, 0, 0];
  }

  cleanTreeTag() {
    this.treeTag = TagType.WHITE;
  }

  isFree() {
    let i, hasNeighbour;

    for (i = hasNeighbour = 0; !hasNeighbour && i < 4; ++i) {
      hasNeighbour = this.edges[i];
    }

    return !hasNeighbour;
  }
}
