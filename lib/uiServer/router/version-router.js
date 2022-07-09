const {
  addNewVersion,
  updateVersionContent,
  deleteVersion,
  updateVersionName,
  getVersions,
  setProperty,
  getPropertyAttr,
  removePropertyAttr,
} = require("../../utils");
module.exports = (router) => {
  // 新增版本

  router.post("/cgi-bin/automock/add-new-version", (ctx) => {
    const { localStorage } = ctx.req;
    const { versionName, content = {}, name } = ctx.request.body;
    try {
      addNewVersion({
        storage: localStorage,
        filename: name,
        versionName,
        content,
      });
      ctx.body = {
        code: 200,
        msg: "success",
        data: {
          filename: versionName,
          content,
        },
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  });

  // 删除版本
  router.post("/cgi-bin/automock/delete-version", (ctx) => {
    const { localStorage } = ctx.req;
    const { versionName, name } = ctx.request.body;
    const mockVersion = getPropertyAttr(localStorage, name, "mockVersion");
    if (versionName === mockVersion) {
      removePropertyAttr(localStorage, name, "mockVersion");
    }
    try {
      deleteVersion({
        storage: localStorage,
        filename: name,
        versionName,
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
  // 更新版本内容
  router.post("/cgi-bin/automock/update-version-content", (ctx) => {
    const { localStorage } = ctx.req;
    const { versionName, content, name } = ctx.request.body;
    try {
      updateVersionContent({
        storage: localStorage,
        filename: name,
        versionName,
        content,
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

  // 更新版本内容
  router.post("/cgi-bin/automock/update-version-name", (ctx) => {
    const { localStorage } = ctx.req;
    const { versionName, name, newVersion } = ctx.request.body;
    try {
      updateVersionName({
        storage: localStorage,
        filename: name,
        versionName,
        newVersion,
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

  // 更新版本内容
  router.post("/cgi-bin/automock/get-versions", (ctx) => {
    const { localStorage } = ctx.req;
    const { name } = ctx.request.body;
    const list = getVersions({ storage: localStorage, filename: name }) || {};
    try {
      ctx.body = {
        code: 200,
        msg: "success",
        data: list,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  });
  // 设置mock的版本
  router.post("/cgi-bin/automock/set-mock-version", (ctx) => {
    const { localStorage } = ctx.req;
    const { name, versionName } = ctx.request.body;
    try {
      setProperty(localStorage, name, { mockVersion: versionName });
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
};
