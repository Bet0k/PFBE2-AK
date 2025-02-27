import {
    Router
} from "express";
import passport from "passport";
import {
    getBusiness,
    getBusinessById,
    createBusiness,
    addProduct
} from "../controllers/business.controller.js";
import {
    checkAdminRole
} from "../utils/index.js"

const router = Router();

router.get("/", getBusiness);

router.get("/:bid", getBusinessById);

router.post("/", passport.authenticate('jwt', {
    session: false
}), checkAdminRole, createBusiness);

router.post("/:bid/product", passport.authenticate('jwt', {
    session: false
}), checkAdminRole, addProduct);

export default router;