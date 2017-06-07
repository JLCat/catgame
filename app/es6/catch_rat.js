const polifill = () => {
  let lastTime = 0;
  let vendors = ['ms', 'moz', 'webkit', 'o'];
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
    let currTime = new Date().getTime();
    let timeToCall = Math.max(0, 16 - (currTime - lastTime));
    let id = window.setTimeout(function() {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
  if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
};

let canvas = null;
let context = null;
let pause = false;
let border = 10;
let frameRate = 1000 / 60;
let frames = [];
let frame = 0;
let now = null;
let then = Date.now();
let delta = null;

let assets = [
  'imgs/001.png',
  'imgs/002.png',
  'imgs/002.png',
  'imgs/003.png',
  'imgs/003.png',
  'imgs/002.png',
  'imgs/002.png',
  'imgs/001.png'
];

let rat = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  a: 0,
  dx: 0,
  dy: 0,
  da: 0,
  runSpeed: 5,
  rotateSpeed: 10
};

let coordinate = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

const onImageLoad = () => {
  console.log("Image loaded!");
};

const Sprite = function(filename) {
  this.image = null;
  this.pattern = null;
  this.TO_RADIANS = Math.PI / 180;

  if (filename != undefined && filename != "" && filename != null) {
    this.image = new Image();
    this.image.onload = onImageLoad;
    this.image.src = filename;
  } else {
    console.log(`Image ${filename} not found!`);
  }

  this.draw = (x, y, size) => {
    context.drawImage(this.image, x, y, size, size);
  }

  this.rotate = (x, y, size, angle) => {
    context.save();
    context.translate(x, y);
    context.rotate(angle * this.TO_RADIANS);
    context.drawImage(this.image, -(size / 2), -(size / 2), size, size);
    context.restore();
  }
}

const setup = () => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  for (let i = 0; i < assets.length; i++) {
    frames.push(new Sprite(assets[i]));
  }
};

const tick = () => {
  if (pause) return;
  requestAnimationFrame(tick);
  now = Date.now();
  delta = now - then;
  if (delta > frameRate) {　　　　
    then = now - (delta % frameRate);
    animate();
  }
};

const clearScreen = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
};

const randomCoordinate = () => {
  coordinate.x = border + Math.round(Math.random() * (window.innerWidth - border * 2));
  coordinate.y = border + Math.round(Math.random() * (window.innerHeight - border * 2));
};

const getSpeed = (rx, ry, cx, cy) => {
  let x = cx - rx;
  let y = cy - ry;
  let z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

  let dx = x / (z / rat.runSpeed);
  let dy = y / (z / rat.runSpeed);

  let speed = [dx, dy];
  return speed;
}

const getAngle = (rx, ry, cx, cy) => {
  let x = Math.abs(rx - cx);
  let y = Math.abs(ry - cy);
  let z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

  let cos = y / z;
  let radina = Math.acos(cos);
  let angle = Math.floor(180 / (Math.PI / radina));

  if (cx > rx && cy > ry) { //第四象限
    angle = 180 - angle;
  }

  if (cx < rx && cy > ry) { //第三象限
    angle = 180 + angle;
  }

  if (cx < rx && cy < ry) { //第二象限
    angle = 360 - angle;
  }

  if (cx > rx && cy < ry) { //第一象限
    angle = angle;
  }

  if (cx == rx && cy > ry) { //Y轴负方向
    angle = 180;
  }

  if (cx == rx && cy < ry) { //Y轴正方向
    angle = 0;
  }

  if (cx > rx && cy == ry) { //X轴正方向
    angle = 90;
  }

  if (cx < rx && cy == ry) { //X轴负方向
    angle = 360;
  }

  return angle;
}

const animate = () => {
  clearScreen();

  let drawSize = Math.max(window.innerWidth, window.innerHeight) / 5;
  let halfSize = drawSize / 2;
  let drawX = rat.x - halfSize;
  let drawY = rat.y - halfSize;

  let hitbox = {
    left: drawX,
    right: drawX + drawSize,
    top: drawY,
    buttom: drawY + drawSize
  }

  if (coordinate.x > hitbox.left && coordinate.x < hitbox.right && coordinate.y > hitbox.top && coordinate.y < hitbox.buttom) {
    randomCoordinate();
  }

  let newAngle = getAngle(rat.x, rat.y, coordinate.x, coordinate.y);
  let newSpeed = getSpeed(rat.x, rat.y, coordinate.x, coordinate.y);
  let delta = newAngle - rat.a;

  if (delta == 0) {
    rat.dx = newSpeed[0];
    rat.dy = newSpeed[1];
    rat.da = 0;
  } else {
    if (Math.abs(delta) > rat.rotateSpeed) {
      rat.da = delta > 0 ? rat.rotateSpeed : -rat.rotateSpeed;
    } else {
      rat.da = delta;
    }
    rat.dx = 0;
    rat.dy = 0;
  }

  rat.x += rat.dx;
  rat.y += rat.dy;
  rat.a += rat.da;

  frames[frame].rotate(rat.x, rat.y, drawSize, rat.a);
  frame = (frame + 1) % frames.length;

  // if (hitbox.left < border) {
  //   randomCoordinate();
  //   // rat.dx = Math.abs(rat.dx);
  // }
  // if (hitbox.right > (window.innerWidth - border)) {
  //   randomCoordinate();
  //   // rat.dx = Math.abs(rat.dx) * -1;
  // }
  // if (hitbox.top < border) {
  //   randomCoordinate();
  //   // rat.dy = Math.abs(rat.dy);
  // }
  // if (hitbox.buttom > (window.innerHeight - border)) {
  //   randomCoordinate();
  //   // rat.dy = Math.abs(rat.dy) * -1;
  // }
};

const gameStart = () => {
  pause = false;
  tick();
};

const gameStop = () => {
  pause = true;
};

const gameListener = () => {
  let $btnCtrl = $(".control-button");
  $btnCtrl.click(() => {
    if ($btnCtrl.hasClass("start")) {
      gameStart();
    } else {
      gameStop();
    }
    $btnCtrl.toggleClass("start");
    $btnCtrl.toggleClass("stop");
  });
};

$(document).ready(() => {
  polifill();
  setup();
  gameListener();
});

$(window).resize(() => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
