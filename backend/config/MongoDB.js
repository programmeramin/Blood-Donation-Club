import mongoose from "mongoose";

// create mongoDB connection
export const MongoDBConnect = async() =>{

    try {
        const connection = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connection successful`.bgCyan.white);
        
    } catch (error) {
        console.log(`MongoDB connection failed`.bgRed.white);
        
    }

};