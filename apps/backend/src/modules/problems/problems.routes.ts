import { Router } from "express";
import { getProblemHandler, listProblemsHandler } from "./problems.controller.js";

const problemsRouter = Router();

problemsRouter.get("/", listProblemsHandler);
problemsRouter.get("/:idOrSlug", getProblemHandler);

export default problemsRouter;