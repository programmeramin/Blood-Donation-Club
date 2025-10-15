import { donorSearch } from "../controller/donorController.js";
import express from "express";


// inti router
const router = express.Router();

// route
router.get("/donor-search", donorSearch);


export default router;