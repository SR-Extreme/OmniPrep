import { Router } from "express";
import {
    createSubmissionHandler,
    getSubmissionHandler,
    listMySubmissionHandler,
} from "./submissions.controller.js";

const submissionsRouter = Router();

submissionsRouter.post("/", createSubmissionHandler);
submissionsRouter.get("/me", listMySubmissionHandler);
submissionsRouter.get("/:id", getSubmissionHandler);

export default submissionsRouter;