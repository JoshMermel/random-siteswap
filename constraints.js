var give_up_threshhold = 10000;

// return n%m but negatives mod to positives
function pmod(n, m) {
  return ((n % m) + m) % m
}

function parseConstraint(str) {
  if (str === "") {
    return "";
  }
  if (!isNaN(+str)) {
    return +str;
  } else if (str.length === 1 && str.match(/[a-z]/i)) {
    return str[0].charCodeAt(0) - "a".charCodeAt(0) + 10;
  }
  return "Parse Error";
}

// returns the max value in siteswap[idx]
// TODO(jmerm): is_sync is super confusingly named. it really means applying the
// +/- 1 modifier of sync siteswaps which sometimes isn't used even when
// handling sync siteswaps. I should find a better name.
function getIdxMax(siteswap, idx, is_sync) {
  let ret = siteswap[idx][0];
  if (is_sync && (ret % 2 === 1)) {
    if (idx % 2 === 0) {
      ret -= 1;
    } else {
      ret += 1
    }
  }
  return ret;
}

// returns the min value in siteswap[idx]
// TODO(jmerm): is_sync is super confusingly named. it really means applying the
// +/- 1 modifier of sync siteswaps which sometimes isn't used even when
// handling sync siteswaps. I should find a better name.
function getIdxMin(siteswap, idx, is_sync) {
  let len = siteswap[idx].length;
  let ret = siteswap[idx][len - 1];
  if (is_sync && (ret % 2 === 1)) {
    if (idx % 2 === 0) {
      ret -= 1;
    } else {
      ret += 1
    }
  }
  return ret;
}

// Note, it's OK if either index is out of range. That just means we're swapping
// sites in copies of the siteswap that are implied to come before/after
// min_index is expected be larger than swap_index but to land earlier.
// TODO(jmerm): rename args for clarity.
function swapSites(siteswap, min_idx, swap_idx) {
  let min_landing = min_idx + getIdxMin(siteswap, pmod(min_idx, siteswap.length), false);
  let swap_landing = swap_idx + getIdxMax(siteswap, pmod(swap_idx, siteswap.length), false);

  siteswap[pmod(min_idx, siteswap.length)].pop();
  siteswap[pmod(min_idx, siteswap.length)].push(swap_landing - min_idx);
  siteswap[pmod(swap_idx, siteswap.length)][0] = min_landing - swap_idx;

  // preserve descending sort so it's easy to find maxes going forward.
  siteswap[pmod(min_idx, siteswap.length)].sort(function(a, b){return b-a;});
  siteswap[pmod(swap_idx, siteswap.length)].sort(function(a, b){return b-a;});
}

// returns the index with the highest throw. In the case of a tie, one of the
// max indices is returned;
function getMaxIdx(siteswap, is_sync) {
  let max_idx = 0;
  for (let i = 0; i < siteswap.length; i++) {
    if (getIdxMax(siteswap, i, is_sync) > getIdxMax(siteswap, max_idx, is_sync)) {
      max_idx = i;
    }
  }
  return max_idx;
}

function getMinIdx(siteswap, is_sync) {
  let min_idx = 0;
  for (let i = 0; i < siteswap.length; i++) {
    if (getIdxMin(siteswap, i, is_sync) < getIdxMin(siteswap, min_idx, is_sync)) {
      min_idx = i;
    }
  }
  return min_idx;
}

// Note, might be out of bounds but that's actually fine. That means we picked
// an index in another copy of the siteswap that's implied to come after this
// one
function getSwapIdxForMax(siteswap, max_idx) {
  let lands_in = getIdxMax(siteswap, max_idx, false) - 1;
  let swap_idx = max_idx + 1;
  while (lands_in > 0) {
    if (getIdxMin(siteswap, pmod(swap_idx, siteswap.length), false) < lands_in) {
      return swap_idx;
    }

    swap_idx += 1;
    lands_in -= 1
  }

  return "failed";
}

// Note, might be out of bounds but that's actually fine. That means we picked
// an index in another copy of the siteswap that's implied to come before this
// one
function getSwapIdxForMin(siteswap, min_idx) {
  let lands_in = getIdxMin(siteswap, min_idx, false) + 1;
  let swap_idx = min_idx - 1;
  while (lands_in < 1000) {  // TODO(jmerm): better condition? looped back to self?
    if (getIdxMax(siteswap, pmod(swap_idx, siteswap.length), false) > lands_in) {
      return swap_idx;
    }

    swap_idx -= 1;
    lands_in += 1
  }

  return "failed";
}

function applyMax(siteswap, max, is_sync) {
  let max_idx = getMaxIdx(siteswap, is_sync);
  let swaps = 0;
  while (getIdxMax(siteswap, max_idx, is_sync) > max) {
    let swap_idx = getSwapIdxForMax(siteswap, max_idx);
    if (swap_idx == "failed") {
      console.log("Failed to get swap index for max, ", max_idx, JSON.stringify(siteswap));
      return;
    }
    swapSites(siteswap, swap_idx, max_idx);
    max_idx = getMaxIdx(siteswap, is_sync);
    swaps += 1;
    if (swaps > give_up_threshhold) {
      console.log("Failed to apply max after " + give_up_threshhold + " swaps");
      return;
    }
  }
}

function maxConstraintSatisfied(siteswap, max, is_sync) {
  return getIdxMax(siteswap, getMaxIdx(siteswap, is_sync), is_sync) <= max;
}

function applyMin(siteswap, min, is_sync) {
  let min_idx = getMinIdx(siteswap, is_sync);
  let swaps = 0;
  while (getIdxMin(siteswap, min_idx, is_sync) < min) {
    let swap_idx = getSwapIdxForMin(siteswap, min_idx);
    if (swap_idx == "failed") {
      console.log("Failed to get swap index for min ", min_idx, JSON.stringify(siteswap));
      return;
    }
    swapSites(siteswap, min_idx, swap_idx);
    min_idx = getMinIdx(siteswap, is_sync);
    swaps += 1;
    if (swaps > give_up_threshhold) {
      console.log("Failed to apply min after " + give_up_threshhold + " swaps");
      return;
    }
  }
}

function minConstraintSatisfied(siteswap, min, is_sync) {
  return getIdxMin(siteswap, getMinIdx(siteswap, is_sync), is_sync) >= min;
}
