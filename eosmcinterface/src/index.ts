import express from "express";
import bodyParser from "body-parser";
import "./util/logger";

import * as accountController from "./controllers/account";
import * as depositController from "./controllers/deposit";
import * as withdrawController from "./controllers/withdraw";
import { getChainInfo, isRpcError } from "./util/eos";

const initializeServer = () => {
  const app = express();

  app.set("port", process.env.PORT || 3000);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json({ limit: "1mb" }));

  return app;
};

const setRoutes = app => {
  app.get("/", async (_, res) =>
    res.send({
      motd: "EOS Minecraft Interface",
      chainInfo: await getChainInfo()
    })
  );
  app.get("/account/:account", accountController.getInfo);
  app.get("/player/:account", accountController.getPlayerInfo);
  app.post("/player/:account/confirm", accountController.postConfirmPlayer);
  app.post("/deposit", depositController.postDeposit);
  app.post("/withdraw", withdrawController.postWithdraw);
};

const setErrorHandler = app => {
  app.use((err, _req, res, _next) => {
    console.error("!!! ERROR:\n", err.stack);

    const rpcError = isRpcError(err) && err.json.error;
    const message = rpcError ? "Chain RPC Error" : err.message;
    const errorObj = {
      error: message,
      timestamp: new Date()
    };

    const details = rpcError || err.details;
    const response = details ? { ...errorObj, details } : errorObj;

    res.status(500).send(response);
  });
};

const serve = app => {
  app.listen(app.get("port"), () => {
    console.info(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.info("Press CTRL-C to stop\n");
  });
};

const app = initializeServer();
setRoutes(app);
setErrorHandler(app);
serve(app);
