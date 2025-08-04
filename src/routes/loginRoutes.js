import express from 'express';
import {
    postLogin,
    postSignup,
    postForgotPassword,
    postResetPassword
} from '../controllers/loginController.js';


const router = express.Router();

router.post('/login', postLogin);
router.post('/signup', postSignup);
// router.post('/logout', (req, res) => { });
router.post('/forgotPassword', postForgotPassword);
router.patch('/resetPassword/:token', postResetPassword);

export default router;