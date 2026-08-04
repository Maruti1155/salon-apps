import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

const ensureSuperAdmin = (user: any) => {
  if (!user || user.role !== "SUPER_ADMIN") {
    return {
      blocked: true,
      response: {
        success: false,
        message: "Only super admin can manage organizations",
      },
    };
  }

  return { blocked: false };
};

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const guard = ensureSuperAdmin(user);

  if (guard.blocked) {
    return res.status(403).json(guard.response);
  }

  const organizations = await prisma.organization.findMany({
    include: {
      users: true,
      customers: true,
      services: true,
      appointments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ success: true, data: organizations });
});

router.get("/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const guard = ensureSuperAdmin(user);

  if (guard.blocked) {
    return res.status(403).json(guard.response);
  }

  const organization = await prisma.organization.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      users: true,
      customers: true,
      services: true,
      appointments: true,
    },
  });

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    });
  }

  return res.json({ success: true, data: organization });
});

router.post("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const guard = ensureSuperAdmin(user);

  if (guard.blocked) {
    return res.status(403).json(guard.response);
  }

  const { name, slug, logoUrl, address, phone, email } = req.body ?? {};

  if (!name || !slug) {
    return res.status(400).json({
      success: false,
      message: "Name and slug are required",
    });
  }

  const normalizedSlug = String(slug).trim().toLowerCase().replace(/\s+/g, "-");

  const organization = await prisma.organization.create({
    data: {
      name: String(name).trim(),
      slug: normalizedSlug,
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

router.put("/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const guard = ensureSuperAdmin(user);

  if (guard.blocked) {
    return res.status(403).json(guard.response);
  }

  const { id } = req.params;
  const { name, slug, logoUrl, address, phone, email } = req.body ?? {};

  const existing = await prisma.organization.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    });
  }

  const organization = await prisma.organization.update({
    where: { id: Number(id) },
    data: {
      name: name ? String(name).trim() : existing.name,
      slug: slug ? String(slug).trim().toLowerCase().replace(/\s+/g, "-") : existing.slug,
      logoUrl: logoUrl === undefined ? existing.logoUrl : String(logoUrl).trim() || null,
      address: address === undefined ? existing.address : String(address).trim() || null,
      phone: phone === undefined ? existing.phone : String(phone).trim() || null,
      email: email === undefined ? existing.email : String(email).trim() || null,
    },
  });

  return res.json({
    success: true,
    message: "Organization updated successfully",
    data: organization,
  });
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const guard = ensureSuperAdmin(user);

  if (guard.blocked) {
    return res.status(403).json(guard.response);
  }

  const { id } = req.params;

  const existing = await prisma.organization.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    });
  }

  try {
    await prisma.organization.delete({
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "This organization cannot be deleted because it has related records",
    });
  }
});

export default router;
