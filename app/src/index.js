import "./styles.css";
import Game from "/src/game.js";
import InputHandler from "./inputHandler";
import { GameState } from "./game";

export const infinite = 0xffff;

export var canvas = document.getElementById("gameScreen");
export var ctx = canvas.getContext("2d");
// ctx.canvas.width = window.innerWidth * 0.95;
// ctx.canvas.height = window.innerHeight * 0.95;

export var delaySlider = document.getElementById("delaySlider");
export var gridCheckbox = document.getElementById("gridCheckbox");
export var treeCheckbox = document.getElementById("treeCheckbox");
export var gridXSegments = document.getElementById("gridXSegments");
export var gridYSegments = document.getElementById("gridYSegments");

export var dimensionAlert = document.getElementById("dimensionAlert");
export var restartButton = document.getElementById("restartButton");

export var GAME_WIDTH = ctx.canvas.width;
export var GAME_HEIGHT = ctx.canvas.height;
export var SegmentCountX = gridXSegments.value;
export var SegmentCountY = gridYSegments.value;

export var SegmentSizeX;
export var SegmentStrokeX;
export var SegmentSizeY;
export var SegmentStrokeY;

export var gridEnabled;
export var treeEnabled;

export var DELAY = 50;

startConfigs();

let game = new Game(GAME_WIDTH, GAME_HEIGHT);
let inputHandler = new InputHandler(ctx, game);

game.start();

export function checkConfigs() {
  /// velocity
  DELAY = (1 - delaySlider.value / 100) * 1000;

  gridEnabled = gridCheckbox.checked;
  treeEnabled = treeCheckbox.checked;

  /// if game is over
  if (game.gameState === GameState.WIN) {
    /// start again
    game = new Game(GAME_WIDTH, GAME_HEIGHT);
    inputHandler = new InputHandler(ctx, game);
    game.start();
  }
}

canvas.onclick = function() {
  gameLoop();
};
export function gameLoop() {
  // console.log(timestamp);

  game.update();
  draw();

  // requestAnimationFrame(gameLoop);
}

export function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  if (gridEnabled) game.drawGuideGrid(ctx);
  if (treeEnabled) game.drawGuideTree(ctx);

  game.draw(ctx);
}

for (let i = 0; i < 3; ++i) {
  checkConfigs();
  console.log("...");
  gameLoop();
}

let timer = setTimeout(function updateInteval() {
  checkConfigs();
  gameLoop();
  timer = setTimeout(updateInteval, DELAY);
}, DELAY);

export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

restartButton.onclick = function() {
  changeDimensions();
};
export function changeDimensions() {
  let x = gridXSegments.value;
  let y = gridYSegments.value;

  if (x % 2 || y % 2) {
    console.log("HELLO!");
    dimensionAlert.innerText = "Dimensions should be divisible by 2!";
    return;
  }
  dimensionAlert.innerText = "";

  SegmentCountX = x;
  SegmentCountY = y;
  startConfigs();
  game = new Game(GAME_WIDTH, GAME_HEIGHT);
  inputHandler = new InputHandler(ctx, game);
  game.start();
  draw();
}

export function startConfigs() {
  SegmentSizeX = GAME_WIDTH / SegmentCountX;
  SegmentStrokeX = SegmentSizeX * 0.8;
  SegmentSizeY = GAME_HEIGHT / SegmentCountY;
  SegmentStrokeY = SegmentSizeY * 0.8;

  gridEnabled = false;
  treeEnabled = false;
}
