//
var nodes = null;
var edges = null;
var network = null;
var offsetx, offsety, scale, positionx, positiony, duration, easingFunction, doButton, focusButton, showButton;
var statusUpdateSpan;
var finishMessage = '';
var showInterval = false;
var showPhase = 1;
//var amountOfNodes = 10;
var nodeId = 1;

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function updateValues() {
  offsetx = 0; // parseInt(document.getElementById('offsetx').value);
  offsety = 0; // parseInt(document.getElementById('offsety').value);
  duration = 5000; // parseInt(document.getElementById('duration').value);
  scale = 1.0; //parseFloat(document.getElementById('scale').value);
  //positionx = 300; //parseInt(document.getElementById('positionx').value);
  //positiony = 300; //parseInt(document.getElementById('positiony').value);
  easingFunction = "easeInOutQuart"; // document.getElementById('easingFunction').value;
}
