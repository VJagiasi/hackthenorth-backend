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
exports.updateUser = exports.getUserByEmail = exports.getAllUsers = exports.checkOutUser = exports.checkInUser = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Function to validate badge_code format (must be four words separated by hyphens)
const validateBadgeCode = (badgeCode) => {
    return /^[A-Za-z]+-[A-Za-z]+-[A-Za-z]+-[A-Za-z]+$/.test(badgeCode);
};
// Function to format timestamps correctly
const formatTimestamps = (timestamp) => timestamp.toISOString().replace("Z", "");
const checkInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (!user.badge_code) {
            res.status(400).json({ error: "You must have a valid badge to check in." });
            return;
        }
        if (user.checked_in) {
            res.status(400).json({
                error: `${user.name} is already checked in.`,
                name: user.name,
                checked_in: user.checked_in,
                updated_at: formatTimestamps(user.updated_at),
            });
            return;
        }
        // ✅ Update user to be checked in
        const updatedUser = yield prisma_1.default.user.update({
            where: { email },
            data: { checked_in: true, updated_at: new Date() },
        });
        res.status(200).json({
            message: `${updatedUser.name} has successfully checked in.`,
            name: updatedUser.name,
            checked_in: updatedUser.checked_in,
            updated_at: formatTimestamps(updatedUser.updated_at),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.checkInUser = checkInUser;
// ✅ Check-out an attendee
const checkOutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (!user.checked_in) {
            res.status(400).json({
                error: `${user.name} is already checked out.`,
                name: user.name,
                email: user.email,
                checked_in: user.checked_in,
                updated_at: formatTimestamps(user.updated_at),
            });
            return;
        }
        // ✅ Update user to be checked out
        const updatedUser = yield prisma_1.default.user.update({
            where: { email },
            data: { checked_in: false, updated_at: new Date() },
        });
        res.status(200).json({
            message: `${updatedUser.name} has successfully checked out.`,
            name: updatedUser.name,
            email: updatedUser.email,
            checked_in: updatedUser.checked_in,
            updated_at: formatTimestamps(updatedUser.updated_at),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.checkOutUser = checkOutUser;
// Function to format scans correctly
const formatScans = (scans) => {
    return scans.map(scan => ({
        activity_name: scan.activity.name,
        activity_category: scan.activity.category,
        scanned_at: formatTimestamps(scan.scanned_at),
    }));
};
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            select: {
                name: true,
                email: true,
                phone: true,
                badge_code: true,
                updated_at: true, // Include updated_at field
                scans: {
                    select: {
                        activity: {
                            select: {
                                name: true, // activity_name
                                category: true, // activity_category
                            }
                        },
                        scanned_at: true,
                    },
                },
            },
        });
        // Format timestamps properly
        const formattedUsers = users.map((user) => (Object.assign(Object.assign({}, user), { updated_at: formatTimestamps(user.updated_at), scans: formatScans(user.scans) })));
        res.json(formattedUsers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllUsers = getAllUsers;
const getUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const user = yield prisma_1.default.user.findUnique({
            where: { email },
            select: {
                name: true,
                email: true,
                phone: true,
                badge_code: true,
                updated_at: true, // Include updated_at field
                scans: {
                    select: {
                        activity: {
                            select: {
                                name: true, // activity_name
                                category: true, // activity_category
                            }
                        },
                        scanned_at: true,
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const formattedUser = Object.assign(Object.assign({}, user), { updated_at: formatTimestamps(user.updated_at), scans: formatScans(user.scans) });
        res.json(formattedUser);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUserByEmail = getUserByEmail;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const updatedData = req.body;
        if (Object.keys(updatedData).length === 0) {
            res.status(400).json({ error: "No fields provided to update." });
            return;
        }
        const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!existingUser) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        if ("badge_code" in updatedData) {
            if (updatedData.badge_code === null) {
                res.status(400).json({ error: "Badge code cannot be removed once assigned." });
                return;
            }
            if (!validateBadgeCode(updatedData.badge_code)) {
                res.status(400).json({ error: "Invalid badge_code format." });
                return;
            }
            const badgeExists = yield prisma_1.default.user.findFirst({
                where: {
                    badge_code: updatedData.badge_code,
                    NOT: { email: existingUser.email },
                },
            });
            if (badgeExists) {
                res.status(400).json({ error: "Badge code is already taken." });
                return;
            }
        }
        // ✅ Prevent updating `email` if it's already taken by another user
        if (updatedData.email && updatedData.email !== existingUser.email) {
            const emailExists = yield prisma_1.default.user.findFirst({
                where: { email: updatedData.email },
            });
            if (emailExists) {
                res.status(400).json({ error: "Email is already taken by another user." });
                return;
            }
        }
        // Prepare update object
        const fieldsToUpdate = Object.assign(Object.assign({}, updatedData), { updated_at: new Date() });
        // ✅ Update the user
        const updatedUser = yield prisma_1.default.user.update({
            where: { email },
            data: fieldsToUpdate,
            select: {
                name: true,
                email: true,
                phone: true,
                badge_code: true,
                updated_at: true,
                scans: {
                    select: {
                        activity: {
                            select: {
                                name: true,
                                category: true,
                            },
                        },
                        scanned_at: true,
                    },
                },
            },
        });
        // ✅ Format response
        const formattedUser = Object.assign(Object.assign({}, updatedUser), { updated_at: formatTimestamps(updatedUser.updated_at), scans: updatedUser.scans.map((scan) => ({
                activity_name: scan.activity.name,
                activity_category: scan.activity.category,
                scanned_at: formatTimestamps(scan.scanned_at),
            })) });
        res.json(formattedUser);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateUser = updateUser;
