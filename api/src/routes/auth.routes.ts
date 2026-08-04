import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "salon-super-secret-key-2026";

const createToken = (user: { id: number; email: string; role: string; organizationId?: number | null }) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ?? null,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    organizationName,
    organizationSlug,
    organizationPhone,
    organizationEmail,
  } = req.body ?? {};

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "First name, last name, email, and password are required",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);

  const organization = organizationName
    ? await prisma.organization.upsert({
        where: { slug: String(organizationSlug || organizationName).trim().toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: {
          name: String(organizationName).trim(),
          slug: String(organizationSlug || organizationName).trim().toLowerCase().replace(/\s+/g, "-"),
          phone: organizationPhone ? String(organizationPhone).trim() : null,
          email: organizationEmail ? String(organizationEmail).trim().toLowerCase() : null,
        },
      })
    : null;

  const user = await prisma.user.create({
    data: {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      organizationId: organization?.id ?? null,
    },
  });

  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  });

  return res.json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  });
});

router.post("/create-user", authMiddleware, async (req, res) => {
  const actor = (req as any).user;

  if (!actor || (actor.role !== "SUPER_ADMIN" && actor.role !== "ADMIN")) {
    return res.status(403).json({
      success: false,
      message: "Only super admin or admin can create users",
    });
  }

  const { firstName, lastName, email, password, role, organizationId } = req.body ?? {};

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "First name, last name, email, password and role are required",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  const targetOrgId = actor.role === "SUPER_ADMIN"
    ? organizationId !== undefined
      ? Number(organizationId)
      : null
    : actor.organizationId ?? null;

  if (actor.role !== "SUPER_ADMIN" && !targetOrgId) {
    return res.status(400).json({
      success: false,
      message: "Admin user must belong to an organization",
    });
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);
  const normalizedRole = String(role).toUpperCase();

  if (!Object.values(Role).includes(normalizedRole as Role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role selected",
    });
  }

  const newUser = await prisma.user.create({
    data: {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole as Role,
      organizationId: targetOrgId,
      parentId: actor.id,
    },
  });

  const token = createToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    organizationId: newUser.organizationId,
  });

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    token,
    user: {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      organizationId: newUser.organizationId,
    },
  });
});

export default router;