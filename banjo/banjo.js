// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

var CardGame = function(targetId) {
  // private variables
  var cards_in_deck = 12;
  var cards = [];
  var card_value = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  var started = false;
  var matches_found = 0;
  //var card1 = false,
  //  card2 = false;

  var hideCard = function(id) // turn card face down
    {
      cards[id].firstChild.src = "https://raw.githubusercontent.com/antfriend/banjo/master/cards/banjo_25.png";
      cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform =
        cards[id].style.msTransform = "scale(1.0) rotate(0deg)";
    };

  var moveToPack = function(id) // move card to pack
    {
      hideCard(id);
      cards[id].matched = true;
      cards[id].style.zIndex = "1000";
      cards[id].style.top = "100px";
      cards[id].style.left = "-140px";
      cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform = cards[id].style.msTransform =
        "rotate(0deg)";
      cards[id].style.zIndex = "0";
    };

  var moveToPlace = function(id) // deal card
    {
      cards[id].matched = false;
      cards[id].style.zIndex = "1000";
      cards[id].style.top = cards[id].fromtop + "px";
      cards[id].style.left = cards[id].fromleft + "px";
      cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform = cards[id].style.msTransform =
        "rotate(0deg)";
      cards[id].style.zIndex = "0";
    };

  var showCard = function(id) // turn card face up, check for match
    {
      //if (id === card1) return;
      //if (cards[id].matched) return;
      //cards[id].firstChild.src = "//cdn.the-art-of-web.com/images/cards/" + card_value[id] + ".png";
      cards[id].firstChild.src = "https://raw.githubusercontent.com/antfriend/banjo/master/cards/banjo_" + card_value[
        id] + ".png";
      cards[id].style.WebkitTransform = cards[id].style.MozTransform = cards[id].style.OTransform = cards[id].style.msTransform =
        "scale(1.0) rotate(2deg)";

      // if (card1 !== false) {
      //   card2 = id;
      //   if (parseInt(card_value[card1]) == parseInt(card_value[card2])) { // match found
      //     (function(card1, card2) {
      //       setTimeout(function() {
      //         moveToPack(card1);
      //         moveToPack(card2);
      //       }, 1000);
      //     })(card1, card2);
      //     if (++matches_found == 8) { // game over, reset
      //       matches_found = 0;
      //       started = false;
      //     }
      //   } else { // no match
      //     (function(card1, card2) {
      //       setTimeout(function() {
      //         hideCard(card1);
      //         hideCard(card2);
      //       }, 800);
      //     })(card1, card2);
      //   }
      //   card1 = card2 = false;
      // } else { // first card turned over
      //   card1 = id;
      // }
    };

  var cardClick = function(id) {
    if (started) {
      showCard(id);
    } else {
      // shuffle and deal cards
      card_value.sort(function() {
        return Math.round(Math.random()) - 0.5;
      });
      for (i = 0; i < cards_in_deck; i++) {
        asyc_moveToPlace(i);
      }
      started = true;
    }
  };

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
  var baseCard = getCard();

  function deal() {
    var newCard = {};
    for (var i = 0; i < cards_in_deck; i++) {
      newCard = baseCard.cloneNode(true);

      newCard.fromleft = 230 * (i % 2);
      newCard.fromtop = 264 * Math.floor(i / 2);

      addlistener_cardClick(i, newCard);
      felt.appendChild(newCard);
      cards.push(newCard);
    }
    // for (var j = 4; j < cards_in_deck; j++) {
    //   newCard = baseCard.cloneNode(true);
    //
    //   newCard.fromleft = 2 * (j % 20) + 500;
    //   newCard.fromtop = 2 * Math.floor(j / 2) + 200;
    //
    //   addlistener_cardClick(j, newCard);
    //   felt.appendChild(newCard);
    //   cards.push(newCard);
    // }
    //baseCard.style.top = "10px";
  }

  deal();

};
