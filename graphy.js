//
//
//
var nodes = new vis.DataSet();
var edges = new vis.DataSet();
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

function getBaseOptions() {
  return {
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
}

function draw() {
  destroy();
  statusUpdateSpan = document.getElementById('statusUpdate');
  doButton = document.getElementById('btnDo');
  focusButton = document.getElementById('btnFocus');
  showButton = document.getElementById('btnShow');

  // create a network
  var container = document.getElementById('mynetwork');
  var options = getBaseOptions();

  getDataByCallback(function(data) {
    //set the network object
    setGlobalNetwork(container, data, options);
  });
}

function getDataByCallback(callback) {
  getJSON('./vis/data.json').then(function(result) {
    var rdata = result.data;
    nodes.clear(); //necessary on a redraw
    nodes = new vis.DataSet();
    nodes.add(rdata.nodes);

    edges.clear(); //necessary on a redraw
    edges = new vis.DataSet();
    edges.add(rdata.edges);
    var data = {
      nodes: nodes,
      edges: edges
    };
    //alert('Your Json result is:  ' + data); //you can comment this, i used it to debug
    callback(data); //display the result in an HTML element
  }, function(status) { //error detection....
    alert('Something went wrong.');
  });
}

function setGlobalNetwork(container, data, options) {

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
  network.on('doubleClick', function(params) {
    statusUpdateSpan.innerHTML = 'double clicked!';
    showInterval = false;
    var nodeMinion = params.nodes[0];
    if (nodeMinion) {
      myAction2nd(nodeMinion);
    }
  });
}

function myAction2nd(nodeMinion) {
  var allActions = {
    "git.webbot": function() {
      openUrl('https://github.com/antfriend/webbot');
    }
  };
  if (allActions[nodeMinion]) {
    allActions[nodeMinion]();
  }
}



function myAction(id) {
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
      openUrl(
        'https://github.com/antfriend/antfriend.github.io/commit/c080924cc1a304041d4d3b1f06a29d151eea3088#diff-8a11d10fb3c3887836da60096ad16d9d'
      );
    },
    "git.webbot": function() {
      addWebbotChildren();
    },
    "webbot.start": function() {
      var url = 'https://antfriend.herokuapp.com/';
      openUrl(url);
      //alert('start');
    },
    "webbot.stop": function() {
      var url = 'https://antfriend.herokuapp.com/';
      openUrl(url);
      //alert('start');
    },
    "X": function() {
      dance();
    }
  };
  if (allActions[id]) {
    allActions[id]();
  }
}

function getWebbotChildJson() {
  var data = {
    "nodes": [{
      "id": "webbot",
      "label": "webbot",
      "group": 0
    }, {
      "id": "2",
      "label": "2",
      "group": 0
    }],
    "edges": [{
      "from": "webbot",
      "to": "2",
      "length": 100
    }]
  };
  return data;
}

function addOptionsManipulation(options) {
  options.manipulation = {
    addNode: function(data, callback) {
      // filling in the popup DOM elements
      document.getElementById('operation').innerHTML = "Add Node";
      document.getElementById('node-id').value = data.id;
      document.getElementById('node-label').value = data.label;
      document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
      document.getElementById('cancelButton').onclick = clearPopUp.bind();
      document.getElementById('network-popUp').style.display = 'block';
    },
    editNode: function(data, callback) {
      // filling in the popup DOM elements
      document.getElementById('operation').innerHTML = "Edit Node";
      document.getElementById('node-id').value = data.id;
      document.getElementById('node-label').value = data.label;
      document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
      document.getElementById('cancelButton').onclick = cancelEdit.bind(this, callback);
      document.getElementById('network-popUp').style.display = 'block';
    },
    addEdge: function(data, callback) {
      if (data.from == data.to) {
        var r = confirm("Do you want to connect the node to itself?");
        if (r === true) {
          callback(data);
        }
      } else {
        callback(data);
      }
    }
  };
  return options;
}

function addWebbotChildren() {
  //check if the children have been added
  //if so just call the double click action
  if (nodes.get('webbot.start')) {
    myAction2nd('git.webbot');
    return;
  }

  statusUpdateSpan.innerHTML = 'Adding git.webbot children...';
  nodes.add([{
    "id": "webbot.start",
    "label": "start",
    "group": "9"
  }, {
    "id": "webbot.stop",
    "label": "stop",
    "group": "9"
  }]);

  edges.add([{
    "from": "git.webbot",
    "to": "webbot.start"
  }, {
    "from": "git.webbot",
    "to": "webbot.stop"
  }]);
  //network.setData(nodes, edges);
  network.redraw();
  statusUpdateSpan.innerHTML = 'did it';
}

function addWebbotNodes(data, callback) {
  data.id = 'new';
  data.label = 'new';
  callback(data);
}

function clearPopUp() {
  document.getElementById('saveButton').onclick = null;
  document.getElementById('cancelButton').onclick = null;
  document.getElementById('network-popUp').style.display = 'none';
}

function cancelEdit(callback) {
  clearPopUp();
  callback(null);
}

function saveData(data, callback) {
  data.id = document.getElementById('node-id').value;
  data.label = document.getElementById('node-label').value;
  clearPopUp();
  callback(data);
}

function drawFolksonomy() {
  stop(); //just in case
  statusUpdateSpan.innerHTML = 'Adding git.webbot children...';
  destroy();
  // nodes = new vis.DataSet();
  // edges = new vis.DataSet();
  var data2 = getWebbotChildJson();

  var container = document.getElementById('mynetwork');
  var options = getBaseOptions();
  // options.layout = {
  //   randomSeed: seed
  // };
  options = addOptionsManipulation(options);
  setGlobalNetwork(container, data2, options);
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
  positionx = 1;
  positiony = 1;
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
  "baseX": 1,
  "baseY": 1,
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
      //
      this.stop();
      //alert('cant start again');
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
    if (nodes.length > 1) {
      var randoNumbo = Math.floor(Math.random() * nodes.length);
      var theNode = nodes._data[randoNumbo];
      nodeId = theNode.id;
    }
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
    if (network) {
      network.focus(nodeId, options);
    }
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
