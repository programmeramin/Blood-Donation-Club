import User from "../model/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { isEmail, isMobile } from "../helper/helper.js";


// create token verify middleware
export const tokenVerify = asyncHandler(async(req, res, next) =>{
    // get server token
    const loginUserToken = req.cookies.loginUserToken;

    // check token
    if(!loginUserToken){
        return res.status(401).json({message : "Unauthorized"});
    }

    let decode;

    try {
        decode = jwt.verify(loginUserToken, process.env.USER_LOGN_SECRET);
    } catch (error) {
        return res.status(400).json({message : "Invalid token"});
    }

    let me = null;

    if(isEmail(decode.auth)){
        me = await User.findOne({email : decode.auth}).select("-password")
    }else if(isMobile(decode.auth)){
        me = await User.findOne({phone : decode.auth}).select("-password");
    }

  
    

    if(!me){
        return res.status(404).json({message : "User not found"});
    }

    req.me = me;
    next();
});     