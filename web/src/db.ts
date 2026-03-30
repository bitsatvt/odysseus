import { PrismaClient } from "../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DATABASE_URL } from "../prisma.config";
const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};
const adapter = new PrismaPg({
    connectionString: DATABASE_URL,
});
const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma; 