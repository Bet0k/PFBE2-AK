import {
    Router
} from "express";
import passport from 'passport';
import {
    getUsers,
    createUser,
    loginUser,
    getProfile,
    getCurrentUser
} from "../controllers/user.controller.js";

const router = Router()

router.get('/', getUsers);

router.post('/register', createUser);

router.post('/login', loginUser);

router.get("/profile", passport.authenticate("jwt", {
    session: false
}), getProfile);

router.get("/current", getCurrentUser);

// router.get('/auth/google', passport.authenticate('google', {scope: [ "email", "profile" ] }));

// router.get('/auth/google/callback', 
//     passport.authenticate('google', {
//         successRedirect: '/profile',
//     })
// );

export default router;