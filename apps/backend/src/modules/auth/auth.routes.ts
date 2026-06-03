import { Router } from "express";
import { loginHandler, registerHandler, logoutHandler, refreshHandler } from "./auth.controller.js";

const authRouter = Router();

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/refresh', refreshHandler);
authRouter.post('/logout', logoutHandler);

export default authRouter;