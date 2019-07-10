let verbose = false;

module.exports = {
  setVerbose: function (b) {
    verbose = b
  },
  verbose: () => verbose,
}