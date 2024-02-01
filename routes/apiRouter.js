const express = require("express");
const authRouter = require("./auth");
const techniciansRouter = require("./technicians");
const projectsRouter = require("./projects");
const clientsRouter = require("./clients");
const emailsRouter = require("./emails");

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/technicians", techniciansRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/clients", clientsRouter);
apiRouter.use("/emails", emailsRouter);

module.exports = apiRouter;
