import {
    Schema,
    model,
    SchemaTypes
} from "mongoose";

const OrderSchema = new Schema({
    number: String,
    status: String,
    totalPrice: Number,
    products: [{
        product: {
            type: SchemaTypes.ObjectId,
            ref: "Product"
        },
        quantity: Number,
    }],
    business: [{
        type: SchemaTypes.ObjectId,
        ref: "Business"
    }],
    user: {
        type: SchemaTypes.ObjectId,
        ref: "User",
        required: true
    }
});


export default model("Orders", OrderSchema);