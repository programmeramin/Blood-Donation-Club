import express from "express";
import { registerUser } from "../controller/authController.js";


// init router from express
const router = express.Router();



// routing 
router.post("/register", registerUser);


// export router
export default router;


