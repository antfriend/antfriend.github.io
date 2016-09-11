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

function draw() {
  destroy();
  statusUpdateSpan = document.getElementById('statusUpdate');
  doButton = document.getElementById('btnDo');
  focusButton = document.getElementById('btnFocus');
  showButton = document.getElementById('btnShow');

  // create a network
  var container = document.getElementById('mynetwork');
  var options = {
    "edges": {
      "smooth": {
        "forceDirection": "none"
      }
    },
    physics: {
      stabilization: {
        enabled: true,
        iterations: 1000,
        updateInterval: 100,
        onlyDynamicEdges: false,
        fit: true
      },
      timestep: 0.5,
      adaptiveTimestep: true
    }
  };

  getDataByCallback(function(data) {
    network = new vis.Network(container, data, options);
    // add event listeners
    network.on('select', function(params) {
      document.getElementById('selection').innerHTML = 'Selection: ' + params.nodes;
    });
    network.on('stabilized', function(params) {
      document.getElementById('stabilization').innerHTML = 'Stabilization took ' + params.iterations +
        ' iterations.';
    });
    network.on('animationFinished', function() {
      statusUpdateSpan.innerHTML = finishMessage;
    });
    network.on('click', function(params) {
      statusUpdateSpan.innerHTML = 'clicked!';
      showInterval = false;
      var nodeMinion = params.nodes[0];
      if (nodeMinion) {
        myAction(nodeMinion);
      }
    });
  });
}

function myAction(id) {
  function openUrl(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }
  var allActions = {
    "antfriend": function() {
      draw();
    },
    "blog": function() {
      openUrl('https://antfriend.wordpress.com/');
    },
    "videos": function() {
      openUrl('https://www.youtube.com/user/antfriend/videos');
    },
    "git": function() {
      openUrl('https://github.com/antfriend');
    },
    "git.this": function() {
      openUrl('https://github.com/antfriend/antfriend.github.io');
    }
  };
  if (allActions[id]) {
    allActions[id]();
  }
}

function fitAnimated() {
  updateValues();

  var options = {
    offset: {
      x: offsetx,
      y: offsety
    },
    duration: duration,
    easingFunction: easingFunction
  };
  statusUpdateSpan.innerHTML = 'Doing fit() Animation.';
  finishMessage = 'Animation finished.';
  network.fit({
    animation: options
  });
}

function doDefaultAnimation() {
  updateValues();

  var options = {
    position: {
      x: positionx,
      y: positiony
    },
    scale: scale,
    offset: {
      x: offsetx,
      y: offsety
    },
    animation: true // default duration is 1000ms and default easingFunction is easeInOutQuad.
  };
  statusUpdateSpan.innerHTML = 'Doing Animation.';
  finishMessage = 'Animation finished.';
  network.moveTo(options);
}

function bop() {
  positionx = 50;
  positiony = 50;
  doAnimation();
}

function doAnimation() {
  updateValues();

  var options = {
    position: {
      x: positionx,
      y: positiony
    },
    scale: scale,
    offset: {
      x: offsetx,
      y: offsety
    },
    animation: {
      duration: duration,
      easingFunction: easingFunction
    }
  };
  statusUpdateSpan.innerHTML = 'Doing Animation.';
  finishMessage = 'Animation finished.';
  network.moveTo(options);
}

function stopTimer() {
  hulkDancer.stop();
}

function dancingYeah() {
  // setInterval function doesn't like to
  //reference this function directly
  //go figure
  hulkDancer.danceMoves();
}

var hulkDancer = {
  "baseX": -1,
  "baseY": -400,
  "interValObject": null,
  "timerAlternator": true,
  "start": function() {
    //starting
    if (this.interValObject === null) {
      stop(); //stop the other stuff
      this.danceMoves();
      positionx = this.baseX;
      positiony = this.baseY;
      doAnimation();
      this.interValObject = setInterval(dancingYeah, 500);
    } else {
      alert('cant start again');
    }
  },
  "stop": function() {
    //stopping
    if (this.interValObject) {
      clearInterval(this.interValObject);
      this.interValObject = null;
    }
  },
  "danceMoves": function() {
    if (this.timerAlternator) {
      this.timerAlternator = false;
      muvNod('head', this.baseX - 200, this.baseY - 200);
      muvNod('X', this.baseX - 200, this.baseY - 150);
      muvNod('lefthand', this.baseX - 400, this.baseY - 200);
    } else {
      this.timerAlternator = true;
      muvNod('head', this.baseX - 150, this.baseY - 200);
      muvNod('X', this.baseX - 150, this.baseY - 150);
      muvNod('righthand', this.baseX, this.baseY - 200);
      finishMessage = 'Hulk crushing it!';
    }
  }
};

function dance() {
  hulkDancer.start();
}

function moveTheNode() {
  muvNod(nodeId, 2, 2);
}

function muvNod(id, x, y) {
  if (id) {
    network.moveNode(id, x, y);
    //network.nodes[id].x=x;
    //network.nodes[id].y=y;
  }
}

function focusRandom() {
  if (nodes) {
    nodeId = nodes[Math.floor(Math.random() * nodes.length)].id;
  } else {
    nodeId = null;
  }


  updateValues();
  //moveTheNode();
  var options = {
    // position: {x:positionx,y:positiony}, // this is not relevant when focusing on nodes
    scale: scale,
    offset: {
      x: offsetx,
      y: offsety
    },
    animation: {
      duration: duration,
      easingFunction: easingFunction
    }
  };
  if (nodeId) {
    statusUpdateSpan.innerHTML = 'Focusing on node: ' + nodeId;
    finishMessage = 'Node: ' + nodeId + ' in focus.';
    network.focus(nodeId, options);
  } else {
    statusUpdateSpan.innerHTML = 'Focusing on NO node: ';
    finishMessage = 'Node NOT in focus.';
  }
}

function start() {
  startShow();
}

function stop() {
  showInterval = false;
  hulkDancer.stop();
}


function startShow() {
  updateValues();

  if (showInterval !== false) {
    showInterval = false;
    //showButton.value = 'begin';
    network.fit();
  } else {
    //showButton.value = 'cease';
    focusRandom();
    setTimeout(doTheShow, duration);
    showInterval = true;
  }
}

function doTheShow() {
  updateValues();
  if (showInterval === true) {
    if (showPhase === 0) {
      focusRandom();
      showPhase = 1;
    } else {
      //fitAnimated();
      focusRandom();
      showPhase = 0;
    }
    setTimeout(doTheShow, duration);
    moveTheNode();
  }
  //do nothing
}
