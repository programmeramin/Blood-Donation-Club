import User from "../model/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createOTP, isEmail, isMobile } from "../helper/helper.js";
import VerifyEmailOtp from "../mails/VerifyEmailOtp.js";
import axios from "axios";

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
  if (!name?.trim() || !auth?.trim() || !password?.trim() || !conPass?.trim()) {
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
    const checkEmail = await User.findOne({ email: authEmail });
    if (checkEmail) {
      return res.status(400).json({ message: "Email already existance" });
    }
  } else if (isMobile(auth)) {
    authPhone = auth.replace(/^0/, "+880");

    // check phone existance
    const checkMobile = await User.findOne({ phone: authPhone });
    if (checkMobile) {
      return res.status(400).json({ message: "Mobile already existance" });
    }
  } else {
    return res
      .status(404)
      .json({ message: "You must use a mobile or phone number" });
  }

  // password hass
  const hassPassword = await bcrypt.hash(password, 10);

  // otp verification expires date
  const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

  // user create
  const user = await User.create({
    name,
    email: authEmail || null,
    phone: authPhone || null,
    password: hassPassword,
    accessToken: otp,
    otpExpiresAt,
    role: role,
  });

  if (user) {
    // send token to cookie
    const activationToken = jwt.sign(
      { userId : user._id },
      process.env.ACCOUNT_ACTIVATION_SECRET,
      {
        expiresIn: "15min",
      }
    );

    // set cookie
    res.cookie("activationToken", activationToken);

    if (authEmail) {
      await VerifyEmailOtp(auth, { code: otp, link: "" });
    }

    if (authPhone) {
      const { name, auth } = req.body;
      const message = `Hi ${name}, Your OTP code: ${otp}. OTP is valid for 5 minutes. After 5 minute account disable & plz register again`;

      // const message = `Hi ${name}, আমি কথা দিয়ে কথা রেখেছি তুমি আসোনি তো ফিরে। আমি ঘুরে দাঁড়ানোর গল্প লিখেছি সারাটা জীবন ধরে।  আমি অন্ধকারে আলো জ্বালিয়েছি তবু পাইনি তো খোঁজ। আমি তোমার জন্য অপেক্ষায় ছিলাম তবুও তুমি আসোনি ফিরে`;

      // const message = `Hi ${name}, আজ শহর জুড়ে বৃষ্টি নামুক মায়াবতী তুমি খুজে নিও ঠাই বৃষ্টির প্রতিটি ফোটায় ফোটায় লেখা থাকুক আমি শুধু তোমাকেই চাই। আজ জেনে রেখো শুনে রেখো প্রিয় আমার থেকে বেশি ভালোবাসতে পারবে না কেউ।তুমি আমার হৃদয় কুঠারে পূর্ণিমারি আলো তুমি আমার গল্পের সূচনা আমার সফলতার দাবি। অথচ ছন্দে রঙ্গে ভুলে গেছি আমি তো এক ব্যর্থ কবি।`

      //console.log(auth);

      await axios.get(`https://bulksmsbd.net/api/smsapi`, {
        params: {
          api_key: "9AmVeMs2GnbB1IS5H7FW",
          type: "text",
          number: auth,
          senderid: "8809617612994",
          message,
        },
      });
    }
  }

  res.status(201).json({ user, message: "user data created successful" });
});

/**
 * @description User otp verification
 * @method POST
 * @access Public
 * @route /api/v1/auth/register
 */

export const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ message: "OTP is required" });

  // 1️⃣ Read activationToken from HTTP-only cookie
  const activationToken = req.cookies.activationToken;
  
  if (!activationToken)
    return res.status(401).json({ message: "Activation token missing" });

  // 2️⃣ Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(
      activationToken,
      process.env.ACCOUNT_ACTIVATION_SECRET
    );
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired activation token" });
  }

  // 3️⃣ Get user from decoded token
  const user = await User.findById(decoded.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // 4️⃣ Check OTP validity
  if (user.isVerified)
    return res.status(400).json({ message: "User already verified" });
  if (user.accessToken !== otp)
    return res.status(400).json({ message: "Invalid OTP" });
  if (user.otpExpiresAt < new Date()) {
    await User.findByIdAndDelete(user._id); // ❌ Delete unverified user
    res.clearCookie("activationToken"); // clear token also
    return res
      .status(400)
      .json({ message: "OTP expired. Please register again." });
  }

  // 5️⃣ OTP valid → activate user
  user.isVerified = true;
  user.accessToken = null;
  user.otpExpiresAt = null;
  await user.save();

  // 6️⃣ Clear activationToken cookie
  res.clearCookie("activationToken", activationToken);

  res.status(200).json({ message: "Account verified successfully" });
});


/**
 * @description login user
 * @method POST
 * @access public
 * @route api/v1/auth/login
 */

export const login = asyncHandler(async(req, res) =>{

  const  {auth, password} = req.body();

  // all field validation
  if(!auth || !password){
    return res.status(400).json({message : "All fields are required"})
  }

  


})
