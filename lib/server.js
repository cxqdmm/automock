const { getProperty, writeFile } = require("./utils");

module.exports = (server, { storage }) => {
  server.on("request", (req, res) => {
    const { url, originalReq } = req;
    const { ruleValue, pattern } = originalReq;
    // 文件名等于 url pattern
    const filename = pattern;
    try {
      /**
       * 查看文件的状态
       * 1、文件是否勾选中了mock
       */
      const { mock } = getProperty(storage, filename) || {};
      const isExist = storage.existsFile(filename);
      if (mock && isExist) {
        console.log("mock数据", filename);
        const content = storage.readFile(filename);
        const { data } = JSON.parse(content);
        res.end(data);
      } else {
        console.log("写数据", filename);
        // 不需要mock的先缓存接口数据
        const client = req.request((svrRes) => {
          const encoding = svrRes.headers["content-encoding"];
          let body;
          svrRes.on("data", (data) => {
            body = body ? Buffer.concat([body, data]) : data;
          });
          svrRes.on("end", () => {
            const originalBody = body;
            if (body) {
              try {
                writeFile(storage, filename, body, encoding);
              } catch (error) {}
            }
            res.end(originalBody);
          });
        });
        req.pipe(client);
      }
    } catch (error) {
      req.passThrough();
    }
  });

  // handle websocket request
  server.on("upgrade", (req, socket) => {
    // do something
    req.passThrough();
  });

  // handle tunnel request
  server.on("connect", (req, socket) => {
    // do something
    req.passThrough();
  });
};

// 文件存储目录
// console.log("存储目录", storage._files);

// 获取文件列表
// const fileList = storage.getFileList();

// 存储 key-value
// storage.setProperty(key, value);

// 获取key值
// const value = storage.getProperty(key);

// 删除 key
// storage.removeProperty(key);

// 大块数据保存到文件里面
// storage.writeFile(filename, content);

// 读取文件
// const content = storage.readFile(filename);

// 删除文件
// storage.removeFile(filename, content);

// 判断文件是否存在
// storage.existsFile(filename);
