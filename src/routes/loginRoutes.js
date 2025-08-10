import express from 'express';
import {
  postLogin,
  postSignup,
  postForgotPassword,
  ResetPassword,
  patchPassword,
} from "../controllers/loginController.js";
import { authMiddleware, restrictTo } from "../middleware/auth.js"; // Could be moved later to user, admin and receptionist routes


const router = express.Router();

router.post('/login', postLogin);
router.post('/register', postSignup);
// router.post('/logout', (req, res) => { });
router.post('/forgotPassword', postForgotPassword);
router.patch('/resetPassword/:token', ResetPassword);
router.patch('/changePassword', authMiddleware, restrictTo("user", "admin", "receptionist"), patchPassword); // This one is for changing the password of the logged-in user, without forgetting the password

export default router;