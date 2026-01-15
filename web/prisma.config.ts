import { defineConfig } from 'prisma/config'

export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/odysseus-prisma";

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: DATABASE_URL,
    },
})
