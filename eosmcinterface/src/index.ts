import express from "express";
import bodyParser from "body-parser";
import errorhandler from "errorhandler";
import "./util/logger";

import * as accountController from "./controllers/account";
import * as depositController from "./controllers/deposit";
import * as withdrawController from "./controllers/withdraw";

const initializeServer = () => {
  const app = express();

  app.set("port", process.env.PORT || 3000);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(errorhandler());

  return app;
};

const setRoutes = app => {
  app.get("/", (_, res) => res.send("EOS Minecraft Interface"));
  app.get("/account", accountController.getInfo);
  app.post("/deposit", depositController.postDeposit);
  app.post("/withdraw", withdrawController.postWithdraw);
};

const serve = app => {
  app.listen(app.get("port"), () => {
    console.info(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.info("  Press CTRL-C to stop\n");
  });
};

const app = initializeServer();
setRoutes(app);
serve(app);
