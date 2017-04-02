//
// the n commandments
//

var commands = {
  "help": function() {
    return help();
  },
  "dance": function() {
    dance();
    return 'Taxonoman can DANCE!\n' +
      ' i am SOOO crushing it!\n' +
      '  ♫♪.ılılıll|̲̅̅●̲̅̅|̲̅̅=̲̅̅|̲̅̅●̲̅̅|llılılı.♫♪\n' +
      '   The neck bone predicates the head bone!\n' +
      '    The L bone predicates the foot bone!\n';
  },
  "folksonomy": function() {
    drawFolksonomy();
    return 'folksonomy now!';
  },
  "draw": function() {
    draw();
    return 'redrawed now!';
  },
  "stop": function() {
    stop();
    return 'ok, i am done now';
  },
  "start": function() {
    start();
    return 'yeah, start me up';
  },
  "click": function(theMessage) {
    myAction(theMessage);
    return 'clicking ' + theMessage;
  },
  "inspiration": function() {
    var url = 'https://youtu.be/VWU9sJ2879c';
    openUrl(url);
    return 'are you inspired now?';
  },
  "clansOfPagoda": function() {
    var url = './clansOfPagoda';
    openUrl(url);
    return 'Play Clans Of Pagoda!';
  },
  "banjo": function() {
    var url = '/banjo';
    openUrl(url);
    return 'banjo!';
  },
  "card": function() {
    var url = 'https://raw.githubusercontent.com/antfriend/banjo/master/cards/banjo_01.png';
    openUrl(url);
    return 'banjo card';
  },
  "jartron": function() {
    var url = 'http://makezine.com/2010/05/10/jartron-the-robot-dances-shoots-las/';
    openUrl(url);
    return 'Jartron the explorer!';
  },
  "head": function() {
    return '#########\n' +
      '# Ouch! #\n' +
      '#########\n';
  },
  "taxonoman": function() {
    //use a sequencer
    //stop();
    getTaxonoman();
    //focusTaxonoman();
    return '#########\n' +
      '#  :P   #\n' +
      '#########\n';
  }
};

function moveFront(pos) {
  var url = 'https://antfriend.herokuapp.com/front/' + pos;
  getJSON(url).then(function(result) {
    var rdata = result.data;

  }, function(status) { //error detection....
    alert('Something went wrong. ' + status);
  });
}

function moveRear(pos) {
  //https://antfriend.herokuapp.com/rear/90
}

function webBotOff() {
  //https://antfriend.herokuapp.com/toggle/off
}

function firstWord(n, term_or_terms) {
  if (n > 0) {
    return term_or_terms.substring(0, n);
  }
  return false;
}

function everythingAfterTheFirstWord(n, term_or_terms) {
  if (n > 0) {
    return term_or_terms.substring(n, term_or_terms.length).trim();
  }
  return false;
}

function interpret(the_term_or_terms) {
  var thisResult = undefined;
  try {
    var n = the_term_or_terms.indexOf(' ');
    var theFirstWord = firstWord(n, the_term_or_terms);
    if (theFirstWord) {
      var allAft = everythingAfterTheFirstWord(n, the_term_or_terms);
      thisResult = commands[theFirstWord](allAft);
    }
    if (commands[the_term_or_terms]) {
      thisResult = commands[the_term_or_terms]();
    }
  } catch (e) {
    thisResult = e;
  } finally {
    return thisResult;
  }
}

function help() {
  return '==========================\n' +
    'help = here we are!\n' +
    'dance = make the taxonoman dance (:P)\n' +
    'stop = make it stop\n' +
    'start = start randomly refocusing\n' +
    'click [nodeid] = activate the click action\n' +
    'folksonomy = start the folksonomy tool\n' +
    'inspiration = find it within\n' +
    'draw = redraw the nodes\n' +
    'bop()\n' +
    'muvNod(id,x,y)\n' +
    '==========================\n';
}
