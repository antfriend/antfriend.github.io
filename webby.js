//
//
//

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

function openUrl(url) {
  //var win = window;
  var speed = 1000;
  var easing = 'swing';

  function gonow() {
    //$("<a href='" + url + "'></a>").click();
    //window.location.href(url);
    var win = window.open(url, '_blank');
    win.focus();
  }
  //$('body').fadeOut(speed, easing, gonow);
  gonow();
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
