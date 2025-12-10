import handleRefresh from "../controllers/refreshController.js";
import express from "express";
const router = express.Router();

router.post("/", handleRefresh);
export default router;
