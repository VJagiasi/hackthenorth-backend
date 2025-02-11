import { RequestHandler } from 'express';
import prisma from '../utils/prisma';
import { Prisma, PrismaClient } from "@prisma/client";

type Activity = {
  id: number;
  name: string;
  category: string;
};

interface ScanCount {
  activityId: number;
  _count: { id: number };
}

interface ScanTimeResult {
  time: Date;
  scan_count: bigint;
}

export const addScan: RequestHandler = async (req, res) => {
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

    const user = await prisma.user.findUnique({ where: { badge_code } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.checked_in) {
      res.status(403).json({ error: "User is checked out. Please check in before scanning." });
      return;
    }

    const activity = await prisma.activity.findFirst({
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
      const existingScan = await prisma.scan.findFirst({
        where: { userId: user.id, activityId: activity.id },
      });
      if (existingScan) {
        res.status(400).json({ error: `You are only allowed one scan for '${activity_name}'.` });
        return;
      }
    }

    const lastScan = await prisma.scan.findFirst({
      where: { userId: user.id, activityId: activity.id },
      orderBy: { scanned_at: "desc" },
    });

    const SCAN_COOLDOWN_MS = 5 * 1000; // 5 seconds
    if (lastScan && new Date().getTime() - new Date(lastScan.scanned_at).getTime() < SCAN_COOLDOWN_MS) {
      res.status(429).json({ error: "You are scanning too fast. Please wait a few seconds." });
      return;
    }

    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        scanned_at: new Date(),
      },
      include: { activity: true },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { updated_at: new Date() },
    });

    res.status(200).json({
      message: "Scan successfully recorded.",
      activity_name: scan.activity.name,
      activity_category: scan.activity.category,
      scanned_at: scan.scanned_at.toISOString().replace("Z", ""),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getScansData: RequestHandler = async (req, res) => {
  try {
    const min_frequency = req.query.min_frequency ? parseInt(req.query.min_frequency as string) : undefined;
    const max_frequency = req.query.max_frequency ? parseInt(req.query.max_frequency as string) : undefined;
    const activity_category = req.query.activity_category ? req.query.activity_category.toString().trim() : undefined;

    if (min_frequency && isNaN(Number(min_frequency)) || max_frequency && isNaN(Number(max_frequency))) {
      res.status(400).json({ error: "min_frequency and max_frequency must be valid numbers." });
      return;
    }

    const activityIds = activity_category
      ? await prisma.activity.findMany({
          where: { category: activity_category },
          select: { id: true },
        }).then((activities: { id: number }[]) => activities.map((a) => a.id))
      : undefined;

    const min = min_frequency ? Number(min_frequency) : 0;
    const max = max_frequency ? Number(max_frequency) : Number.MAX_SAFE_INTEGER;

    const scanData = await prisma.scan.groupBy({
      by: ["activityId"],
      _count: { id: true },
      where: activityIds ? { activityId: { in: activityIds } } : undefined,
      orderBy: { _count: { id: "desc" } },
    });

    const filteredScanData = scanData.filter(
      (scan: { activityId: number; _count: { id: number } }) => 
        scan._count.id >= min && scan._count.id <= max
    );

    if (filteredScanData.length === 0) {
      res.status(404).json({ error: "No scans found matching the criteria." });
      return;
    }

    const activityData = await prisma.activity.findMany({
      where: { id: { in: filteredScanData.map((scan: ScanCount) => scan.activityId) } },
      select: { id: true, name: true, category: true },
    });

    const formattedResults = filteredScanData.map((scan: ScanCount) => {
      const activity = activityData.find((a: Activity) => a.id === scan.activityId);
      return activity
        ? {
            activity_name: activity.name,
            activity_category: activity.category,
            frequency: scan._count.id,
          }
        : null;
    }).filter(Boolean);

    res.json(formattedResults);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getScansByTime: RequestHandler = async (req, res) => {
  try {
    const { activity_name, interval = "hour", start_time, end_time } = req.query;

    if (!activity_name || typeof activity_name !== "string" || activity_name.trim().length === 0) {
      res.status(400).json({ error: "Valid activity_name is required." });
      return;
    }

    const validIntervals = ["hour", "minute", "day"];
    if (!validIntervals.includes(interval as string)) {
      res.status(400).json({ error: "Invalid interval. Use 'hour', 'minute', or 'day'." });
      return;
    }

    const startTime = start_time ? new Date(start_time as string) : undefined;
    const endTime = end_time ? new Date(end_time as string) : new Date();

    if ((startTime && isNaN(startTime.getTime())) || isNaN(endTime.getTime())) {
      res.status(400).json({ error: "Invalid date format for start_time or end_time." });
      return;
    }

    const activity = await prisma.activity.findFirst({
      where: { name: { equals: activity_name.toLowerCase(), mode: "insensitive" } },
      select: { id: true },
    });

    if (!activity) {
      res.status(404).json({ error: `Activity '${activity_name}' not found.` });
      return;
    }

    const interval_value = interval as 'minute' | 'hour' | 'day';
    
    const query = (await prisma.$queryRawUnsafe(`
      SELECT DATE_TRUNC('${interval_value}', scanned_at) AS time, COUNT(*) AS scan_count
      FROM "Scan"
      WHERE "activityId" = ${activity.id}
      ${startTime ? `AND scanned_at >= '${startTime.toISOString()}'` : ''}
      ${endTime ? `AND scanned_at <= '${endTime.toISOString()}'` : ''}
      GROUP BY time 
      ORDER BY time
    `)) as ScanTimeResult[];

    if (query.length === 0) {
      res.status(404).json({ message: "No scan data found for this activity within the given time range." });
      return;
    }

    const formattedScans = query.map((scan: ScanTimeResult) => ({
      time: scan.time.toISOString().replace("Z", ""),
      scan_count: Number(scan.scan_count),
    }));

    res.json(formattedScans);
  } catch (error) {
    console.error("Error fetching scans by time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};