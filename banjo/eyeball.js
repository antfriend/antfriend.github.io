var timerVar = setInterval(myTimer, 1000);
var incrementalCounter = 0;
var phraseCounter = 0;
var phrases = [
  "banjo",
  "hello",
  "u play?",
  "banjo",
  "click cards",
  "banjo is a game some other whole family can enjoy"
];
var stopLookingPhrase = 'get a pair and a banjo to win';

function moveEye(idStr, xOffset, yOffset) {
  var domElemnt = document.getElementById(idStr + '.iris');
  var transformAttr = ' translate(' + xOffset + ',' + yOffset + ')';
  if (domElemnt) {
    domElemnt.setAttribute('transform', transformAttr);
    transformAttr = ' scale(' + 5 + ',' + yOffset + ')';
  }
  domElemnt = document.getElementById(idStr + '.pupil');
  if (domElemnt) {
    transformAttr = ' translate(' + xOffset + ',' + yOffset + ')';
    domElemnt.setAttribute('transform', transformAttr);
  }
}

function rando(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function myTimer() {
  incrementalCounter++;
  var currentPhrase = "banjo";
  if (incrementalCounter > 3) {
    moveEye('eyeball', 0, 0);
    phrazeFaze();
  } else {
    rem();
  }
}

function rem() {
  var y = rando(-9, 9);
  var x = rando(-9, 9);
  moveEye('eyeball', x, y);
}

function phrazeFaze() {
  if (phraseCounter < phrases.length - 1) {
    phraseCounter++;
  } else {
    phraseCounter = 0;
  }
  sayThis(phrases[phraseCounter]);
  incrementalCounter = 0;
}

function sayThis(aPhrase) {
  var domElemnt = document.getElementById('dialog');
  domElemnt.textContent = aPhrase;
  if (aPhrase.length > 7) {
    var diffy = aPhrase.length - 7;
    diffy = diffy / 2;
    diffy = 6 - diffy;
    if (diffy < 1) {
      diffy = 1;
    }
    domElemnt.style.fontSize = diffy.toString() + 'em';
  } else {
    domElemnt.style.fontSize = '6em';
  }
}

function stopLooking() {
  clearInterval(timerVar);
  sayThis(stopLookingPhrase);
  moveEye('eyeball', 15, 7);
}
