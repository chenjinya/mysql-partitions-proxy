let memery = {
  max: null,
}
module.exports = {
  memery: (category = '') => {
    const m = process.memoryUsage();
    console.log("[memery]", category,
      "rss", (m.rss / 1024 / 1024).toFixed(2) + "MB", "heapTotal", (m.heapTotal / 1024 / 1024).toFixed(2) + "MB", "heapUsed", (m.heapUsed / 1024 / 1024).toFixed(2) + "MB"
    );
    if (!memery.max) {
      memery.max = m;
    }
    if (m.rss > memery.max.rss) {
      memery.max = m;
      console.log("[memery][max]", category,
        "rss", (m.rss / 1024 / 1024).toFixed(2) + "MB", "heapTotal", (m.heapTotal / 1024 / 1024).toFixed(2) + "MB", "heapUsed", (m.heapUsed / 1024 / 1024).toFixed(2) + "MB"
      );
    }
  }
}