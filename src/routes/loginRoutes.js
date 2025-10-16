import express from 'express';
import {
  postLogin,
  postSignup,
  postForgotPassword,
  ResetPassword,
  patchPassword,
  postLogout,
  refreshToken
} from "../controllers/loginController.js";
import { authMiddleware, restrictTo } from "../middleware/auth.js";
import { validate } from '../middleware/validate.js';
import * as userSchema from '../models/userSchema.js';

const router = express.Router();

router.post('/login', validate(userSchema.userLoginSchema), postLogin);
router.post('/register', validate(userSchema.userSignUpSchema), postSignup);
router.post('/logout', authMiddleware, postLogout);

router.get("/refresh", refreshToken);

router.post('/forgotPassword', validate(userSchema.userForgotPasswordSchema), postForgotPassword);
router.patch('/resetPassword/:token', ResetPassword);
router.patch('/changePassword', authMiddleware, patchPassword); // This one is for changing the password of the logged-in user, without forgetting the password


export default router;