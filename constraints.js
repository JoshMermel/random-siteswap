// big questions
//  - sync, enforcing max so it works when odd numbers are modified for
//      printing.

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

// note, it's OK if swap_ids is out of range
function swapSitesMax(siteswap, max_idx, swap_ids) {
  let landing1 = max_idx + getIdxMax(siteswap, idx);
  let landing2 = swap_ids + getIdxMax(siteswap, pmod(swap_ids, siteswap.length));

  siteswap[max_idx][0] = landing2 - max_idx;
  siteswap[pmod(swap_ids, siteswap.length)][0] = landing1 - swap_ids;

  // preserve descending sort so it's easy to find maxes going forward.
  siteswap[max_idx].sort(function(a, b){return b-a;});
  siteswap[pmod(swap_ids, siteswap.length)].sort(function(a, b){return b-a;});
}

// note, it's OK if swap_idx is out of range
function swapSitesMin(siteswap, min_idx, swap_idx) {
  let landing1 = min_idx + getIdxMin(siteswap, min_idx);
  let landing2 = swap_idx + getIdxMax(siteswap, pmod(swap_idx, siteswap.length));

  siteswap[min_idx][siteswap[min_idx].length - 1] = landing2 - min_idx;
  siteswap[pmod(swap_idx, siteswap.length)][0] = landing1 - swap_idx;

  // preserve descending sort so it's easy to find maxes going forward.
  siteswap[min_idx].sort(function(a, b){return b-a;});
  siteswap[pmod(swap_idx, siteswap.length)].sort(function(a, b){return b-a;});
}

// returns the index with the highest throw. In the case of a tie, one of the
// max indices is returned;
function getMaxIndex(siteswap) {
  let max_idx = 0;
  for (let i = 0; i < siteswap.length; i++) {
    if (getIdxMax(siteswap, 0) > getIdxMax(siteswap, max_idx)) {
      max_idx = i;
    }
  }
  return max_idx;
}

function getMinIndex(siteswap) {
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
function getSwapIndexForMax(siteswap, max_idx) {
  let lands_in = getIdxMax(siteswap, max_idx);
  let swap_idx = max_idx;
  while (lands_in > 0) {
    if (getIdxMax(siteswap, pmod(swap_idx, siteswap.length)) < lands_in) {
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
function getSwapIndexForMin(siteswap, min_idx) {
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
  let max_idx = getMaxIndex(siteswap);
  let swaps = 0;
  while (getIdxMax(siteswap, max_idx) > max) {
    let swap_idx = getSwapIndexForMax(siteswap, max_idx);
    if (swap_idx == "failed") {
      console.log("Failed to get swap index for max, ", max_idx, JSON.stringify(siteswap));
      return;
    }
    swapSitesMax(siteswap, max_idx, swap_idx);
    max_idx = getMaxIndex(siteswap);
    swaps += 1;
    if (swaps > 1000) {
      console.log("Failed to apply max after one thousand swaps :(");
      return;
    }
  }
}

function applyMin(siteswap, min) {
  let min_idx = getMinIndex(siteswap);
  let swaps = 0;
  while (getIdxMin(siteswap, min_idx) < min) {
    let swap_idx = getSwapIndexForMin(siteswap, min_idx);
    if (swap_idx == "failed") {
      console.log("Failed to get swap index for min ", min_idx, JSON.stringify(siteswap));
      return;
    }
    swapSitesMin(siteswap, min_idx, swap_idx);
    min_idx = getMinIndex(siteswap);
    swaps += 1;
    if (swaps > 1000) {
      console.log("Failed to apply min after one thousand swaps :(");
      return;
    }
  }
}

let siteswap = [[7,5], [2], [1]];
applyMin(siteswap, 2)
console.log(siteswap);
