import User from "../model/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createOTP, isEmail, isMobile } from "../helper/helper.js";
import VerifyEmailOtp from "../mails/VerifyEmailOtp.js";

/**
 * description User Register
 * method POST
 * access public
 * route /api/v1/auth/register
 *
 */

export const registerUser = asyncHandler(async (req, res) => {
  const { name, auth, password, conPass, role } = req.body;

  // validation
  if (!name?.trim() || !auth?.trim() || !password?.trim()  || !conPass?.trim()) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // password check
  if (password !== conPass) {
    return res.status(400).json({ message: "Password didn't match" });
  }

  // otp
  const otp = createOTP();

  // check user email or phone
  let authEmail = null;
  let authPhone = null;

  if (isEmail(auth)) { 
    authEmail = auth.toLowerCase();

    // check email existance
    const checkEmail = await User.findOne({ email : authEmail });
    if (checkEmail) {
      return res.status(400).json({ message: "Email already existance" });
    }
  } else if (isMobile(auth)) {
    authPhone = auth.replace(/^0/, "+880");

    // check phone existance
    const checkMobile = await User.findOne({ phone : authPhone });
    if (checkMobile) {
      return res.status(400).json({ message: "Mobile already existance" });
    }
  }else{
    return res.status(404).json({message : "You must use a mobile or phone number"})
  }

  // password hass
  const hassPassword = await bcrypt.hash(password, 10);

  // user create
  const user = await User.create({
    name: name,
    email : authEmail || null,
    phone : authPhone || null,
    password: hassPassword,
    accessToken : otp,
    role: role,
  });

   if(user){
    
    // send token to cookie
    const activationToken = jwt.sign({auth},
      process.env.ACCOUNT_ACTIVATION_SECRET,
      {
        expiresIn : "15min"
      }
    )

    // set cookie
    res.cookie("activationToken", activationToken)

    if(authEmail){
      await VerifyEmailOtp(auth, {code : otp, link: ""})
    }

   }

  res.status(201).json({ user, message: "user data created successful" });
});
