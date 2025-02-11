"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const friendController_1 = require("../controllers/friendController");
const router = (0, express_1.Router)();
// Endpoint to scan a friend's badge (scanner's badge_code is in the URL)
router.post("/scan/:badge_code", friendController_1.scanFriend);
// Endpoint to retrieve all friends scanned by a user (by badge_code)
router.get("/:badge_code", friendController_1.getScannedFriends);
exports.default = router;
