import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { MongoDBConnect } from "./config/MongoDB.js";
import authRoute from "./route/authRoute.js";
import searchRoute from "./route/donorRoute.js";
import errorHandler from "./middleware/errorHandler.js";

 
// initialize app
const app = express();

// Config dotenv
dotenv.config();

// environment var
const PORT = process.env.PORT || 8080;
 
// Set middlewares
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser())

// static folder
app.use(express.static("public"));


// routing
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/find", searchRoute);

// error handler function
app.use(errorHandler)

// app listen server
app.listen(PORT, () =>{
    console.log(`Server is running on PORT ${PORT}`.bgGreen.white);
    
    // mongoDb connection
    MongoDBConnect();
    
});