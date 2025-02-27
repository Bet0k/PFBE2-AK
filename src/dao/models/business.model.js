import {
    Schema,
    model
} from "mongoose";

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        set: (value) => value.toUpperCase()
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    }
});

const BusinessSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: (value) => value.toUpperCase()
    },
    products: [ProductSchema]
});

export default model("Business", BusinessSchema);