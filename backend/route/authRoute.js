import express from "express";
import { registerUser, verifyOtp } from "../controller/authController.js";


// init router from express
const router = express.Router();



// routing 
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp)


// export router
export default router;


