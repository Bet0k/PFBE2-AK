import express from "express";
import { engine } from "express-handlebars";
import cookieParser from "cookie-parser";
import passport from "passport";
import './passport/passport.config.js';  // Aquí solo importas la configuración de passport

import connectDb from "./database/index.js";
import userRoutes from "./routes/users.routes.js";
import viewRoutes from "./routes/views.routes.js";

const signCookie = "sign-cookie";
const mongodbUri = 'mongodb+srv://beto:1234@cluster0.g5rqp.mongodb.net/pruebas';

//settings
const app = express();
app.set("PORT", 3000);
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// middlewares
app.use(cookieParser(signCookie));  // Aquí configuras cookie-parser
app.use(passport.initialize());  // Inicializas passport después
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//routes
app.use('/api/users', userRoutes);
app.use('/', viewRoutes);

//listeners
connectDb(mongodbUri);
app.listen(app.get("PORT"), () => {
  console.log(`Server on port http://localhost:${app.get("PORT")}`);
});
