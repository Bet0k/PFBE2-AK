import OrderModel from "../models/orders.model.js"

export default class Order {
    getOrder = async () => {
        try {
            const Order = await OrderModel.find();
            return Order;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    getOrderById = async (id) => {
        try {
            const order = await OrderModel.findOne({
                    _id: id
                })
                .populate("user", "email")
                .exec();

            return order;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    createOrder = async (Order) => {
        try {
            const result = await OrderModel.create(Order);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    updateOrder = async (id, updatedData) => {
        try {
            const result = await OrderModel.updateOne({
                _id: id
            }, {
                $set: updatedData
            });
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

}