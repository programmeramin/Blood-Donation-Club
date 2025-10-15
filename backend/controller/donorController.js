import User from "../model/userModel.js";
import asyncHandler  from 'express-async-handler';


// donor search controller function
export const donorSearch = asyncHandler(async(req, res) =>{

    const {district, subDistrict, bloodGroup, eligible} = req.query;

    // fields check
    if(!district || !subDistrict || !bloodGroup){
        return res.status(400).json({message : "All fields are required"});
    }

    const filter = {};
    if(district) filter.district = district;
    if(subDistrict) filter.subDistrict = subDistrict;
    if(bloodGroup) filter.bloodGroup = bloodGroup;

    // from mongoDB donors fetch
    let donors = await User.find(filter).select("-__v").sort({createdAt : - 1});

    // eligible check lastDonate befor 3 months ago
    if(eligible === "true"){
        const threeMonthsAgo = new Date();

        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        donors = donors.filter(donor => new Date(donor.lastDonate) <= threeMonthsAgo);
    }

    res.status(200).json(donors);

})