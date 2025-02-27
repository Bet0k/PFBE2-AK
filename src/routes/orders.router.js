import {
    Router
} from "express";
import passport from "passport";
import {
    getOrders,
    getOrderById,
    createOrder,
    resolveOrder
} from "../controllers/orders.controller.js";
import {
    checkAdminRole,
    checkAdminOrOwner
} from "../utils/index.js";

const router = Router();

router.get("/", passport.authenticate('jwt', {
    session: false
}), checkAdminRole, getOrders);

router.get("/:oid", passport.authenticate('jwt', {
    session: false
}), checkAdminOrOwner, getOrderById);

router.post("/", passport.authenticate('jwt', {
    session: false
}), createOrder);

router.put("/:oid/resolve",
    passport.authenticate('jwt', {
        session: false
    }),
    checkAdminOrOwner,
    resolveOrder);

export default router;