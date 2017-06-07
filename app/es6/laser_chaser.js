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
let frame = null;
let now = null;
let then = Date.now();
let delta = null;

let laser = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  dx: 0,
  dy: 0,
  speed: 5,
  stat: 'moving'
};

let coordinate = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

let hitbox = {
  left: 0,
  right: 0,
  top: 0,
  buttom: 0
};

const onImageLoad = () => {
  console.log("Image loaded!");
};

const setup = () => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  frame = new Image();
  frame.onload = onImageLoad();
  frame.src = 'imgs/point.png';
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

const getSpeed = (lx, ly, cx, cy) => {
  let x = cx - lx;
  let y = cy - ly;
  let z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

  let ds = Math.random();

  let dx = x / z * laser.speed * ds;
  let dy = y / z * laser.speed * ds;
  let speed = [dx, dy];
  return speed;
}

const doMoving = () => {
  if (coordinate.x > hitbox.left && coordinate.x < hitbox.right && coordinate.y > hitbox.top && coordinate.y < hitbox.buttom) {
    randomCoordinate();
    let ds = Math.random() * 10 + 1;
    let newSpeed = getSpeed(laser.x, laser.y, coordinate.x, coordinate.y);
    laser.dx = newSpeed[0] * ds;
    laser.dy = newSpeed[1] * ds;
  }
}

const doTwinkle = () => {
  let ran = Math.random() * 10;
  let r = 5;
  if (Math.round(ran) > 5) {
    laser.dx = Math.random() * r;
    laser.dy = Math.random() * r;
  } else if (Math.round(ran) <= 5) {
    laser.dx = Math.random() * -r;
    laser.dy = Math.random() * -r;
  }
}

const doBlink = () => {
  randomCoordinate();
  laser.x = coordinate.x;
  laser.y = coordinate.y;
}

let ticks = 0;
let timer = 0;

const animate = () => {
  clearScreen();

  let drawSize = 50;
  let halfSize = drawSize / 2;
  let drawX = laser.x - halfSize;
  let drawY = laser.y - halfSize;

  hitbox.left = drawX;
  hitbox.right = drawX + drawSize;
  hitbox.top = drawY;
  hitbox.buttom = drawY + drawSize;

  let movement = Math.round(Math.random() * 10);

  let rs = Math.random() * 1000;
  if (rs < 10) {
    doBlink();
  } else if (rs < 50) {
    doTwinkle();
  } else {
    doMoving();
  }

  laser.x += laser.dx;
  laser.y += laser.dy;

  context.drawImage(frame, drawX, drawY, drawSize, drawSize);

  if (hitbox.left < border) {
    laser.dx = Math.random() * laser.speed + laser.speed;
  }
  if (hitbox.right > (window.innerWidth - border)) {
    laser.dx = (Math.random() * laser.speed + laser.speed) * -1;
  }
  if (hitbox.top < border) {
    laser.dy = Math.random() * laser.speed + laser.speed;
  }
  if (hitbox.buttom > (window.innerHeight - border)) {
    laser.dy = (Math.random() * laser.speed + laser.speed) * -1;
  }

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
