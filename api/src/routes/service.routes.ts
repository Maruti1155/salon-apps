import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (_req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    success: true,
    data: services,
  });
});

router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const service = await prisma.service.findUnique({
    where: { id: Number(id) },
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  return res.json({
    success: true,
    data: service,
  });
});

router.post("/", authMiddleware, async (req, res) => {
  const { name, description, duration, price, isActive } = req.body ?? {};

  if (!name || !duration || !price) {
    return res.status(400).json({
      success: false,
      message: "Name, duration, and price are required",
    });
  }

  const service = await prisma.service.create({
    data: {
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      duration: Number(duration),
      price: Number(price),
      isActive: isActive === undefined ? true : Boolean(isActive),
    },
  });

  return res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, duration, price, isActive } = req.body ?? {};

  const existingService = await prisma.service.findUnique({
    where: { id: Number(id) },
  });

  if (!existingService) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  const service = await prisma.service.update({
    where: { id: Number(id) },
    data: {
      name: name ? String(name).trim() : existingService.name,
      description:
        description === undefined ? existingService.description : String(description).trim(),
      duration: duration !== undefined ? Number(duration) : existingService.duration,
      price: price !== undefined ? Number(price) : existingService.price,
      isActive: isActive !== undefined ? Boolean(isActive) : existingService.isActive,
    },
  });

  return res.json({
    success: true,
    message: "Service updated successfully",
    data: service,
  });
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const existingService = await prisma.service.findUnique({
    where: { id: Number(id) },
  });

  if (!existingService) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  await prisma.service.delete({
    where: { id: Number(id) },
  });

  return res.json({
    success: true,
    message: "Service deleted successfully",
  });
});

export default router;
