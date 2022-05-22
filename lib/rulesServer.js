const Koa = require("koa");
const { getProperty, readFile } = require("./utils");

module.exports = (server, { storage }) => {
  const app = new Koa();
  app.use(async (ctx) => {
    const { req } = ctx;
    const { url, originalReq } = req;
    const { pattern } = originalReq;
    console.log("----rulesServer---");
    console.log("url:", url);

    const filename = pattern;
    // 如果勾选了mock，则设置动态rule
    const { mock } = getProperty(storage, filename) || {};
    if (mock) {
      const content = readFile(storage, filename);
      const { data } = JSON.parse(content);
      if (!ctx.body) {
        const rule = [`${filename} resBody://{${pattern}}`];
        const value = { [pattern]: data };
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
