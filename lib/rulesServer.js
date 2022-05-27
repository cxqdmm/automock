const Koa = require("koa");
const {
  getProperty,
  readFile,
  getFilename,
  setProperty,
  removeProperty,
  setApiListUpdated,
} = require("./utils");

module.exports = (server, { storage }) => {
  const app = new Koa();
  app.use(async (ctx) => {
    const { req } = ctx;
    const { originalReq } = req;
    const { pattern } = originalReq;
    const filename = getFilename(originalReq);
    // 如果勾选了mock，则设置动态rule
    const { mock } = getProperty(storage, filename) || {};
    if (mock) {
      const content = readFile(storage, filename);
      if (content) {
        if (!ctx.body) {
          const rule = [`${filename} resBody://{${filename}}`];
          const value = { [filename]: content };
          ctx.body = {
            rules: `${rule}`,
            values: value,
          };
        }
        setProperty(storage, filename, { pattern, mockTime: Date.now() });
        setApiListUpdated(storage, true);
      } else {
        // 当文件找不到时，移除property
        removeProperty(storage, filename);
      }
    }
  });
  server.on("request", app.callback());
};
