import BoardInfo, { TagType, SegmentInfo } from "./boardInfo";
import { Direction } from "./game";
import Position from "./position";
import { infinite } from ".";

export default class SnakePath {
  constructor(board) {
    this.board = board;
    this.boardInfo = null;
  }

  start() {
    this.boardInfo = new BoardInfo(this.board.width / 2, this.board.height / 2);
  }

  createGraph(snake) {
    let lastNode = snake.head.next;
    let curNode = lastNode.next;
    let lastPos = new Position(0, 0);
    let curPos = new Position(0, 0);

    this.boardInfo.cleanEdges();
    // this.boardInfo.logGraph();

    while (curNode !== snake.head.next) {
      lastPos.x = Math.floor(lastNode.x / 2.0);
      lastPos.y = Math.floor(lastNode.y / 2.0);
      curPos.x = Math.floor(curNode.x / 2.0);
      curPos.y = Math.floor(curNode.y / 2.0);

      this.createEdge(lastPos, curPos);

      lastNode = curNode;
      curNode = curNode.next;
    }

    // console.log(this.boardInfo);
  }

  createEdge(posA, posB) {
    let direction = this.getDirection(posA, posB);

    if (direction < 0) return;

    if (Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y) > 1) return;

    if (
      this.boardInfo.isValidPosition(posA.x, posA.y) &&
      this.boardInfo.isValidPosition(posB.x, posB.y)
    ) {
      this.boardInfo.get(posA.x, posA.y).edges[direction] = -1;
      this.boardInfo.get(posB.x, posB.y).edges[(direction + 2) % 4] = -1;
    }
  }

  getDirection(posA, posB) {
    if (posA.x !== posB.x) {
      return posA.x > posB.x ? 0 : 2;
    } else if (posA.y !== posB.y) {
      return posA.y < posB.y ? 3 : 1;
    }

    return -1;
  }

  getNextDirection(src, dest) {
    let newDirection = Direction.NONE;

    let graphSrc = this.getGraphPosition(src);
    let graphDest = this.getGraphPosition(dest);
    // console.log(graphSrc);
    // console.log("src = ");
    // console.log(src);
    // console.log("graphSrc = ");
    // console.log(graphSrc);

    /// clean BoardInfo
    this.boardInfo.clean();
    this.boardInfo.cleanTreeTags();

    this.boardInfo.get(graphSrc.x, graphSrc.y).tag = TagType.BLACK;

    // console.log(this.boardInfo.get(graphSrc.x, graphSrc.y).tag);

    this.calculatePathRec(graphSrc, graphDest);
    // this.boardInfo.get(graphDest.x, graphDest.y).gCost = 0;
    // this.calcPathAStar(graphDest, graphSrc);

    newDirection = this.boardInfo.get(graphSrc.x, graphSrc.y).direction;

    // console.log("SrcqPosition = " + graphSrc.qPosition);

    // console.log(
    //   "Direction = " + this.getBoardDirection(graphSrc.qPosition, newDirection)
    // );
    return this.getBoardDirection(graphSrc.qPosition, newDirection);
  }

  getQPosition(x, y) {
    if (y % 2) {
      return 3 - (x % 2);
    }
    return x % 2;
  }

  getGraphPosition(pos) {
    let graphPos = new Position(0, 0);

    // console.log(pos);
    graphPos.x = Math.floor(pos.x / 2.0);
    graphPos.y = Math.floor(pos.y / 2.0);

    graphPos.qPosition = this.getQPosition(pos.x, pos.y);

    return graphPos;
  }

  calculatePathRec(src, dest) {
    let pathCost;
    let isSrcFree, isDestFree, isNextFree;
    let nextNode;
    let currentDirection, nextDirection;

    isSrcFree = this.boardInfo.get(src.x, src.y).isFree();
    isDestFree = this.boardInfo.get(dest.x, dest.y).isFree();
    // srcHasFreeEdge = this.boardInfo.hasFreeEdge(src);

    /// if source is free then just calculate the AStar path
    if (isSrcFree) {
      this.boardInfo.get(dest.x, dest.y).gCost = 0;
      this.calcPathAStar(dest, src);

      return this.boardInfo.get(src.x, src.y).gCost;
    }

    if (equalNode(src, dest)) {
      this.boardInfo.get(src.x, src.y).gCost = infinite;
      this.boardInfo.get(src.x, src.y).direction = -1;

      return infinite;
    }

    currentDirection = (src.qPosition + 1) % 4;

    /// next node = adjacent edge given direction
    nextNode = this.boardInfo.getAdjacentNode(src, currentDirection);

    /// if next node is not a valid position just turn the snake
    if (!this.boardInfo.isValidPosition(nextNode.x, nextNode.y)) {
      this.boardInfo.get(src.x, src.y).gCost = infinite;
      this.boardInfo.get(src.x, src.y).direction = -1;

      return infinite;
    }

    /// get if next node is free
    isNextFree = this.boardInfo.get(nextNode.x, nextNode.y).isFree();

    /// if destination or next node are not free
    if (!isDestFree || !isNextFree) {
      /// just keep folowing the path
      this.boardInfo.get(src.x, src.y).gCost = infinite;

      /// if it does not has an edge with the next node
      if (!this.boardInfo.get(src.x, src.y).edges[currentDirection]) {
        /// turn the snake
        currentDirection = -1;
      }
      this.boardInfo.get(src.x, src.y).direction = currentDirection;

      return infinite;
    }

    /// run the AStar algorithm and get the directions
    this.boardInfo.get(dest.x, dest.y).gCost = 0;
    pathCost = this.calcPathAStar(dest, src);

    /// if has access to food and it's current direction equal that of the food
    if (
      pathCost < infinite &&
      currentDirection === this.boardInfo.get(src.x, src.y).direction
    ) {
      /// evaluate if continuing the snake path has the same cost
      nextDirection = (currentDirection + 1) % 4;

      nextNode = this.boardInfo.getAdjacentNode(src, nextDirection);

      if (this.boardInfo.isValidPosition(nextNode.x, nextNode.y)) {
        /// get if next node is free
        isNextFree = this.boardInfo.get(nextNode.x, nextNode.y).isFree();
        if (!isNextFree) {
          if (
            this.boardInfo.get(nextNode.x, nextNode.y).gCost <=
            this.boardInfo.get(src.x, src.y).gCost
          ) {
            this.boardInfo.get(
              nextNode.x,
              nextNode.y
            ).direction = this.getDirection(src, nextNode);
          }
        }
      }

      return this.boardInfo.get(src.x, src.y).gCost;
    }

    this.boardInfo.get(src.x, src.y).gCost = infinite;

    /// if it does not has an edge with the next node
    if (!this.boardInfo.get(src.x, src.y).edges[currentDirection]) {
      /// turn the snake
      currentDirection = -1;
    }
    this.boardInfo.get(src.x, src.y).direction = currentDirection;

    return infinite;
  }

  getBoardDirection(qPosition, direction) {
    // console.log("qPosition = " + qPosition);
    // console.log("direction = " + direction);

    if ((qPosition + 1) % 4 === direction) return direction;

    return (qPosition + 2) % 4;
  }

  getBranchLength(src, direction) {
    this.getBranchLengthRec(src);
    return this.boardInfo.get(src.x, src.y).edges[direction];
  }

  getBranchLengthRec(src) {
    let i, total, branchLen;
    let nextNode;

    this.boardInfo.get(src.x, src.y).treeTag = TagType.BLACK;

    for (i = total = 0; i < 4; ++i) {
      if (this.boardInfo.get(src.x, src.y).edges[i]) {
        if (this.boardInfo.get(src.x, src.y).edges[i] !== -1) {
          return this.boardInfo.get(src.x, src.y).edges[i];
        }

        nextNode = this.boardInfo.getAdjacentNode(src, i);

        if (
          this.boardInfo.isValidPosition(nextNode.x, nextNode.y) &&
          !this.boardInfo.get(nextNode.x, nextNode.y).treeTag
        ) {
          total += branchLen = 1 + this.getBranchLengthRec(nextNode);
          this.boardInfo.get(src.x, src.y).edges[i] = branchLen;
        }
      }
    }

    return total;
  }

  resetAStar() {
    let i, j;

    for (i = 0; i < this.height; ++i) {
      for (j = 0; j < this.width; ++j) {
        if (this.boardInfo.get(i, j).isFree()) {
          this.boardInfo.get(i, j).clean();
        }
      }
    }
  }

  /*
OPEN
CLOSED

insert OPEN src
loop
current = lowest fCost node in open
remove OPEN current
insert CLOSED current

if current == dest
return

foreach adge of current
if not valid OR not free
continue

if new path to edge < current path OR not contain open edge
set new path cost and direction
insert OPEN edge
*/
  calcPathAStar(src, dest) {
    /// open and closed sets of nodes
    let open = [];
    let closed = [];

    /// current node and adjecent
    let curNode = new Position(0, 0);
    let adjNode = new Position(0, 0);
    let i, newPathGCost, newPathHCost, newPathFCost;

    // this.boardInfo.get(src.x, src.y).gCost = 0;

    /// calculate h value for source node
    this.boardInfo.get(src.x, src.y).hCost =
      Math.abs(src.x - dest.x) + Math.abs(src.y - dest.y);

    /// calculate f value for source node
    this.boardInfo.get(src.x, src.y).fCost =
      this.boardInfo.get(src.x, src.y).hCost +
      this.boardInfo.get(src.x, src.y).gCost;

    /// push souce node on open set
    open.push(src);
    /// store fcost onto position for sorting
    src.fCost = this.boardInfo.get(src.x, src.y).fCost;
    // console.log(open[0]);
    // console.log(open.length);

    /// while computation not complete
    while (true) {
      /// sort open set by fCost
      open.sort(compareNode);

      /// if there aren't any more nodes to look at
      if (!open.length) {
        /// cost is infinite
        this.boardInfo.get(src.x, src.y).gCost = infinite;
        this.boardInfo.get(src.x, src.y).fCost = infinite;
        break;
      }

      /// get first element of array
      curNode = open[0];
      curNode = open.pop();
      /// insert it on closed set
      closed.push(curNode);

      /// if destination found, computation is done
      if (equalNode(curNode, dest)) break;

      if (!this.boardInfo.get(curNode.x, curNode.y).isFree()) continue;

      /// for each edge of current node
      for (i = 3; i + 1; --i) {
        /// get given edge adjacent node
        adjNode = this.boardInfo.getAdjacentNode(curNode, i);

        /// if position not valid or
        /// adjacent node is in closed set, continue to next edge
        if (
          !this.boardInfo.isValidPosition(adjNode.x, adjNode.y) ||
          this.contains(closed, adjNode)
        )
          continue;

        /// store fcost of adjacent node for sorting
        adjNode.fCost = this.boardInfo.get(adjNode.x, adjNode.y).fCost;

        // console.log("OpenLen = " + open.length);

        /// calculate new g cost given current node
        newPathGCost = this.boardInfo.get(curNode.x, curNode.y).gCost + 1;
        /// calculate new h cost given current node
        newPathHCost =
          Math.abs(curNode.x - dest.x) + Math.abs(curNode.y - dest.y);
        /// calculate new f cost given current node
        newPathFCost = newPathGCost + newPathHCost;

        /// if new path cost is smaller than adjacent node cost OR
        /// adjacent node is not in open set
        if (
          newPathFCost < this.boardInfo.get(adjNode.x, adjNode.y).fCost ||
          !this.contains(open, adjNode)
        ) {
          /// store newly calculated costs
          this.boardInfo.get(adjNode.x, adjNode.y).gCost = newPathGCost;
          this.boardInfo.get(adjNode.x, adjNode.y).hCost = newPathHCost;
          this.boardInfo.get(adjNode.x, adjNode.y).fCost = newPathFCost;

          /// store fcost in position for sorting
          adjNode.fCost = this.boardInfo.get(adjNode.x, adjNode.y).fCost;

          /// set new direction for adjacent node pointing to new lowest cost path
          this.boardInfo.get(
            adjNode.x,
            adjNode.y
          ).direction = this.getDirection(adjNode, curNode);

          /// add adjacent node to open set
          open.push(adjNode);
        }
      }
    }

    /// return minimal g cost for getting to destination
    return this.boardInfo.get(dest.x, dest.y).gCost;
  }

  contains(list, node) {
    let i;

    for (i = 0; i < list.length; ++i) {
      if (equalNode(node, list[i])) return true;
    }

    return false;
  }
}

function equalNode(nodeA, nodeB) {
  return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
}

function compareNode(nodeA, nodeB) {
  if (equalNode(nodeA, nodeB)) {
    return 0;
  }
  return nodeA.fCost < nodeB.fCost ? 1 : -1;
}
