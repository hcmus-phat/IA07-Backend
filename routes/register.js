import { handleRegister } from "../controllers/registerController.js";
import express from "express";
const router = express.Router();

router.post("/", handleRegister);
export default router;