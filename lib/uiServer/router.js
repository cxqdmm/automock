// For help see https://github.com/ZijianHe/koa-router#api-reference
const {
  getApiList,
  updateFile,
  removeFile,
  writeFile,
  readFile,
  setProperty,
  getProperty,
  getApiListUpdated,
  setApiListUpdated,
} = require("../utils");
const { execFilter } = require("./util");
module.exports = (router) => {
  // api 列表接口
  router.post("/cgi-bin/automock/api-list", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, rule, onlymock } = ctx.request.body;

    // 获取接口列表
    const list = getApiList(localStorage);
    list.forEach((item) => {
      const props = getProperty(localStorage, item.name) || {};
      delete item.data;
      Object.keys(props).forEach((key) => {
        item[key] = props[key];
      });
    });
    // 根据请求参数筛选
    const filters = [];
    name &&
      filters.push({
        key: "name",
        value: (name || "").trim(),
        method: "indexOf",
      });
    rule &&
      filters.push({
        key: "rule",
        value: (rule || "").trim(),
        method: "equal",
      });
    onlymock && filters.push({ key: "mock", value: true, method: "equal" });
    const filteredList = filters.reduce((result, filter) => {
      return execFilter(result, filter);
    }, list);

    setApiListUpdated(localStorage, false);
    ctx.body = { code: 200, data: filteredList || [] };
  });

  // 检测接口是否更新
  router.get("/cgi-bin/automock/check-api-list", (ctx) => {
    const { localStorage } = ctx.req;
    const updated = getApiListUpdated(localStorage);
    ctx.body = { code: 200, data: updated };
  });

  // 更新接口数据
  router.post("/cgi-bin/automock/update-api-data", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, data } = ctx.request.body;

    updateFile(localStorage, name, data);
    const file = readFile(localStorage, name);
    const props = getProperty(localStorage, name) || {};
    ctx.body = {
      code: 200,
      data: {
        ...props,
        name,
        data: file,
      },
    };
  });

  // 更新接口数据
  router.post("/cgi-bin/automock/get-api-data", (ctx) => {
    const { localStorage } = ctx.req;
    const { name } = ctx.request.body;

    const file = readFile(localStorage, name);
    const props = getProperty(localStorage, name) || {};
    ctx.body = {
      code: 200,
      data: {
        ...props,
        name,
        data: file,
      },
    };
  });
  // 新增mock接口
  router.post("/cgi-bin/automock/create-api-data", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, content, ruleValue } = ctx.request.body;
    try {
      writeFile({
        storage: localStorage,
        filename: name,
        body: content,
        properties: { ruleValue, mock: true },
      });
      ctx.body = {
        code: 200,
        msg: "success",
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  });

  // 修改接口mock开关
  router.post("/cgi-bin/automock/update-api-mock", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, mock } = ctx.request.body;
    setProperty(localStorage, name, { mock });
    ctx.body = { code: 200, msg: "更新成功" };
  });

  // 删除接口数据
  router.post("/cgi-bin/automock/delete-api", (ctx) => {
    const { localStorage } = ctx.req;
    const { name } = ctx.request.body;
    removeFile(localStorage, name);
    ctx.body = { code: 200, msg: "删除成功" };
  });

  // 批量删除接口
  router.post("/cgi-bin/automock/batch-delete-api", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, rule, onlymock } = ctx.request.body;
    // 获取接口列表
    const list = getApiList(localStorage);
    list.forEach((item) => {
      const props = getProperty(localStorage, item.name) || {};
      Object.keys(props).forEach((key) => {
        item[key] = props[key];
      });
    });
    // 根据请求参数筛选
    const filters = [];
    name &&
      filters.push({
        key: "name",
        value: (name || "").trim(),
        method: "indexOf",
      });
    rule &&
      filters.push({
        key: "rule",
        value: (rule || "").trim(),
        method: "equal",
      });
    filters.push({ key: "mock", value: !!onlymock, method: "equal" });

    const filteredList = filters.reduce((result, filter) => {
      return execFilter(result, filter);
    }, list);
    filteredList.forEach((item) => {
      removeFile(localStorage, item.name);
    });

    ctx.body = { code: 200, msg: "删除成功" };
  });
};
