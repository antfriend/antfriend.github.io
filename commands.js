var commands = {
  "help": function() {
    return help();
  },
  "dance": function() {
    dance();
    return 'i am SOOO crushing it!';
  },
  "stop": function() {
    stop();
    return 'ok, i am done now';
  }
};

function interpret(the_term_or_terms) {
  var thisResult = undefined;
  try {
    if (commands[the_term_or_terms]) {
      thisResult = commands[the_term_or_terms]();
    }
  } catch (e) {
    thisResult = JSON.stringify(e);
  } finally {
    return thisResult;
  }

}

function help() {
  return '==========================\n' +
    'help = here we are!\n' +
    'dance = make the robot dance (:P)\n' +
    'stop = make it stop\n' +
    'bop()\n' +
    'draw()\n' +
    'muvNod(id,x,y)\n' +
    'start()\n' +

    '==========================\n';
}
