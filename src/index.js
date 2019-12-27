import "./styles.css";
import Game from "/src/game.js";

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 800;
export const SegmentSize = GAME_WIDTH / 30.0;
export const SegmentStroke = SegmentSize * 0.7;

export const DELAY = 100;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);

game.start();

function gameLoop() {
  // console.log(timestamp);

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  game.update();
  game.draw(ctx);

  // requestAnimationFrame(gameLoop);
}

for (let i = 0; i < 10; ++i) {
  // gameLoop();
}

let timer = setTimeout(function updateInteval() {
  gameLoop();
  timer = setTimeout(updateInteval, DELAY);
}, DELAY);

export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
