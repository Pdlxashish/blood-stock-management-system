import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export const getAllUsers = async (req: Request, res: Response) => {
  const { role } = req.query;

  const users = await prisma.user.findMany({
    where: {
      ...(role && { role: role as any }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ status: "success", data: users });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: id as string },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      donor: true,
      donations: true,
      certificates: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ status: "success", data: user });
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password, name, phone, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  const user = await prisma.user.create({
    data: {
      email,
      password, // In production, hash this password
      name,
      phone,
      role: role || "DONOR",
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({ status: "success", data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const user = await prisma.user.update({
    where: { id: id as string },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  res.json({ status: "success", data: user });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id: id as string },
  });

  res.json({ status: "success", message: "User deleted successfully" });
};

// Get user's event participations
export const getUserEventParticipations = async (req: Request, res: Response) => {
  const { id } = req.params;

  const participations = await prisma.eventParticipant.findMany({
    where: { userId: id as string },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
          location: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ status: "success", data: participations });
};

// Get user's event volunteer records
export const getUserEventVolunteers = async (req: Request, res: Response) => {
  const { id } = req.params;

  const volunteers = await prisma.eventVolunteer.findMany({
    where: { userId: id as string },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
          location: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ status: "success", data: volunteers });
};
