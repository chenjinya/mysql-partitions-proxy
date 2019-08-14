let verbose = false;
let cache = {};

module.exports = {
  cacheKeys: function () {
    let keys = Object.keys(cache);
    return keys;
  },
  getCache: function (k) {
    return cache[k]
  },
  setCache: function (k, v) {
    cache[k] = v;
  },
  delCache: function (k) {
    cache[k] = null;
    delete cache[k]
  },
  setVerbose: function (b) {
    verbose = b
  },
  verbose: () => verbose,

}