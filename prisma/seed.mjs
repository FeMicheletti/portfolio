import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function getRequiredEnv(name) {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${name}`);

    return value;
}

function createDatabaseAdapter() {
    const databaseUrl = new URL(getRequiredEnv("DATABASE_URL"));
    if (databaseUrl.protocol !== "mysql:") throw new Error("DATABASE_URL must use the mysql:// protocol.");

    const database = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
    if (!database) throw new Error("DATABASE_URL must include a database name.");

    return new PrismaMariaDb({
        host: databaseUrl.hostname,
        port: Number(databaseUrl.port || 3306),
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        database,
        connectionLimit: 5,
    });
}

const prisma = new PrismaClient({
    adapter: createDatabaseAdapter(),
});

const categories = [
    { slug: "frontend", namePt: "Frontend", nameEn: "Frontend", sortOrder: 10 },
    { slug: "backend", namePt: "Backend", nameEn: "Backend", sortOrder: 20 },
    { slug: "mobile", namePt: "Mobile", nameEn: "Mobile", sortOrder: 30 },
    { slug: "databases", namePt: "Bancos de dados", nameEn: "Databases", sortOrder: 40 },
    { slug: "cloud-devops", namePt: "Cloud e DevOps", nameEn: "Cloud & DevOps", sortOrder: 50 },
    { slug: "tools", namePt: "Ferramentas", nameEn: "Tools", sortOrder: 60 },
];

const technologies = [
    { categorySlug: "frontend", name: "React", slug: "react", iconKey: "react", color: "#61DAFB", sortOrder: 10 },
    { categorySlug: "frontend", name: "Next.js", slug: "nextjs", iconKey: "nextdotjs", color: "#FFFFFF", sortOrder: 20 },
    { categorySlug: "frontend", name: "Vue.js", slug: "vuejs", iconKey: "vuedotjs", color: "#4FC08D", sortOrder: 30 },
    { categorySlug: "frontend", name: "TypeScript", slug: "typescript", iconKey: "typescript", color: "#3178C6", sortOrder: 40 },
    { categorySlug: "backend", name: "Node.js", slug: "nodejs", iconKey: "nodedotjs", color: "#5FA04E", sortOrder: 10 },
    { categorySlug: "backend", name: "NestJS", slug: "nestjs", iconKey: "nestjs", color: "#E0234E", sortOrder: 20 },
    { categorySlug: "backend", name: "Java", slug: "java", iconKey: "openjdk", color: "#ED8B00", sortOrder: 30 },
    { categorySlug: "backend", name: "Spring Boot", slug: "spring-boot", iconKey: "springboot", color: "#6DB33F", sortOrder: 40 },
    { categorySlug: "backend", name: "PHP", slug: "php", iconKey: "php", color: "#777BB4", sortOrder: 50 },
    { categorySlug: "backend", name: "Laravel", slug: "laravel", iconKey: "laravel", color: "#FF2D20", sortOrder: 60 },
    { categorySlug: "mobile", name: "React Native", slug: "react-native", iconKey: "react", color: "#61DAFB", sortOrder: 10 },
    { categorySlug: "databases", name: "MySQL", slug: "mysql", iconKey: "mysql", color: "#4479A1", sortOrder: 10 },
    { categorySlug: "databases", name: "PostgreSQL", slug: "postgresql", iconKey: "postgresql", color: "#4169E1", sortOrder: 20 },
    { categorySlug: "databases", name: "MongoDB", slug: "mongodb", iconKey: "mongodb", color: "#47A248", sortOrder: 30 },
    { categorySlug: "databases", name: "Firebase", slug: "firebase", iconKey: "firebase", color: "#DD2C00", sortOrder: 40 },
    { categorySlug: "cloud-devops", name: "AWS", slug: "aws", iconKey: "amazonwebservices", color: "#FF9900", sortOrder: 10 },
    { categorySlug: "cloud-devops", name: "Docker", slug: "docker", iconKey: "docker", color: "#2496ED", sortOrder: 20 },
    { categorySlug: "cloud-devops", name: "GitHub Actions", slug: "github-actions", iconKey: "githubactions", color: "#2088FF", sortOrder: 30 },
    { categorySlug: "tools", name: "Prisma", slug: "prisma", iconKey: "prisma", color: "#2D3748", sortOrder: 10 },
    { categorySlug: "tools", name: "Swagger / OpenAPI", slug: "swagger-openapi", iconKey: "swagger", color: "#85EA2D", sortOrder: 20 },
];

async function seedAdmin() {
    const email = getRequiredEnv("ADMIN_EMAIL").toLowerCase();
    const password = getRequiredEnv("ADMIN_PASSWORD");
    const name = process.env.ADMIN_NAME?.trim() || "Felipe Micheletti";

    if (password.length < 10) throw new Error("ADMIN_PASSWORD must contain at least 10 characters.");

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.adminUser.upsert({
        where: { email },
        update: {
            name,
            passwordHash,
            active: true,
        },
        create: {
            name,
            email,
            passwordHash,
        },
    });
}

async function seedTechnologies() {
    const categoryIds = new Map();

    for (const category of categories) {
        const savedCategory = await prisma.technologyCategory.upsert({
            where: { slug: category.slug },
            update: {
                namePt: category.namePt,
                nameEn: category.nameEn,
                sortOrder: category.sortOrder,
            },
            create: category,
        });

        categoryIds.set(category.slug, savedCategory.id);
    }

    for (const technology of technologies) {
        const categoryId = categoryIds.get(technology.categorySlug);

        if (!categoryId) throw new Error(`Category not found for technology: ${technology.name}`);

        const technologyData = {
            name: technology.name,
            slug: technology.slug,
            iconKey: technology.iconKey,
            color: technology.color,
            sortOrder: technology.sortOrder,
        };

        await prisma.technology.upsert({
            where: { slug: technology.slug },
            update: {
                ...technologyData,
                categoryId,
            },
            create: {
                ...technologyData,
                categoryId,
            },
        });
    }
}

async function main() {
    await seedAdmin();
    await seedTechnologies();

    console.log(`Seed completed: 1 admin, ${categories.length} categories and ${technologies.length} technologies.`);
}

main()
    .catch((error) => {
        console.error("Seed failed.", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
