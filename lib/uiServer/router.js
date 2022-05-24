// For help see https://github.com/ZijianHe/koa-router#api-reference
const {
  getCachedApiList,
  updateFile,
  removeFile,
  readFile,
  setProperty,
  getProperty,
  removeProperty,
  getApiListUpdated,
  setApiListUpdated,
} = require("../utils");
module.exports = (router) => {
  // api 列表接口
  router.post("/cgi-bin/api-list", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, pattern } = ctx.request.body;
    const filters = [];
    name && filters.push({ key: "name", value: (name || "").trim() });
    pattern && filters.push({ key: "pattern", value: (pattern || "").trim() });
    const list = getCachedApiList(localStorage, filters);
    list.forEach((item) => {
      const props = getProperty(localStorage, item.name) || {};
      item.mock = props.mock || false;
      item.mockTime = props.mockTime || "";
    });
    setApiListUpdated(localStorage, false);
    ctx.body = { code: 200, data: list || [] };
  });

  // 检测接口是否更新
  router.get("/cgi-bin/check-api-list", (ctx) => {
    const { localStorage } = ctx.req;
    const updated = getApiListUpdated(localStorage);
    ctx.body = { code: 200, data: updated };
  });

  // 更新接口数据
  router.post("/cgi-bin/update-api-data", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, data } = ctx.request.body;

    updateFile(localStorage, name, data);
    const file = readFile(localStorage, name);
    const props = getProperty(localStorage, name) || {};
    const mock = props.mock || false;
    const mockTime = props.mockTime || "";
    ctx.body = {
      code: 200,
      data: {
        mock,
        mockTime,
        name,
        data: file,
      },
    };
  });

  // 修改接口mock开关
  router.post("/cgi-bin/update-api-mock", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, mock } = ctx.request.body;
    setProperty(localStorage, name, { mock });
    ctx.body = { code: 200, msg: "更新成功" };
  });

  // 删除接口数据
  router.post("/cgi-bin/delete-api", (ctx) => {
    const { localStorage } = ctx.req;
    const { name } = ctx.request.body;
    removeFile(localStorage, name);
    removeProperty(localStorage, name);
    ctx.body = { code: 200, msg: "删除成功" };
  });

  // 清空所有接口
  router.post("/cgi-bin/delete-all-api", (ctx) => {
    const { localStorage } = ctx.req;
    const list = localStorage.getFileList() || [];
    list
      .map((item) => item.name)
      .forEach((name) => {
        removeFile(localStorage, name);
        removeProperty(localStorage, name);
      });

    ctx.body = { code: 200, msg: "删除成功" };
  });
};
