import usersModel from "../models/users.model.js"
import {
    createHash,
    isValidPassword,
    generateToken,
    verifyToken
} from "../../utils/index.js";

export default class User {
    getUsers = async () => {
        try {
            const users = await usersModel.find();

            if (users.length === 0) {
                return {
                    message: "No hay usuarios registrados."
                };
            }

            return {
                users
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    }

    async createUser(user) {
        try {
            let {
                first_name,
                last_name,
                email,
                password,
                age,
                role
            } = user;

            first_name = first_name ? first_name.trim() : "";
            last_name = last_name ? last_name.trim() : "";
            password = password ? password.trim() : "";

            if (age <= 0) return {
                error: "La edad debe ser mayor a 0."
            };

            if (!Number.isInteger(age) || age > 120) {
                return {
                    error: "Ingrese una edad válida."
                };
            }

            if (
                !first_name || first_name.trim() === "" ||
                !last_name || last_name.trim() === "" ||
                !email || !password || !age
            ) {
                return {
                    error: "Faltan ingresar datos obligatorios."
                };
            }

            const userFound = await usersModel.findOne({
                email
            });

            if (userFound) {
                return {
                    error: "El mail ingresado ya existe. Por favor, ingrese por Login."
                };
            }

            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
            };

            if (role && role === "admin") {
                newUser.role = "admin";
            } else {
                newUser.role = "user";
            }

            const result = await usersModel.create(newUser);
            return {
                user: result
            };
        } catch (error) {
            if (error.name === 'ValidationError') {
                const errorMessages = Object.values(error.errors).map(e => e.message);
                return {
                    error: errorMessages.join(', ')
                };
            }

            return {
                error: error.message
            };
        }
    }

    loginUser = async (email, password) => {
        try {
            if (!email || !password) {
                return {
                    error: "Faltan ingresar datos obligatorios."
                };
            }

            const userFound = await usersModel.findOne({
                email
            });

            if (!userFound) {
                return {
                    error: "Usuario o contraseña incorrecta."
                };
            }

            const isPasswordValid = isValidPassword(password, userFound.password);
            if (!isPasswordValid) {
                return {
                    error: "Usuario o contraseña incorrecta."
                };
            }

            const token = generateToken({
                id: userFound._id,
                first_name: userFound.first_name,
                last_name: userFound.last_name,
                age: userFound.age,
                email: userFound.email,
                role: userFound.role,
                orders: userFound.orders
            });

            return {
                user: userFound,
                token
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    };

    getProfile = async (user) => {
        try {
            if (!user) {
                return {
                    error: "No está logeado."
                };
            }
            const userWithOrders = await usersModel.findById(user.id);

            if (!userWithOrders) {
                return {
                    error: "Usuario o contraseña incorrecta."
                };
            }

            return {
                user: userWithOrders
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    };

    getCurrentUser = async (token) => {
        try {
            if (!token) {
                return {
                    message: "El usuario no está logeado."
                };
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return {
                    message: "El usuario no está logeado."
                };
            }

            const userWithOrders = await usersModel.findById(decoded.user.id);

            return {
                user: userWithOrders
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    };


    updateUser = async (id, orderId) => {
        try {
            const result = await usersModel.updateOne({
                _id: id
            }, {
                $push: {
                    orders: orderId
                }
            });
            return result;
        } catch (error) {
            return null;
        }
    }
}