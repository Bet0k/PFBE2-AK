import Order from "../dao/classes/order.dao.js";
import User from "../dao/classes/users.dao.js";
import Business from "../dao/classes/business.dao.js";
import TicketsModel from '../dao/models/tickets.model.js';
import {
    mongoose
} from 'mongoose';
import {
    v4 as uuid
} from "uuid";

const userService = new User();
const businessService = new Business();
const orderService = new Order();

export const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getOrder();

        if (!orders || (Array.isArray(orders) && orders.length === 0)) {
            res.status(200).json({
                status: "success",
                message: "No hay órdenes actualmente."
            });
            return;
        }
        const reorderedOrders = orders.map(order => ({
            order_id: order._id,
            order_number: order.number,
            status: order.status,
            business: order.business,
            user: order.user,
            products: order.products,
            totalPrice: order.totalPrice
        }));
        
        console.log(reorderedOrders);
        

        res.status(200).json({
            status: "success",
            payload: reorderedOrders
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message
        })
    }
}

export const getOrderById = async (req, res) => {
    const {
        oid
    } = req.params;
    try {
        const order = await orderService.getOrderById(oid);

        if (!order) {
            return res.status(404).json({
                status: "error",
                message: "No existe la orden con el id indicado."
            });
        }

        const reorderedOrder = {
            order_id: order._id,
            order_number: order.number,
            status: order.status,
            user: {
                id: order.user.id,
                email: order.user.email,
            },
            business: order.business,
            products: order.products,
            totalPrice: order.totalPrice
        };

        res.status(200).json({
            status: "success",
            payload: reorderedOrder
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message
        });
    }
};


export const createOrder = async (req, res) => {
    const {
        business,
        products
    } = req.body;

    try {
        const user = req.user;

        const userFound = await userService.getCurrentUser(user.id);

        if (!userFound) {
            return res.status(404).json({
                status: "error",
                message: "El usuario no existe."
            });
        }

        const businessFound = await businessService.getBusinessById(business);
        if (!businessFound) {
            return res.status(404).json({
                status: "error",
                message: "El negocio no existe."
            });
        }

        const productsArray = Array.isArray(products) ? products : [products];


        const actualOrders = businessFound.products.filter((p) =>
            productsArray.some(product => product.id === p._id.toString())
        );

        if (actualOrders.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No existe el producto."
            });
        }

        for (let product of actualOrders) {
            const requestedProduct = productsArray.find(p => p.id.toString() === product.id.toString());
            if (requestedProduct.quantity <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "La cantidad debe ser mayor a 0."
                })
            }
            if (product.stock < requestedProduct.quantity) {
                return res.status(400).json({
                    status: "error",
                    message: `No hay suficiente stock del producto: ${product.name} con el ID: ${product.id}`
                });
            }

            product.stock -= requestedProduct.quantity;
        }

        await businessService.updateBusiness(business, businessFound);

        const totalPrice = actualOrders.reduce((acc, prev) => acc + (prev.price * productsArray.find(p => p.id.toString() === prev.id.toString()).quantity), 0);

        const order = {
            number: uuid(),
            business,
            user: user.id,
            status: "pending",
            products: productsArray.map((p) => ({
                product: p.id,
                quantity: p.quantity
            })),
            totalPrice,
        };

        console.log(order);
        
        const orderResult = await orderService.createOrder(order);

        const reorderedOrderResult = {
            order_id: orderResult._id,
            number: order.number,
            status: order.status,
            user: {
                id: order.user,
                email: order.user.email,
            },
            business: order.business,
            products: order.products,
            totalPrice: order.totalPrice,
        };

        console.log(reorderedOrderResult);
        
        await userService.updateUser(user.id, orderResult._id);

        res.status(201).json({
            status: "success",
            payload: reorderedOrderResult
        });
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            status: "error",
            error: error.message
        });
    }
};


export const resolveOrder = async (req, res) => {
    const {
        oid
    } = req.params;

    if (!oid || typeof oid !== "string" || !/^[0-9a-fA-F]{24}$/.test(oid)) {
        return res.status(400).json({
            status: "error",
            message: "El ID de la orden no es válido."
        });
    }

    try {
        const order = await orderService.getOrderById(oid);

        if (!order) {
            return res.status(404).json({
                status: "error",
                message: "Orden no encontrada."
            });
        }

        if (order.status === 'resolved') {
            return res.status(400).json({
                status: "error",
                message: "La orden ya está paga."
            });
        }

        if (!order.totalPrice || order.totalPrice <= 0) {
            return res.status(400).json({
                status: "error",
                message: "El total de la orden es inválido."
            });
        }

        if (!order.user || !order.user.email) {
            return res.status(400).json({
                status: "error",
                message: "No se encontró el correo del usuario."
            });
        }

        order.status = 'resolved';
        await orderService.updateOrder(oid, {
            status: 'resolved'
        });

        const ticket = new TicketsModel({
            amount: order.totalPrice,
            purchaser: order.user.email,
        });

        await ticket.save();

        console.log(order);
        const reorderedOrderResult = {
            order_id: order._id,
            number: order.number,
            status: order.status,
            user: {
                id: order.user,
                email: order.user.email,
            },
            business: order.business,
            products: order.products,
            totalPrice: order.totalPrice,
        };

        
        res.status(200).json({
            status: "success",
            payload: {
                reorderedOrderResult,
                ticket
            }
        });

    } catch (error) {
        console.error("Error en resolveOrder:", error);
        return res.status(500).json({
            status: "error",
            message: "Ocurrió un error interno. Intente nuevamente."
        });
    }
};