let verbose = false;

module.exports = {
  setVerbose: function (b) {
    verbose = b
  },
  verbose: () => verbose,
  memery: (category = '') => {
    const m = process.memoryUsage();
    console.log("[memery]", category,
      "rss", (m.rss / 1024 / 1024).toFixed(2) + "MB", "heapTotal", (m.heapTotal / 1024 / 1024).toFixed(2) + "MB", "heapUsed", (m.heapUsed / 1024 / 1024).toFixed(2) + "MB"
    );
  }
}