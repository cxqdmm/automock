const Koa = require("koa");
const {
  getProperty,
  readFile,
  getFilename,
  setProperty,
  removeProperty,
  setApiListUpdated,
  getRule,
} = require("./utils");

module.exports = (server, { storage }) => {
  const app = new Koa();
  app.use(async (ctx) => {
    const { req } = ctx;
    const { originalReq } = req;
    const { pattern } = originalReq;
    const rule = getRule(originalReq);
    const filename = getFilename(originalReq);
    // 如果勾选了mock，则设置动态rule
    const { mock } = getProperty(storage, filename) || {};
    if (mock) {
      const content = readFile(storage, filename);
      if (content) {
        if (!ctx.body) {
          ctx.response.status = 402;
          const rule = [
            `${filename} resBody://{${filename}}`,
            `${filename} statusCode://200`,
          ];
          const value = { [filename]: content };
          ctx.body = {
            rules: `${rule}`,
            values: value,
          };
        }
        setProperty(storage, filename, {
          rule,
          pattern,
          status: 200,
          mockTime: Date.now(),
        });
        setApiListUpdated(storage, true);
      } else {
        // 当文件找不到时，移除property
        removeProperty(storage, filename);
      }
    }
  });
  server.on("request", app.callback());
};
