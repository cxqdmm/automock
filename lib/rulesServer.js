const Koa = require("koa");
const { getProperty, readFile, getFilename } = require("./utils");

module.exports = (server, { storage }) => {
  const app = new Koa();
  app.use(async (ctx) => {
    const { req } = ctx;
    const { originalReq } = req;
    const { url, pattern } = originalReq;
    console.log("----rulesServer---");
    const filename = getFilename(url);
    // 如果勾选了mock，则设置动态rule
    const { mock } = getProperty(storage, filename) || {};
    if (mock) {
      const content = readFile(storage, filename);
      const { data } = JSON.parse(content);
      if (!ctx.body) {
        const rule = [`${filename} resBody://{${filename}}`];
        const value = { [filename]: data };
        ctx.body = {
          rules: `${rule}`,
          values: value,
        };
        console.log("ctx.body", ctx.body);
      }
    }
    console.log("----rulesServer---");
  });
  server.on("request", app.callback());
};
