import Business from "../dao/classes/business.dao.js";
import {
    v4 as uuidv4
} from "uuid";

const businessService = new Business();

export const getBusiness = async (req, res) => {
    try {
        const business = await businessService.getBusiness();

        if (!business || (Array.isArray(business) && business.length === 0)) {
            res.status(200).json({
                status: "success",
                message: "No hay negocios actualmente."
            });
            return;
        }

        res.status(200).json({
            status: "success",
            payload: business
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export const getBusinessById = async (req, res) => {
    const {
        bid
    } = req.params;
    try {
        const business = await businessService.getBusinessById(bid);
        !business
            ?
            res.status(404).json({
                status: "error",
                message: "No se encontró el negocio."
            }) :
            res.status(200).json({
                status: "success",
                payload: business
            });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export const createBusiness = async (req, res) => {
    try {
        const business = req.body;

        business.name = business.name ? business.name.trim().toUpperCase() : "";
        if (!business.name) {
            return res.status(400).json({
                status: "error",
                message: "Faltan datos obligatorios."
            });
        }

        const existingBusiness = await businessService.getBusinessByName(business.name);
        if (existingBusiness) {
            return res.status(400).json({
                status: "error",
                message: "El nombre del negocio ya existe. Por favor, ingrese los productos."
            });
        }

        if (!business.products.every(product => product.price > 0)) {
            return res.status(400).json({
                status: "error",
                message: "Todos los productos deben tener un precio mayor a cero."
            });
        }

        const productsWithIds = business.products.map(product => ({
            ...product,
            id: product.id || uuidv4().split("-")[0]
        }));

        const newBusiness = await businessService.createBusiness({
            ...business,
            products: productsWithIds
        });

        res.status(200).json({
            status: "success",
            payload: newBusiness
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export const addProduct = async (req, res) => {
    try {
        const product = req.body;
        const {
            bid
        } = req.params;

        if (product.price <= 0) {
            return res.status(400).json({
                status: "error",
                message: "El producto no puede tener precio negativo o cero."
            });
        }

        const business = await businessService.getBusinessById(bid);
        if (!business) {
            return res.status(404).json({
                status: "error",
                message: "Negocio no encontrado."
            });
        }

        const existingProduct = business.products.find(
            (prod) => prod.name === product.name.toUpperCase()
        );

        if (existingProduct) {
            existingProduct.stock += product.stock;
            if (product.price) {
                existingProduct.price = product.price;
            }
            await businessService.updateBusiness(business._id, business);
            return res.status(200).json({
                status: "success",
                message: "El producto existía, se actualizó el STOCK y el PRECIO.",
                payload: business
            });
        } else {
            const productWithId = {
                ...product,
                id: product.id || uuidv4().split("-")[0]
            };
            business.products.push(productWithId);
            await businessService.updateBusiness(business._id, business);
            return res.status(200).json({
                status: "success",
                message: "Producto agregado.",
                payload: business
            });
        }

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};