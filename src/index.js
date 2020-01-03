import "./styles.css";
import Game from "/src/game.js";
import InputHandler from "./inputHandler";

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");
// ctx.canvas.width = window.innerWidth;
// ctx.canvas.height = window.innerHeight;

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 800;
export const SegmentCountX = 8;
export const SegmentCountY = 8;

export const SegmentSizeX = GAME_WIDTH / SegmentCountX;
export const SegmentStrokeX = SegmentSizeX * 0.7;
export const SegmentSizeY = GAME_HEIGHT / SegmentCountY;
export const SegmentStrokeY = SegmentSizeY * 0.7;

export const DELAY = 50;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);
let inputHandler = new InputHandler(ctx, game);

game.start();

export function gameLoop() {
  // console.log(timestamp);

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  game.update();
  game.draw(ctx);

  // requestAnimationFrame(gameLoop);
}

for (let i = 0; i < 3; ++i) {
  console.log("...");
  // gameLoop();
}

let timer = setTimeout(function updateInteval() {
  gameLoop();
  timer = setTimeout(updateInteval, DELAY);
}, DELAY);

export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
