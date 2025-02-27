import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Order from "../dao/classes/order.dao.js";
import dotenv from "dotenv";

const orderService = new Order();
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (password, hash) => bcrypt.compareSync(password, hash);

export const generateToken = (user) => {
    return jwt.sign({
        user
    }, JWT_SECRET, {
        expiresIn: '1h'
    });
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null;
    }
}

export const checkAdminRole = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Acceso denegado.'
        });
    }

    next();
};

export const checkAdminOrOwner = async (req, res, next) => {
    const {
        oid
    } = req.params;
    const user = req.user;

    try {
        const order = await orderService.getOrderById(oid);

        if (user.role === "admin" || user.id === order.user.id.toString()) {
            return next();
        }

        return res.status(403).json({
            status: "error",
            message: "Solo podes visualizar las compras de tu usuario."
        });
    } catch (error) {
        console.error("Error checking admin or owner:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};