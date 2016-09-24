function Get(yourUrl) {
  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", yourUrl, false);
  Httpreq.send(null);
  return Httpreq.responseText;
}

function getData() {
  var data = {};
  var json_obj = JSON.parse(Get('./vis/data.json'));
  data = json_obj.data;
  return data;
}

function getDataByCallback(callback) {
  getJSON('./vis/data.json').then(function(result) {
    var data = result.data;
    nodes = data.nodes;
    edges = data.edges;
    //alert('Your Json result is:  ' + data); //you can comment this, i used it to debug
    callback(data); //display the result in an HTML element
  }, function(status) { //error detection....
    alert('Something went wrong.');
  });

}

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
}
