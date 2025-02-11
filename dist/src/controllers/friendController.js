"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScannedFriends = exports.scanFriend = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Helper function to format timestamps (removes the trailing "Z")
const formatTimestamp = (timestamp) => timestamp.toISOString().replace("Z", "");
/**
 * scanFriend:
 * - The scanner's badge_code is provided as a URL parameter.
 * - The friend's badge_code (the badge being scanned) is provided in the request body.
 * - Validates that:
 *    • The user cannot scan their own badge.
 *    • Both the scanner and scanned user exist.
 *    • The scanner has not already scanned this friend.
 * - Creates a new FriendScan record and updates the scanner's updated_at.
 * - Returns a simple success message with the timestamp of the scan.
 */
const scanFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { badge_code } = req.params;
        const { friend_badge_code } = req.body;
        if (!friend_badge_code || typeof friend_badge_code !== "string") {
            res.status(400).json({ error: "Invalid or missing friend_badge_code." });
            return;
        }
        if (badge_code === friend_badge_code) {
            res.status(400).json({ error: "You cannot scan your own badge." });
            return;
        }
        // ✅ Find the scanner and the scanned friend
        const scanner = yield prisma_1.default.user.findUnique({ where: { badge_code } });
        const scanned = yield prisma_1.default.user.findUnique({ where: { badge_code: friend_badge_code } });
        if (!scanner || !scanned) {
            res.status(404).json({ error: "One or both users not found." });
            return;
        }
        // ✅ Prevent scanning if either user is checked out
        if (!scanner.checked_in || !scanned.checked_in) {
            res.status(403).json({ error: "Both users must be checked in to scan friends." });
            return;
        }
        // ✅ Check if this scan already exists (in either direction)
        const existingScan = yield prisma_1.default.friendScan.findFirst({
            where: {
                OR: [
                    { scannerId: scanner.id, scannedId: scanned.id },
                    { scannerId: scanned.id, scannedId: scanner.id },
                ],
            },
        });
        if (existingScan) {
            res.status(400).json({ error: "You have already scanned this friend." });
            return;
        }
        // ✅ Create a new FriendScan record
        const friendScan = yield prisma_1.default.friendScan.create({
            data: {
                scannerId: scanner.id,
                scannedId: scanned.id,
                scanned_at: new Date(),
            },
        });
        // ✅ Update the scanner's `updated_at`
        yield prisma_1.default.user.update({
            where: { id: scanner.id },
            data: { updated_at: new Date() },
        });
        // ✅ Return a success response
        res.status(200).json({
            message: `Successfully scanned ${scanned.name}'s badge.`,
            scanned_at: formatTimestamp(friendScan.scanned_at),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.scanFriend = scanFriend;
/**
 * getScannedFriends:
 * - Retrieves all FriendScan records where the given user (identified by badge_code) is the scanner.
 * - Returns a list of users that have been scanned along with the timestamp when each scan occurred.
 */
const getScannedFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { badge_code } = req.params;
        // ✅ Find the user and include scanned friends, sorted by time
        const user = yield prisma_1.default.user.findUnique({
            where: { badge_code },
            select: {
                scannedFriends: {
                    include: {
                        scanned: true,
                    },
                    orderBy: { scanned_at: "desc" }, // ✅ Sort by most recent scan
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        // ✅ Format response
        const formattedFriends = user.scannedFriends.map((scan) => ({
            name: scan.scanned.name,
            email: scan.scanned.email,
            phone: scan.scanned.phone,
            badge_code: scan.scanned.badge_code,
            scanned_at: formatTimestamp(scan.scanned_at),
        }));
        res.json(formattedFriends);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getScannedFriends = getScannedFriends;
