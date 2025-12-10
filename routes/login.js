import { handleLogin } from "../controllers/loginController.js";
import express from "express";
const router = express.Router();

router.post("/", handleLogin);
export default router;