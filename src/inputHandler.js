import { Direction } from "./game";

export default class InputHandler {
  constructor(game) {
    document.addEventListener("keydown", event => {
      // alert(event.keyCode);
      switch (event.keyCode) {
        case 87: // w
          if (!(game.snake.direction % 2))
            game.snake.direction = Direction.North;
          break;

        case 65: // a
          if (game.snake.direction % 2) game.snake.direction = Direction.West;
          break;

        case 83: //s
          if (!(game.snake.direction % 2))
            game.snake.direction = Direction.South;
          break;

        case 68: // d
          if (game.snake.direction % 2) game.snake.direction = Direction.East;
          break;

        case 27:
          game.togglePause();
          break;

        case 32:
          game.start();
          break;

        default:
          break;
      }
      // game.snake.move();
    });

    document.addEventListener("keyup", event => {
      switch (event.keyCode) {
        // case "w":
        //   if (paddle.speed < 0) paddle.stop();
        //   break;

        // case "a":
        //   if (paddle.speed > 0) paddle.stop();
        //   break;

        // case "s":
        //   if (paddle.speed < 0) paddle.stop();
        //   break;

        // case "d":
        //   if (paddle.speed > 0) paddle.stop();
        //   break;

        default:
          break;
      }
    });
  }
}
