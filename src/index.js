import express from "express";
import {
    engine
} from "express-handlebars";
import cookieParser from "cookie-parser";
import passport from "passport";
import dotenv from "dotenv";
import './passport/passport.config.js';
import connectDb from "./database/index.js";
import userRoutes from "./routes/users.routes.js";
import businessRoutes from "./routes/business.router.js";
import orderRoutes from "./routes/orders.router.js";
import viewRoutes from "./routes/views.routes.js";

dotenv.config();

// Configuración de variables de entorno
const PORT = process.env.PORT || 3000;
const SIGN_COOKIE = process.env.SIGN_COOKIE;
const MONGODB_URI = process.env.MONGODB_URI;

// Configuración del servidor
const app = express();
app.set("PORT", PORT);
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Middlewares
app.use(cookieParser(SIGN_COOKIE));
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static("public"));

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/business", businessRoutes);
app.use('/', viewRoutes);

connectDb(MONGODB_URI);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});