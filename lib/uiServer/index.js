const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const onerror = require("koa-onerror");
const serve = require("koa-static");
const path = require("path");
const router = require("koa-router")();
const setupRouter = require("./router");
const cors = require("koa2-cors");
const MAX_AGE = 1000 * 60 * 5;

module.exports = (server, options) => {
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  onerror(app);
  setupRouter(router, options);
  app.use(
    cors({
      origin: "*",
      maxAge: 10,
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(serve(path.join(__dirname, "../../public"), { maxage: MAX_AGE }));
  server.on("request", app.callback());
};
