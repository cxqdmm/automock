const Koa = require("koa");
const {
  getProperty,
  readFile,
  getFilename,
  setProperty,
  removeProperty,
} = require("./utils");

module.exports = (server, { storage }) => {
  const app = new Koa();
  app.use(async (ctx) => {
    const { req } = ctx;
    const { originalReq } = req;
    const { url } = originalReq;
    const filename = getFilename(url);
    // 如果勾选了mock，则设置动态rule
    const { mock } = getProperty(storage, filename) || {};
    if (mock) {
      const content = readFile(storage, filename);
      if (content) {
        const { data } = JSON.parse(content);
        if (!ctx.body) {
          const rule = [`${filename} resBody://{${filename}}`];
          const value = { [filename]: data };
          ctx.body = {
            rules: `${rule}`,
            values: value,
          };
        }
        setProperty(storage, filename, { mockTime: Date.now() });
      } else {
        // 当文件找不到时，移除property
        removeProperty(storage, filename);
      }
    }
  });
  server.on("request", app.callback());
};
