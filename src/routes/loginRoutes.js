import express from 'express';
import {
    postLogin,
    postSignup,
    // postLogout,
} from '../controllers/loginController.js';


const router = express.Router();

router.post('/login', postLogin);
router.post('/signup', postSignup);
router.post('/logout', (req, res) => { });


export default router;