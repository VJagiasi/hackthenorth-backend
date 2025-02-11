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
exports.getScansByTime = exports.getScansData = exports.addScan = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const addScan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { badge_code } = req.params;
        const { activity_name, activity_category } = req.body;
        if (!activity_name || typeof activity_name !== "string") {
            res.status(400).json({ error: "Invalid activity_name provided." });
            return;
        }
        if (!activity_category || typeof activity_category !== "string" || activity_category.trim().length === 0) {
            res.status(400).json({ error: "Invalid activity_category provided." });
            return;
        }
        const user = yield prisma_1.default.user.findUnique({ where: { badge_code } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (!user.checked_in) {
            res.status(403).json({ error: "User is checked out. Please check in before scanning." });
            return;
        }
        const activity = yield prisma_1.default.activity.findFirst({
            where: { name: activity_name.toLowerCase() },
        });
        if (!activity) {
            res.status(400).json({ error: `Activity '${activity_name}' does not exist.` });
            return;
        }
        if (activity.category.toLowerCase() !== activity_category.toLowerCase()) {
            res.status(400).json({
                error: `Invalid event type: '${activity_name}' belongs to category '${activity.category}', not '${activity_category}'.`,
            });
            return;
        }
        if (activity.one_scan_only) {
            const existingScan = yield prisma_1.default.scan.findFirst({
                where: { userId: user.id, activityId: activity.id },
            });
            if (existingScan) {
                res.status(400).json({ error: `You are only allowed one scan for '${activity_name}'.` });
                return;
            }
        }
        const lastScan = yield prisma_1.default.scan.findFirst({
            where: { userId: user.id, activityId: activity.id },
            orderBy: { scanned_at: "desc" },
        });
        const SCAN_COOLDOWN_MS = 5 * 1000; // 5 seconds
        if (lastScan && new Date().getTime() - new Date(lastScan.scanned_at).getTime() < SCAN_COOLDOWN_MS) {
            res.status(429).json({ error: "You are scanning too fast. Please wait a few seconds." });
            return;
        }
        const scan = yield prisma_1.default.scan.create({
            data: {
                userId: user.id,
                activityId: activity.id,
                scanned_at: new Date(),
            },
            include: { activity: true },
        });
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { updated_at: new Date() },
        });
        res.status(200).json({
            message: "Scan successfully recorded.",
            activity_name: scan.activity.name,
            activity_category: scan.activity.category,
            scanned_at: scan.scanned_at.toISOString().replace("Z", ""),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.addScan = addScan;
const getScansData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const min_frequency = req.query.min_frequency ? parseInt(req.query.min_frequency) : undefined;
        const max_frequency = req.query.max_frequency ? parseInt(req.query.max_frequency) : undefined;
        const activity_category = req.query.activity_category ? req.query.activity_category.toString().trim() : undefined;
        if (min_frequency && isNaN(Number(min_frequency)) || max_frequency && isNaN(Number(max_frequency))) {
            res.status(400).json({ error: "min_frequency and max_frequency must be valid numbers." });
            return;
        }
        const activityIds = activity_category
            ? yield prisma_1.default.activity.findMany({
                where: { category: activity_category },
                select: { id: true },
            }).then((activities) => activities.map((a) => a.id))
            : undefined;
        const min = min_frequency ? Number(min_frequency) : 0;
        const max = max_frequency ? Number(max_frequency) : Number.MAX_SAFE_INTEGER;
        const scanData = yield prisma_1.default.scan.groupBy({
            by: ["activityId"],
            _count: { id: true },
            where: activityIds ? { activityId: { in: activityIds } } : undefined,
            orderBy: { _count: { id: "desc" } },
        });
        const filteredScanData = scanData.filter((scan) => scan._count.id >= min && scan._count.id <= max);
        if (filteredScanData.length === 0) {
            res.status(404).json({ error: "No scans found matching the criteria." });
            return;
        }
        const activityData = yield prisma_1.default.activity.findMany({
            where: { id: { in: filteredScanData.map((scan) => scan.activityId) } },
            select: { id: true, name: true, category: true },
        });
        const formattedResults = filteredScanData.map((scan) => {
            const activity = activityData.find((a) => a.id === scan.activityId);
            return activity
                ? {
                    activity_name: activity.name,
                    activity_category: activity.category,
                    frequency: scan._count.id,
                }
                : null;
        }).filter(Boolean);
        res.json(formattedResults);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getScansData = getScansData;
const getScansByTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activity_name, interval = "hour", start_time, end_time } = req.query;
        if (!activity_name || typeof activity_name !== "string" || activity_name.trim().length === 0) {
            res.status(400).json({ error: "Valid activity_name is required." });
            return;
        }
        const validIntervals = ["hour", "minute", "day"];
        if (!validIntervals.includes(interval)) {
            res.status(400).json({ error: "Invalid interval. Use 'hour', 'minute', or 'day'." });
            return;
        }
        const startTime = start_time ? new Date(start_time) : undefined;
        const endTime = end_time ? new Date(end_time) : new Date();
        if ((startTime && isNaN(startTime.getTime())) || isNaN(endTime.getTime())) {
            res.status(400).json({ error: "Invalid date format for start_time or end_time." });
            return;
        }
        const activity = yield prisma_1.default.activity.findFirst({
            where: { name: { equals: activity_name.toLowerCase(), mode: "insensitive" } },
            select: { id: true },
        });
        if (!activity) {
            res.status(404).json({ error: `Activity '${activity_name}' not found.` });
            return;
        }
        const interval_value = interval;
        const query = (yield prisma_1.default.$queryRawUnsafe(`
      SELECT DATE_TRUNC('${interval_value}', scanned_at) AS time, COUNT(*) AS scan_count
      FROM "Scan"
      WHERE "activityId" = ${activity.id}
      ${startTime ? `AND scanned_at >= '${startTime.toISOString()}'` : ''}
      ${endTime ? `AND scanned_at <= '${endTime.toISOString()}'` : ''}
      GROUP BY time 
      ORDER BY time
    `));
        if (query.length === 0) {
            res.status(404).json({ message: "No scan data found for this activity within the given time range." });
            return;
        }
        const formattedScans = query.map((scan) => ({
            time: scan.time.toISOString().replace("Z", ""),
            scan_count: Number(scan.scan_count),
        }));
        res.json(formattedScans);
    }
    catch (error) {
        console.error("Error fetching scans by time:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getScansByTime = getScansByTime;
