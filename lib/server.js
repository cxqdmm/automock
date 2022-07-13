const {
  getProperty,
  writeFile,
  getFilename,
  setApiListUpdated,
  getRule,
  isJsonReq,
  setProperty,
} = require("./utils");
const qs = require("qs");
module.exports = (server, { storage }) => {
  server.on("request", (req, res) => {
    const { originalReq, method } = req;
    let { headers, ruleValue, url, pattern } = originalReq;
    const filename = getFilename(originalReq);
    const rule = getRule(originalReq);
    // 只处理接口请求
    if (isJsonReq(headers)) {
      try {
        // 获取请求信息
        let str = "";
        req.on("data", (chunk) => {
          str += chunk;
        });
        req.on("end", () => {
          setProperty(storage, filename, { payload: str });
        });
        setProperty(storage, filename, {
          query: qs.parse(new URL(url).searchParams.toString()),
        });
        /**
         * 查看文件的状态
         * 1、文件是否勾选中了mock
         */
        const { mock } = getProperty(storage, filename) || {};
        if (mock) {
          req.passThrough();
        } else {
          // 命中插件规则，没有勾选mock的缓存最新的接口数据
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
                  writeFile({
                    storage,
                    filename,
                    properties: {
                      date: Date.now(),
                      method,
                      rule,
                      status: svrRes.statusCode,
                      pattern,
                      mock: false,
                      ruleValue: ruleValue || "pathname",
                      url,
                    },
                    body,
                    encoding,
                  });
                  setApiListUpdated(storage, true);
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
    } else {
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
