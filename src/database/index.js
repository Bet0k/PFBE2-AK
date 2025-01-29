import mongoose from "mongoose";

export default async function connectDb(uri) {
    try {
        await mongoose.connect(uri);
        console.log("Conexión exitosa a MongoDB.");

    } catch (error) {
        console.log("Conexión no exitosa a MongoDB." + error.message);

    }
}