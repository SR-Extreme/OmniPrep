import { Router } from 'express';
import {
    forgotPasswordHandler,
    loginHandler,
    logoutHandler,
    refreshHandler,
    resendLoginOtpHandler,
    resendPasswordResetOtpHandler,
    resetPasswordHandler,
    signupHandler,
    verifyLoginOtpHandler,
    verifyPasswordResetOtpHandler,
} from './auth.controller.js';

const authRouter = Router();

authRouter.post('/signup', signupHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/login/verify-otp', verifyLoginOtpHandler);
authRouter.post('/login/resend-otp', resendLoginOtpHandler);

authRouter.post('/forgot-password', forgotPasswordHandler);
authRouter.post('/forgot-password/verify-otp', verifyPasswordResetOtpHandler);
authRouter.post('/forgot-password/resend-otp', resendPasswordResetOtpHandler);
authRouter.post('/forgot-password/reset', resetPasswordHandler);

authRouter.post('/refresh', refreshHandler);
authRouter.post('/logout', logoutHandler);

export default authRouter;