import { Router } from "express";
import { getAllUsers, getUserByEmail, updateUser, checkInUser, checkOutUser } from "../controllers/userController";

const router = Router();    
router.get("/", getAllUsers);
router.get("/:email", getUserByEmail);
router.put("/:email", updateUser);
router.post("/:email/check-in", checkInUser);
router.post("/:email/check-out", checkOutUser);

export default router;