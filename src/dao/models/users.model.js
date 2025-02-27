import {
    Schema,
    model,
    SchemaTypes
} from "mongoose";

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Valida el mail
        match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Por favor ingrese un correo válido.'] 
    },
    age: {
        type: Number
    },
    password: String,
    cart: {
        id: String,
    },
    role: {
        type: String,
        default: "user",
    },
    orders: [{
        type: SchemaTypes.ObjectId,
        ref: "Orders"
    }],
});


export default model('User', UserSchema)