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
exports.updateActivityOneScan = exports.getActivityById = exports.getActivities = exports.createActivity = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, category } = req.body;
        const activity = yield prisma_1.default.activity.create({
            data: {
                name,
                category,
            },
        });
        res.status(201).json(activity);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create activity' });
    }
});
exports.createActivity = createActivity;
const getActivities = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activities = yield prisma_1.default.activity.findMany();
        res.json(activities);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});
exports.getActivities = getActivities;
const getActivityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const activity = yield prisma_1.default.activity.findUnique({
            where: { id: parseInt(id) },
            include: { scans: true },
        });
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});
exports.getActivityById = getActivityById;
const updateActivityOneScan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activity_name } = req.params;
        const { one_scan_only } = req.body;
        // Validate that one_scan_only is a boolean
        if (typeof one_scan_only !== "boolean") {
            return res.status(400).json({ error: "one_scan_only must be a boolean value." });
        }
        // Find the activity
        const activity = yield prisma_1.default.activity.findUnique({ where: { name: activity_name } });
        if (!activity) {
            return res.status(404).json({ error: `Activity '${activity_name}' not found.` });
        }
        // Update the one_scan_only field
        const updatedActivity = yield prisma_1.default.activity.update({
            where: { name: activity_name },
            data: { one_scan_only },
            select: { name: true, category: true, one_scan_only: true },
        });
        res.status(200).json(updatedActivity);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateActivityOneScan = updateActivityOneScan;
