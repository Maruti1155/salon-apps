import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  if (!user || user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only super admin can manage organizations",
    });
  }

  const organizations = await prisma.organization.findMany({
    include: {
      users: true,
      customers: true,
      services: true,
    },
  });

  return res.json({ success: true, data: organizations });
});

router.post("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  if (!user || user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only super admin can create organizations",
    });
  }

  const { name, slug, logoUrl, address, phone, email } = req.body ?? {};

  if (!name || !slug) {
    return res.status(400).json({
      success: false,
      message: "Name and slug are required",
    });
  }

  const organization = await prisma.organization.create({
    data: {
      name: String(name).trim(),
      slug: String(slug).trim(),
      logoUrl: logoUrl ? String(logoUrl).trim() : null,
      address: address ? String(address).trim() : null,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Organization created successfully",
    data: organization,
  });
});

export default router;
