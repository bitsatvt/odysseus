import { PrismaClient } from "@prisma/client";

// Note: prisma instance must be singleton
const prisma = new PrismaClient();

export default prisma;
