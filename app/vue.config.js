const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: "../public",
  configureWebpack: (config) => {
    if (process.env.BUILD_MODE === "dev") {
      return {
        devtool: "source-map",
      };
    } else {
      delete config.devtool;
    }
  },
});
