import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import prisma from '../utils/prisma';

export const createActivity: RequestHandler = async (req, res) => {
  try {
    const { name, category } = req.body;
    const activity = await prisma.activity.create({
      data: { name, category },
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create activity' });
  }
};

export const getActivities: RequestHandler = async (_req, res) => {
  try {
    const activities = await prisma.activity.findMany();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const getActivityById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
      include: { scans: true },
    });
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

export const updateActivityOneScan: RequestHandler = async (req, res) => {
  try {
    const { activity_name } = req.params;
    const { one_scan_only } = req.body;

    if (typeof one_scan_only !== "boolean") {
      res.status(400).json({ error: "one_scan_only must be a boolean value." });
      return;
    }

    const activity = await prisma.activity.findUnique({ where: { name: activity_name } });
    if (!activity) {
      res.status(404).json({ error: `Activity '${activity_name}' not found.` });
      return;
    }

    const updatedActivity = await prisma.activity.update({
      where: { name: activity_name },
      data: { one_scan_only },
      select: { name: true, category: true, one_scan_only: true },
    });

    res.status(200).json(updatedActivity);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};