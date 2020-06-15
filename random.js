// Generates a random int in the range [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// returns an array of n random unique numbers in the range [min, max]
// n must be larger than max-min.
function nUniqueRandom(n, min, max) {
  let arr = []; // min..max
  for (var i = min; i <= max; i++) {
    arr.push(i);
  }
  let curr_index = 0;
  while (curr_index <= max) {
    let tmp = arr[curr_index]
    let rand_index = randInt(curr_index, arr.length - 1);
    arr[curr_index] = arr[rand_index];
    arr[rand_index] = tmp;
    curr_index++;
  }
  return arr.slice(0,n);
}

// https://stackoverflow.com/a/11809348
function makeRandomRange(x) {
  var range = new Array(x),
    pointer = x;
  return function getRandom() {
    pointer = (pointer-1+x) % x;
    var random = Math.floor(Math.random() * pointer);
    var num = (random in range) ? range[random] : random;
    range[random] = (pointer in range) ? range[pointer] : pointer;
    return range[pointer] = num;
  };
}

function randomCard(min_toss, max_toss, max_multiplicity) {
  if ((Math.random() < 0.05)) {
    return [0];
  }
  var multiplicity = 0;

  if (max_multiplicity === 1) {
    multiplicity = 1;
  } else {
    // Pick actual multiplicty by giving [0,0.5] to 1, [0.5,0.75] to 2 ...
    // up to max multiplicity. Unused range goes to 1.
    // TODO(jmerm): surely there's a way to replace this with some log_2 math.
    var increaser = Math.random();
    for (let i = 0; i < max_multiplicity; i++) {
      if (increaser < 1) {
        increaser *= 2;
        multiplicity += 1;
      }
    }
    if (increaser < 1) {
      multiplicity = 1;
    }
  }

  // Pick that many tosses and sort descending
  let ret = nUniqueRandom(multiplicity, min_toss, max_toss);
  ret.sort(function(a, b){return b-a;});
  return ret;
}

// handles a multiplex card at height "accum" and returns the new accum
function handleCard(card, accum) {
  for (let card_entry of card) {
    if (card_entry >= accum) {
      accum -= 1;
    }
  }
  return accum;
}

function convertCards(cards) {
  var ret = [];
  // handle each card one by one
  for (var i = 0; i < cards.length; i++) {
    var translated_card = [];
    for (let toss of cards[i]) {
      var accum = toss;
      var steps = 0;
      var card_index = (i+1) % cards.length;
      while (accum > 0) {
        accum = handleCard(cards[card_index], accum);
        steps += 1;
        card_index = (card_index + 1) % cards.length;
      }
      translated_card.push(steps);
    }
    ret.push(translated_card);
  }
  return ret;
}

function randomAsync(len, num_balls, max_multiplicity) {
  var cards = [];
  for (var i = 0; i < len; i++) {
    cards.push(randomCard(1, num_balls, max_multiplicity));
  }
  // make sure some card has a height of [num_balls] so that there will actually
  // be that many balls in the pattern.
  cards[0][0] = num_balls;
  return convertCards(cards);
}

function randomSync(len, num_balls, max_multiplicity) {
  var cards = [];
  for (var i = 0; i < len; i++) {
    var right_card = randomCard(1, num_balls, max_multiplicity);
    var left_card = randomCard(1 + right_card.length, num_balls, max_multiplicity);
    cards.push(left_card);
    cards.push(right_card);
  }
  // make sure some card has a height of [num_balls] so that there will actually
  // be that many balls in the pattern.
  if (Math.random() < 0.5) {
    cards[0] = [num_balls];
  } else {
    cards[1] = [num_balls]
  }
  return convertCards(cards);
}

function randomSiteswap(length, max_throw, max_multiplicity, is_sync) {
  var ret = [];
  if (is_sync) {
    return randomSync(length, max_throw, max_multiplicity);
  } 
  return randomAsync(length, max_throw, max_multiplicity);
}


function toToss(i) {
  if (i >= 0 && i <= 9) {
    return String.fromCharCode(i + 48);
  } else if (i >= 10 && i <= 35) {
    return String.fromCharCode(i + 97 - 10);
  } else {
    return '{' + i.toString() + '}';
  }
  // TODO: handle characters larger than this?
}

function toMultiToss(arr) {
  let ret = "";
  if (arr.length == 1) {
    ret = ret.concat(toToss(arr[0]));
  } else {
    ret = ret.concat("[");
    for (let multi of arr) {
      ret = ret.concat(toToss(multi));
    }
    ret = ret.concat("]");
  }
  return ret;
}

// Takes a siteswap in int-list-list form and returns a string representation of
// it.
function printAsyncSiteswap(siteswap) {
  let ret = "";
  for (let toss of siteswap) {
    ret += toMultiToss(toss);
  }
  return ret;
}

function toSyncToss(i, odd_modifier) {
  if (i % 2 == 0) {
    return toToss(i);
  }
  let ret = (toToss(i + odd_modifier) + 'x');
  if (i + odd_modifier > 35) {
    ret = ret.substr(0, ret.length - 2) + 'x}';
  }
  return ret;
}

function toSyncMultiToss(arr, odd_modifier) {
  let ret = "";
  if (arr.length == 1) {
    ret = ret.concat(toSyncToss(arr[0], odd_modifier));
  } else {
    ret = ret.concat("[");
    for (let multi of arr) {
      ret = ret.concat(toSyncToss(multi, odd_modifier));
    }
    ret = ret.concat("]");
  }
  return ret;
}

function printSyncSiteswap(siteswap) {
  let ret = "";
  for (let i = 0; i < siteswap.length; i++) {
    if (i % 2 === 0) {
      ret += "("
      ret += toSyncMultiToss(siteswap[i], -1);
      ret += ","
    } else {
      ret += toSyncMultiToss(siteswap[i], 1);
      ret += ")"
    }
  }
  return ret;
}
