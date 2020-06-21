// big questions
//  - sync, enforcing max so it works when odd numbers are modified for
//      printing.

// return n%m but negatives mod to positives
function pmod(n, m) {
  return ((n % m) + m) % m
}

// note, it's OK if idx2 is out of range
function swapSitesMax(siteswap, idx1, idx2) {
  let landing1 = idx1 + siteswap[idx1][0];
  let landing2 = idx2 + siteswap[pmod(idx2, siteswap.length)][0];

  siteswap[idx1][0] = landing2 - idx1;
  siteswap[pmod(idx2, siteswap.length)][0] = landing1 - idx2;

  // preserve descending sort so it's easy to find maxes going forward.
  siteswap[idx1].sort(function(a, b){return b-a;});
  siteswap[pmod(idx2, siteswap.length)].sort(function(a, b){return b-a;});
}

// note, it's OK if idx2 is out of range
function swapSitesMin(siteswap, idx1, idx2) {
  let landing1 = idx1 + siteswap[idx1][siteswap[idx1].length - 1];
  let landing2 = idx2 + siteswap[pmod(idx2, siteswap.length)][0];

  siteswap[idx1][siteswap[idx1].length - 1] = landing2 - idx1;
  siteswap[pmod(idx2, siteswap.length)][0] = landing1 - idx2;

  // preserve descending sort so it's easy to find maxes going forward.
  siteswap[idx1].sort(function(a, b){return b-a;});
  siteswap[pmod(idx2, siteswap.length)].sort(function(a, b){return b-a;});
}

// returns the index with the highest throw. In the case of a tie, one of the
// max indices is returned;
function getMaxIndex(siteswap) {
  let max_idx = 0;
  for (let i = 0; i < siteswap.length; i++) {
    if (siteswap[i][0] > siteswap[max_idx][0]) {
      max_idx = i;
    }
  }
  return max_idx;
}

function getMinIndex(siteswap) {
  let min_idx = 0;
  for (let i = 0; i < siteswap.length; i++) {
    if (siteswap[i][siteswap[i].length-1] < siteswap[min_idx][siteswap[min_idx].length-1]) {
      min_idx = i;
    }
  }
  return min_idx;
}

// Note, might be out of bounds but that's actually fine. That means we picked
// an index in another copy of the siteswap that's implied to come after this
// one
function getSwapIndexForMax(siteswap, max_idx) {
  let lands_in = siteswap[max_idx][0];
  let swap_idx = max_idx;
  while (lands_in > 0) {
    if (siteswap[pmod(swap_idx, siteswap.length)][0] < lands_in) {
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
  let lands_in = siteswap[min_idx][siteswap[min_idx].length-1] + 1;
  let swap_idx = min_idx - 1;
  while (lands_in < 1000) {  // need better condition?
    if (siteswap[pmod(swap_idx, siteswap.length)][0] > lands_in) {
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
  while (siteswap[max_idx][0] > max) {
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
  while (siteswap[min_idx][siteswap[min_idx].length - 1] < min) {
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
