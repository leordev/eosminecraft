import { initializeServer, setRoutes, setErrorHandler, serve } from "./server";

const app = initializeServer();
setRoutes(app);
setErrorHandler(app);
serve(app);
