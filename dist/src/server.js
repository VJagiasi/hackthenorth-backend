"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const scanRoutes_1 = __importDefault(require("./routes/scanRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/users", userRoutes_1.default);
app.use("/scans", scanRoutes_1.default);
app.use("/activities", activityRoutes_1.default);
app.use("/friends", friendRoutes_1.default); // Use friend routes
exports.default = app;
// Only start the server if this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
