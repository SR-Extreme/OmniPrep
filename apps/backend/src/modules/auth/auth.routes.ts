import { Router } from "express";
import { loginHandler, signupHandler, logoutHandler, refreshHandler } from "./auth.controller.js";

const authRouter = Router();

authRouter.post('/signup', signupHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/refresh', refreshHandler);
authRouter.post('/logout', logoutHandler);

export default authRouter;