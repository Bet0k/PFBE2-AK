import express from "express";
import { engine } from "express-handlebars";
import path from "path";
const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register");
})

router.get("/", (req, res) => {
    res.render("login");
});

router.get("/profile", (req, res) => {
    res.render("profile")
})

export default router;
