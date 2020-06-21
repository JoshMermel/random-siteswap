// big questions
//  - sync, enforcing max so it works when odd numbers are modified for
//      printing.
//  - when getting swap idx for max, should we be looking at the min or the max
//    of the swap idx?

var give_up_threshhold = 100;

// return n%m but negatives mod to positives
function pmod(n, m) {
  return ((n % m) + m) % m
}

function getIdxMax(siteswap, idx, is_sync) {
  // TODO(jmerm): respect is_sync.
  return siteswap[idx][0];
}

function getIdxMin(siteswap, idx, is_sync) {
  // TODO(jmerm): respect is_sync.
  let len = siteswap[idx].length;
  return siteswap[idx][len - 1];
}

function swapSitesMax(siteswap, max_idx, swap_idx) {
  swapSitesMin(siteswap, swap_idx, max_idx);
}

// Note, it's OK if either index is out of range.
function swapSitesMin(siteswap, min_idx, swap_idx) {
  let min_landing = min_idx + getIdxMin(siteswap, pmod(min_idx, siteswap.length));
  let swap_landing = swap_idx + getIdxMax(siteswap, pmod(swap_idx, siteswap.length));

  siteswap[pmod(min_idx, siteswap.length)].pop();
  siteswap[pmod(min_idx, siteswap.length)].push(swap_landing - min_idx);
  siteswap[pmod(swap_idx, siteswap.length)][0] = min_landing - swap_idx;

  // preserve descending sort so it's easy to find maxes going forward.
  siteswap[pmod(min_idx, siteswap.length)].sort(function(a, b){return b-a;});
  siteswap[pmod(swap_idx, siteswap.length)].sort(function(a, b){return b-a;});
}

// returns the index with the highest throw. In the case of a tie, one of the
// max indices is returned;
function getMaxIdx(siteswap) {
  let max_idx = 0;
  for (let i = 0; i < siteswap.length; i++) {
    if (getIdxMax(siteswap, i) > getIdxMax(siteswap, max_idx)) {
      max_idx = i;
    }
  }
  return max_idx;
}

function getMinIdx(siteswap) {
  let min_idx = 0;
  for (let i = 0; i < siteswap.length; i++) {
    if (getIdxMin(siteswap, i) < getIdxMin(siteswap, min_idx)) {
      min_idx = i;
    }
  }
  return min_idx;
}

// Note, might be out of bounds but that's actually fine. That means we picked
// an index in another copy of the siteswap that's implied to come after this
// one
function getSwapIdxForMax(siteswap, max_idx) {
  let lands_in = getIdxMax(siteswap, max_idx) - 1;
  let swap_idx = max_idx + 1;
  while (lands_in > 0) {
    if (getIdxMin(siteswap, pmod(swap_idx, siteswap.length)) < lands_in) {
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
  let lands_in = getIdxMin(siteswap, min_idx) + 1;
  let swap_idx = min_idx - 1;
  while (lands_in < 1000) {  // need better condition? looped back to self?
    if (getIdxMax(siteswap, pmod(swap_idx, siteswap.length)) > lands_in) {
      return swap_idx;
    }

    swap_idx -= 1;
    lands_in += 1
  }

  return "failed";
}

function applyMax(siteswap, max) {
  let max_idx = getMaxIdx(siteswap);
  let swaps = 0;
  while (getIdxMax(siteswap, max_idx) > max) {
    let swap_idx = getSwapIdxForMax(siteswap, max_idx);
    if (swap_idx == "failed") {
      console.log("Failed to get swap index for max, ", max_idx, JSON.stringify(siteswap));
      return;
    }
    swapSitesMax(siteswap, max_idx, swap_idx);
    max_idx = getMaxIdx(siteswap);
    swaps += 1;
    if (swaps > give_up_threshhold) {
      console.log("Failed to apply max after " + give_up_threshhold + " swaps");
      return;
    }
  }
}

function maxConstraintSatisfied(siteswap, max) {
  return getIdxMax(siteswap, getMaxIdx(siteswap)) <= max;
}

function applyMin(siteswap, min) {
  let min_idx = getMinIdx(siteswap);
  let swaps = 0;
  while (getIdxMin(siteswap, min_idx) < min) {
    let swap_idx = getSwapIdxForMin(siteswap, min_idx);
    if (swap_idx == "failed") {
      console.log("Failed to get swap index for min ", min_idx, JSON.stringify(siteswap));
      return;
    }
    swapSitesMin(siteswap, min_idx, swap_idx);
    min_idx = getMinIdx(siteswap);
    swaps += 1;
    if (swaps > give_up_threshhold) {
      console.log("Failed to apply min after " + give_up_threshhold + " swaps");
      return;
    }
  }
}

function minConstraintSatisfied(siteswap, min) {
  return getIdxMin(siteswap, getMinIdx(siteswap)) >= min;
}

// let siteswap = [[5,3],[3],[6,5],[3],[5],[5],[3],[3],[3],[5,3],[6,3],[4],[3],[4],[3]];
// applyMin(siteswap, 4)
// console.log(siteswap);
