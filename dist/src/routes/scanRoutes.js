"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scanController_1 = require("../controllers/scanController");
const router = (0, express_1.Router)();
router.post("/:badge_code", scanController_1.addScan);
router.get("/", scanController_1.getScansData);
router.get("/timeline", scanController_1.getScansByTime);
exports.default = router;
