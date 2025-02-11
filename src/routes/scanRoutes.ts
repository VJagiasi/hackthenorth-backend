import { Router } from "express";
import { addScan, getScansByTime, getScansData } from "../controllers/scanController";

const router = Router();
router.post("/:badge_code", addScan);
router.get("/", getScansData);
router.get("/timeline", getScansByTime);

export default router;