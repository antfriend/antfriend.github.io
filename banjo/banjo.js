// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
var BanjoGame = {
  "CardGame": CardGame,
  "player1clicked": player1clicked,
  "player2clicked": player2clicked
};

function CardGame(targetId) {
  // private variables
  var cards_in_deck = 24;
  var cards = [];
  var card_value = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "01", "02", "03", "04",
    "05", "06", "07", "08", "09", "10", "11", "12"
  ];

  var started = false;
  var matches_found = 0;
  var card1 = false,
    card2 = false;

  function hideCard(id) // turn card face down
  {
    cards[id].firstChild.src = "https://raw.githubusercontent.com/antfriend/banjo/master/cards/banjo_25.png";
    cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform =
      cards[id].style.msTransform = "scale(1.0) rotate(0deg)";
  }

  function moveToPack(id) // move card to pack
  {
    //hideCard(id);
    //move to discard pile
    cards[id].matched = true;
    cards[id].style.top = "120px";
    cards[id].style.left = "-190px";
    cards[id].style.zIndex = "0";
    cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform = cards[id].style.msTransform =
      "rotate(0deg)";
  }

  function moveToPlace(id) // deal card
  {
    cards[id].matched = false;
    cards[id].style.zIndex = "10";
    cards[id].style.top = cards[id].fromtop + "px";
    cards[id].style.left = cards[id].fromleft + "px";
    cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform = cards[id].style.msTransform =
      "rotate(0deg)";
  }

  function flipCard(id) {
    cards[id].style.zIndex = "10";
    cards[id].firstChild.src = "https://raw.githubusercontent.com/antfriend/banjo/master/cards/banjo_" + card_value[
      id] + ".png";
    cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform =
      cards[id].style.msTransform = "scale(1.0) rotate(0deg)";
  }

  //the main event
  function showCard(id) // turn card face up, check for match
  {
    if (id === card1) return; //stop clicking yourself
    if (cards[id].matched) return;
    //cards[id].firstChild.src = "//cdn.the-art-of-web.com/images/cards/" + card_value[id] + ".png";
    cards[id].firstChild.src = "https://raw.githubusercontent.com/antfriend/banjo/master/cards/banjo_" + card_value[
      id] + ".png";
    cards[id].style.zIndex = "99";
    cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform = cards[id].style.msTransform =
      "scale(1.5) rotate(5deg)";


    if (card1 !== false) {
      card2 = id;
      cards[id].style.zIndex = "999";
      if (parseInt(card_value[card1]) == parseInt(card_value[card2])) { // match found
        (function(card1, card2) {
          setTimeout(function() {
            moveToPack(card1);
            moveToPack(card2);
          }, 1000);
        })(card1, card2);
        if (++matches_found == 8) { // game over, reset
          matches_found = 0;
          started = false;
        }
      } else { // no match
        (function(card1, card2) {
          setTimeout(function() {
            //hideCard(card1);
            flipCard(card1);
            //hideCard(card2);
            flipCard(card2);
            player2turn();
          }, 800);
        })(card1, card2);
      }
      card1 = card2 = false;
    } else { // first card turned over
      card1 = id;
    }
  }

  function placeBanjo(card) {
    //add a jump to the right
    cards[card].fromleft = 430;
    //moveToPlace
    asyc_moveToPlace(card);
    flipCard(card);
  }

  function cardClick(id) {
    if (started) {
      showCard(id);
    } else {
      startTheGame();
    }
  }

  function startTheGame() {
    //card_value
    //the game is a foot
    stopLooking(); //eyeball function
    // shuffle and deal cards
    card_value.sort(function() {
      return Math.round(Math.random()) - 0.5;
    });
    for (i = 0; i < cards_in_deck; i++) {
      asyc_moveToPlace(i);
    }
    started = true;
    flipFirstFour();
    waitAndThen(3000, player1turn)
  }

  function waitAndThen(duration, todo) {
    setTimeout(function() {
      todo();
    }, duration);
  }

  function asyc_moveToPlace(idx) {
    setTimeout(function() {
      moveToPlace(idx);
    }, idx * 100);
  }

  function addlistener_cardClick(idx, newCard) {
    newCard.addEventListener("click", function() {
      cardClick(idx);
    }, false);
  }

  // initialise
  function getFelt() {
    var stage = document.getElementById(targetId);
    var felt = document.createElement("div");
    felt.id = "felt";
    stage.appendChild(felt);
    return felt;
  }
  var felt = getFelt();

  function getCard() {
    var card = document.createElement("div");
    card.innerHTML =
      "<img width='170px' src='https://raw.githubusercontent.com/antfriend/banjo/master/cards/banjo_25.png'>";
    return card;
  }
  var card = getCard();

  function deal(callback) {
    var drawStackX = 650;
    var drawStackY = 100;
    var initialCards = 4;
    var newCard = {};
    for (var i = 0; i < initialCards; i++) {
      newCard = card.cloneNode(true);

      newCard.fromleft = 230 * (i % 2);
      newCard.fromtop = 264 * Math.floor(i / 2);

      addlistener_cardClick(i, newCard);

      felt.appendChild(newCard);
      cards.push(newCard);
    }
    for (var j = initialCards; j < cards_in_deck; j++) {
      newCard = card.cloneNode(true);
      var adjJ = j - initialCards;
      newCard.fromleft = 2 * (adjJ % 20) + drawStackX;
      newCard.fromtop = 2 * Math.floor(adjJ / 2) + drawStackY;
      addlistener_cardClick(j, newCard);
      felt.appendChild(newCard);
      cards.push(newCard);
    }
    callback();
  }

  function flipFirstFour() {
    for (var i = 0; i < 4; i++) {
      if (card_value[i] === '01') {
        placeBanjo(i);
      } else {
        flipCard(i);
      }
    }
  }

  function player1turn() {
    rem();
    sayThis('player 1, your turn');
    var player1 = document.getElementById('player1');
    var player2 = document.getElementById('player2');
    player1.style.visibility = "visible";
    player2.style.visibility = "hidden";
  }



  function player2turn() {
    rem();
    sayThis('player 2, your turn');
    var player1 = document.getElementById('player1');
    var player2 = document.getElementById('player2');
    player1.style.visibility = "hidden";
    player2.style.visibility = "visible";
  }

  deal(function() {
    console.log('dealt');
  });
}; // end of CardGame function

function player2clicked() {
  alert('you really clicked 2');
}

function player1clicked() {
  alert('you really clicked 1');
}
