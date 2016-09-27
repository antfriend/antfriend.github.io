//
//
//
var iAmTheTerminal = {};

function tryCommand(command) {
  iAmTheTerminal.echo(new String(command));
  var result = interpret(command);
  if (result !== undefined) {
    iAmTheTerminal.echo(new String(result));
  }
}

jQuery(function($, undefined) {
  iAmTheTerminal = $('#antfriend_console').terminal(function(command, term) {

    if (command !== '') {
      try {
        var result = interpret(command);
        if (result === undefined) {
          result = window.eval(command);
        }
        if (result !== undefined) {
          term.echo(new String(result));
        }
      } catch (e) {
        term.error(new String(e));
      }
    } else {
      term.echo('');
    }
  }, {
    greetings: '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n' +
      ' = Antfriend is your friend = \n' + '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n' +
      '"help" to see a list of commands',
    name: 'antfriend_console',
    prompt: 'ant> ',
    outputLimit: 28
  }).click(function(params) {
    //this.echo('true');
    //alert(params);
  });
});
