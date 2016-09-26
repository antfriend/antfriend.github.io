function is_touch_device() {
  return 'ontouchstart' in window // works on most browsers
    || 'onmsgesturechange' in window; // works on ie10
}

$(function() {
  $.keyboard.keyaction.pageup = function() {
    term.scroll(-10);
  };
  $.keyboard.keyaction.pagedown = function() {
    term.scroll(10);
  };
  $.keyboard.keyaction.foo = function() {
    console.log('foo');
  };
  var keyboard = $('textarea').keyboard({
    layout: 'custom',
    customLayout: {
      'default': [
        '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
        '{tab} q w e r t y u i o p [ ] \\',
        'a s d f g h j k l ; \' {enter}',
        '{shift} z x c v b n m , . / {shift} {pageup}',
        '{sp:2} {alt} {space} {sp:1} {left} {right} {pagedown}'
      ],
      'shift': [
        '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
        '{tab} Q W E R T Y U I O P { } |',
        'A S D F G H J K L : " {enter}',
        '{shift} Z X C V B N M < > ? {shift}',
        '{space} {left} {right}'
      ]
    },
    display: {
      'pageup': 'pgUp',
      'pagedown': 'pgDown'
    },
    usePreview: false,
    alwaysOpen: true,
    stayOpen: true,
    appendTo: '#keyboard-wrapper'
  }).getkeyboard().reveal();

  // there is no other easy way to make cursor working with keyboard
  // the result of this is that textarea can have garbage
  (function(insertText) {
    keyboard.insertText = function(text) {
      if (text == 'bksp') {
        var e = $.Event("keydown");
        e.which = 8;
        $root.trigger(e);
      } else {
        term.insert(text);
      }
      //return insertText.apply(keyboard, [].slice.call(arguments));
    };
  })(keyboard.insertText);

  var $root = $(document.documentElement || window);
  // proper use of API
  $.extend($.keyboard.keyaction, {
    enter: function(base, el, e) {
      var event = $.Event("keydown");
      event.which = event.keyCode = 13;
      event.shiftKey = e.shiftKey;
      $root.trigger(event);
    },
    tab: function(base, el, e) {
      var event = $.Event("keydown");
      event.which = 9;
      event.shiftKey = e.shiftKey;
      $root.trigger(event);
      return false;
    },
    left: (function(left) {
      return function(base, el, e) {
        // match terminal postion with
        var cmd = term.cmd();
        cmd.position(-1, true);
        left.apply(this, [].slice.call(arguments));
      };
    })($.keyboard.keyaction.left),
    right: (function(right) {
      return function(base, el, e) {
        var cmd = term.cmd();
        cmd.position(1, true);
        right.apply(this, [].slice.call(arguments));
      };
    })($.keyboard.keyaction.right)
  });
  var intepreter = {
    foo: function() {
      this.echo('bar');
    },
    help: function() {
      this.echo('Avaiable commands: ' + Object.keys(intepreter).join(', '));
    }
  };
  var term = $('#term').terminal(intepreter, {
    name: 'virtual',
    greetings: 'Virtual Keyboard Demo',
    completion: true,
    onBlur: function() {
      return false;
    }
  });
});
