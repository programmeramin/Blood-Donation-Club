import express from "express";
import {
  login,
  logOut, 
  registerUser,
  verifyOtp,
  getLoggedInUser,
  changepassword,
  forgotpassword,
  resetpassword,
} from "../controller/authController.js";
import { tokenVerify } from "../middleware/tokenVerify.js";

// init router from express
const router = express.Router();

// routing
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/me", tokenVerify, getLoggedInUser);
router.post("/logout", logOut);
router.put("/change-password", tokenVerify, changepassword);
router.post("/forgot-password", forgotpassword);
router.post("/reset-password", resetpassword);


// export router
export default router;
