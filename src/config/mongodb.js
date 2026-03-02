import mongoose from "mongoose";
import 'dotenv/config'

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
    }catch(error){
        console.error('\nError al conectar con mongodb: ', error)
    }
}