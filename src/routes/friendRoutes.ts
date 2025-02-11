import { Router } from "express";
import { scanFriend, getScannedFriends } from "../controllers/friendController";

const router = Router();

// Endpoint to scan a friend's badge (scanner's badge_code is in the URL)
router.post("/scan/:badge_code", scanFriend);

// Endpoint to retrieve all friends scanned by a user (by badge_code)
router.get("/:badge_code", getScannedFriends);

export default router;