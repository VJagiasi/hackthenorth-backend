import { RequestHandler } from 'express';
import prisma from '../utils/prisma';

// Function to validate badge_code format (must be four words separated by hyphens)
const validateBadgeCode = (badgeCode: string): boolean => {
    return /^[A-Za-z]+-[A-Za-z]+-[A-Za-z]+-[A-Za-z]+$/.test(badgeCode);
};

// Function to format timestamps correctly
const formatTimestamps = (timestamp: Date) => timestamp.toISOString().replace("Z", "");

// ✅ Check-in a user
export const checkInUser: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.badge_code) {
      res.status(400).json({ error: "You must have a valid badge to check in." });
      return;
    }

    if (user.checked_in) {
      res.status(400).json({ error: "User is already checked in." });
      return;
    }

    // ✅ Update user to be checked in
    await prisma.user.update({
      where: { email },
      data: { checked_in: true, updated_at: new Date() },
    });

    res.status(200).json({ message: "User has successfully checked in." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Check-out a user
export const checkOutUser: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.checked_in) {
      res.status(400).json({ error: "User is already checked out." });
      return;
    }

    // ✅ Update user to be checked out
    await prisma.user.update({
      where: { email },
      data: { checked_in: false, updated_at: new Date() },
    });

    res.status(200).json({ message: "User has successfully checked out." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Function to format scans correctly
const formatScans = (scans: any[]) => {
    return scans.map(scan => ({
        activity_name: scan.activity.name,
        activity_category: scan.activity.category,
        scanned_at: formatTimestamps(scan.scanned_at),
    }));
};

interface UserWithScans {
  name: string;
  email: string;
  phone: string;
  badge_code: string | null;
  updated_at: Date;
  scans: {
    activity: {
      name: string;
      category: string;
    };
    scanned_at: Date;
  }[];
}

export const getAllUsers: RequestHandler = async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          phone: true,
          badge_code: true,
          updated_at: true,  // Include updated_at field
          scans: {
            select: {
              activity: {
                select: {
                  name: true,  // activity_name
                  category: true, // activity_category
                }
              },
              scanned_at: true,
            },
          },
        },
      });

      // Format timestamps properly
      const formattedUsers = users.map((user: UserWithScans) => ({
        ...user,
        updated_at: formatTimestamps(user.updated_at),
        scans: formatScans(user.scans),
      }));

      res.json(formattedUsers);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
};

export const getUserByEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
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

    const formattedUser = {
      ...user,
      updated_at: formatTimestamps(user.updated_at),
      scans: formatScans(user.scans),
    };

    res.json(formattedUser);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;
    const updatedData = req.body;

    if (Object.keys(updatedData).length === 0) {
      res.status(400).json({ error: "No fields provided to update." });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
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

      const badgeExists = await prisma.user.findFirst({
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
        const emailExists = await prisma.user.findFirst({
            where: { email: updatedData.email },
        });

        if (emailExists) {
            res.status(400).json({ error: "Email is already taken by another user." });
            return;
        }
    }

    // Prepare update object
    const fieldsToUpdate = { ...updatedData, updated_at: new Date() };

    // ✅ Update the user
    const updatedUser = await prisma.user.update({
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
    const formattedUser = {
        ...updatedUser,
        updated_at: formatTimestamps(updatedUser.updated_at),
        scans: updatedUser.scans.map((scan: { 
          activity: { name: string; category: string; }; 
          scanned_at: Date; 
        }) => ({
          activity_name: scan.activity.name,
          activity_category: scan.activity.category,
          scanned_at: formatTimestamps(scan.scanned_at),
        })),
    };

    res.json(formattedUser);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};