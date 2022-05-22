// For help see https://github.com/ZijianHe/koa-router#api-reference
const {
  getCachedApiList,
  updateFile,
  removeFile,
  setProperty,
  getProperty,
} = require("../utils");
module.exports = (router) => {
  router.get("/cgi-bin/api-list", (ctx) => {
    const { localStorage } = ctx.req;
    const { name } = ctx.query || {};
    const filters = [];
    if (name) {
      filters.push({ key: "name", value: name || "" });
    }
    const list = getCachedApiList(localStorage, filters);
    list.forEach((item) => {
      const props = getProperty(localStorage, item.name) || {};
      item.mock = props.mock || false;
    });
    ctx.body = list || {};
  });
  router.post("/cgi-bin/update-api-data", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, data } = ctx.request.body;

    updateFile(localStorage, name, data);
    ctx.body = { code: 200, msg: "更新成功" };
  });

  router.post("/cgi-bin/update-api-mock", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, mock } = ctx.request.body;
    setProperty(localStorage, name, { mock });
    ctx.body = { code: 200, msg: "更新成功" };
  });
  router.post("/cgi-bin/delete-api", (ctx) => {
    const { localStorage } = ctx.req;
    const { name } = ctx.request.body;
    removeFile(localStorage, name);
    ctx.body = { code: 200, msg: "删除成功" };
  });
};
