import BoardInfo, { TagType, SegmentInfo } from "./boardInfo";
import { Direction } from "./game";
import Position from "./position";

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
    let i, j, curDist, branchLen, branchLenSum, pathCost;
    let isSrcFree, isDestFree, isNextFree, firstBranch;
    let nextNode;

    curDist = branchLen = branchLenSum = 0;

    isSrcFree = this.boardInfo.get(src.x, src.y).isFree();
    isDestFree = this.boardInfo.get(dest.x, dest.y).isFree();

    /// found node withing tree
    if (src.x === dest.x && src.y === dest.y) {
      /// Add remaining branches in the node
      for (j = src.qPosition; j !== dest.qPosition; j = (j + 1) % 4) {
        curDist += 2 * (branchLen = this.getBranchLength(src, (j + 1) % 4));
      }

      /// if current path cost less
      if (curDist < this.boardInfo.get(src.x, src.y).gCost) {
        /// save cost
      }
      this.boardInfo.get(src.x, src.y).gCost = curDist;
      this.boardInfo.get(src.x, src.y).direction = -1;

      // console.log("curDist = " + curDist);

      return curDist;
    }

    for (i = 0; i < 4; ++i) {
      firstBranch = -1;
      curDist = branchLenSum = 0;

      /// get next node = adjacent edge given direction
      nextNode = this.getAdjacentNode(src, i);
      // console.log(nextNode);
      // console.log(this.boardInfo.isValidPosition(nextNode.x, nextNode.y));

      /// if adjacent node is a valid position
      if (this.boardInfo.isValidPosition(nextNode.x, nextNode.y)) {
        /// get if next node is free
        isNextFree = this.boardInfo.get(nextNode.x, nextNode.y).isFree();
        // console.log(isNextFree);

        /// if current node has an edge to that direction OR next node is a free node
        if (
          this.boardInfo.get(src.x, src.y).edges[i] ||
          (isNextFree && isDestFree)
        ) {
          /// if next node is not tag black
          if (
            this.boardInfo.get(nextNode.x, nextNode.y).tag !== TagType.BLACK
          ) {
            /// Calculating branch turn cost
            for (
              j = (src.qPosition + 1) % 4;
              j !== this.getDirection(src, nextNode);
              j = (j + 1) % 4
            ) {
              branchLenSum += 2 * (branchLen = this.getBranchLength(src, j));
              // console.log("branchLenSum = " + branchLenSum);

              /// get first branch direction
              if (branchLen && firstBranch === -1) {
                firstBranch = j;
              }
            }

            /// if next node is a free node
            if (isNextFree) {
              // this.resetAStar();
              this.boardInfo.get(dest.x, dest.y).gCost = 0;
              pathCost = this.calcPathAStar(dest, nextNode);
              // this.boardInfo.get(
              //   nextNode.x,
              //   nextNode.y
              // ).direction = this.getDirection(src, nextNode);
              // console.log(this.boardInfo.get(nextNode.x, nextNode.y).direction);
            } else {
              this.boardInfo.get(nextNode.x, nextNode.y).tag = TagType.BLACK;
              /// get the distance recursively depth first
              pathCost = this.calculatePathRec(nextNode, dest);
            }

            curDist = 1 + branchLenSum + pathCost;
            // console.log("direction = " + i);
            // console.log("branchLenSum = " + branchLenSum);
            // console.log("pathCost = " + pathCost);

            /// if current distance is smaller
            /// checks if distance is equal and avoids free nodes's paths
            if (curDist <= this.boardInfo.get(src.x, src.y).gCost) {
              this.boardInfo.get(src.x, src.y).gCost = curDist;

              this.boardInfo.get(src.x, src.y).direction =
                firstBranch === -1 ? i : firstBranch;
            }
          }
        }
      }
    }

    // this.boardInfo.get(src.x, src.y).tag = TagType.BLACK;
    // pathInfo->cost[src.y][src.x] = minDist;

    return this.boardInfo.get(src.x, src.y).gCost;
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
    let nextNode = new Position(0, 0);

    this.boardInfo.get(src.x, src.y).treeTag = TagType.BLACK;

    for (i = total = 0; i < 4; ++i) {
      if (this.boardInfo.get(src.x, src.y).edges[i]) {
        if (this.boardInfo.get(src.x, src.y).edges[i] !== -1) {
          return this.boardInfo.get(src.x, src.y).edges[i];
        }

        nextNode = this.getAdjacentNode(src, i);

        if (
          this.boardInfo.isValidPosition(nextNode.x, nextNode.y) &&
          !this.boardInfo.get(nextNode.x, nextNode.y).treeTag
        ) {
          total += 1 + (branchLen = this.getBranchLengthRec(nextNode));
          this.boardInfo.get(src.x, src.y).edges[i] = total;
        }
      }
    }

    return total;
  }

  getAdjacentNode(source, direction) {
    let adjNode = new Position(0, 0);
    adjNode.y = source.y;
    adjNode.x = source.x;

    adjNode.qPosition = (direction + 2) % 4;

    if (direction % 2) {
      adjNode.y += direction - 2;
    } else {
      adjNode.x += direction - 1;
    }

    return adjNode;
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
    let open = [];
    let closed = [];

    let curNode = new Position(0, 0);
    let adjNode = new Position(0, 0);
    let i, newPathGCost, newPathHCost, newPathFCost;
    let isAdjDest;

    // this.boardInfo.get(src.x, src.y).gCost = 0;
    this.boardInfo.get(src.x, src.y).hCost =
      Math.abs(src.x - dest.x) + Math.abs(src.y - dest.y);
    this.boardInfo.get(src.x, src.y).fCost =
      this.boardInfo.get(src.x, src.y).hCost +
      this.boardInfo.get(src.x, src.y).gCost;

    open.push(src);
    3;
    // console.log(open[0]);
    // console.log(open.length);

    while (true) {
      open.sort(this.compareNode);

      if (!open.length) {
        this.boardInfo.get(src.x, src.y).gCost = 0xffff;
        this.boardInfo.get(src.x, src.y).fCost = 0xffff;
        break;
      }

      curNode = open[0];
      open.pop();
      closed.push(curNode);

      if (curNode.x === dest.x && curNode.y === dest.y) break;
      if (this.equalNode(curNode, dest)) break;

      for (i = 0; i < 4; ++i) {
        adjNode = this.getAdjacentNode(curNode, i);

        if (
          !this.boardInfo.isValidPosition(adjNode.x, adjNode.y) ||
          !this.boardInfo.get(adjNode.x, adjNode.y).isFree() ||
          this.contains(closed, adjNode)
        )
          continue;

        // console.log("OpenLen = " + open.length);

        newPathGCost = this.boardInfo.get(curNode.x, curNode.y).gCost + 1;
        newPathHCost =
          Math.abs(curNode.x - dest.x) + Math.abs(curNode.y - dest.y);
        newPathFCost = newPathGCost + newPathHCost;

        if (
          newPathFCost < this.boardInfo.get(adjNode.x, adjNode.y).fCost ||
          !this.contains(open, adjNode)
        ) {
          this.boardInfo.get(adjNode.x, adjNode.y).gCost = newPathGCost;
          this.boardInfo.get(adjNode.x, adjNode.y).hCost = newPathHCost;
          this.boardInfo.get(adjNode.x, adjNode.y).fCost = newPathFCost;

          this.boardInfo.get(
            adjNode.x,
            adjNode.y
          ).direction = this.getDirection(adjNode, curNode);

          open.push(adjNode);
        }
      }
    }

    return this.boardInfo.get(dest.x, dest.y).gCost;
  }

  contains(list, node) {
    let i;

    for (i = 0; i < list.length; ++i) {
      if (this.equalNode(node, list[i])) return true;
    }

    return false;
  }

  equalNode(nodeA, nodeB) {
    return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
  }

  compareNode(nodeA, nodeB) {
    if (!(nodeA.x === nodeB.x && nodeA.y === nodeB.y)) {
      return nodeA.fCost < nodeB.fCost ? -1 : 1;
    }
    return 0;
  }
}
