import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import scanRoutes from "./routes/scanRoutes";
import activityRoutes from "./routes/activityRoutes";
import friendRoutes from "./routes/friendRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/scan", scanRoutes);
app.use("/activities", activityRoutes);
app.use("/friends", friendRoutes);  // Use friend routes

export default app;

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}  