import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, Prisma, type Difficulty } from "@prisma/client";
import type { ProblemSeedFile } from "./seeds/types.js";
import type { EvaluationMetric } from "../src/types/system-design.types.js";

const prisma = new PrismaClient();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROBLEMS_DIR = join(__dirname, "seeds", "problems");

interface SystemDesignQuestionSeed {
    slug: string;
    title: string;
    description: string;
    requirements: {
        functional: string[];
        nonFunctional: string[];
    };
    deliverables: string[];
    constraints: string[];
    scaleFactors: string[];
    difficulty: Difficulty;
    topics: string[];
    hints: string[];
    evaluationMetrics: EvaluationMetric[];
    isPublished: boolean;
}

const SYSTEM_DESIGN_QUESTIONS: SystemDesignQuestionSeed[] = [
    {
        slug: "design-url-shortener",
        title: "Design a URL Shortener",
        description: [
            "Design a URL shortening service similar to bit.ly or TinyURL.",
            "",
            "Read the requirements, deliverables, and constraints below. Use the scale factors as",
            "back-of-the-envelope guidance — state any assumptions you make explicitly.",
            "",
            "Recommended approach:",
            "1) Clarify scope and traffic profile",
            "2) Present high-level architecture and request flow",
            "3) Define APIs and data model",
            "4) Explain caching, scaling, and reliability",
            "5) Close with trade-offs and alternatives",
            "",
            "Answer in text, upload a diagram, or both.",
        ].join("\n"),
        requirements: {
            functional: [
                "Shorten long URLs into compact links",
                "Redirect users from short URLs to original URLs",
                "Support optional custom aliases",
                "Track basic click analytics",
            ],
            nonFunctional: [
                "Low latency redirects",
                "High availability",
                "Horizontal scalability",
                "Fault tolerance",
            ],
        },
        deliverables: [
            "High-level architecture",
            "APIs",
            "Database choice",
            "Data model",
            "Caching strategy",
            "Scaling approach",
            "Reliability plan",
            "Trade-offs",
        ],
        constraints: [
            "Assume global traffic with a read-heavy redirect workload",
            "Short codes must be URL-safe",
            "Analytics may be eventually consistent",
        ],
        scaleFactors: [
            "Assume ~10M daily active users (DAU) and ~300M monthly active users (MAU)",
            "Assume ~100K new short URLs created per day (~1% of DAU)",
            "Assume ~50M redirect requests per day (~5 redirects per DAU)",
            "Hot cache target: top 1M URLs at ~500 bytes per mapping (~500 MB RAM)",
            "Redirect bandwidth: ~50M requests/day × ~700 bytes ≈ 35 GB/day (peak ~5 MB/s)",
            "Persistent storage growth: ~100K new URLs/day × ~500 bytes ≈ 50 MB/day (~50 GB/year with indexes and overhead)",
        ],
        difficulty: "MEDIUM",
        topics: ["Caching", "Databases", "API Design", "Scalability"],
        hints: [
            "Separate read (redirect) and write (create) paths early",
            "Discuss collision handling for custom aliases",
            "Address cache invalidation and hot-key mitigation",
        ],
        evaluationMetrics: [
            {
                id: "highLevelDesign",
                title: "High-Level Architecture",
                weight: 15,
                criteria: [
                    "Identifies core components (API, storage, cache, analytics)",
                    "Explains clear redirect and create flows",
                    "Shows sensible separation of responsibilities",
                ],
            },
            {
                id: "apiDesign",
                title: "APIs",
                weight: 10,
                criteria: [
                    "Defines create, redirect, and analytics endpoints",
                    "Covers request/response shapes and error cases",
                    "Handles custom alias and invalid URL scenarios",
                ],
            },
            {
                id: "databaseChoice",
                title: "Database Choice",
                weight: 10,
                criteria: [
                    "Justifies storage technology for URL mappings",
                    "Explains read vs write access patterns",
                    "Mentions replication or partitioning where relevant",
                ],
            },
            {
                id: "dataModel",
                title: "Data Model",
                weight: 10,
                criteria: [
                    "Defines entities and key fields for mappings and analytics",
                    "Explains key generation and uniqueness strategy",
                    "Supports efficient lookup by short code",
                ],
            },
            {
                id: "caching",
                title: "Caching Strategy",
                weight: 15,
                criteria: [
                    "Caches hot redirect paths appropriately",
                    "Explains eviction and invalidation strategy",
                    "Addresses hot-key and thundering herd risks",
                ],
            },
            {
                id: "scaling",
                title: "Scaling Approach",
                weight: 15,
                criteria: [
                    "Scales read-heavy redirect traffic horizontally",
                    "Handles write growth for new URL creation",
                    "Uses load balancing and stateless services where appropriate",
                ],
            },
            {
                id: "reliability",
                title: "Reliability Plan",
                weight: 10,
                criteria: [
                    "Plans for component and regional failures",
                    "Avoids single points of failure in critical paths",
                    "Defines graceful degradation behavior",
                ],
            },
            {
                id: "tradeoffs",
                title: "Trade-offs",
                weight: 15,
                criteria: [
                    "Compares meaningful alternatives (e.g. ID generation, DB, cache)",
                    "Explains pros and cons of chosen approach",
                    "Connects trade-offs to stated requirements",
                ],
            },
        ],
        isPublished: true,
    },
    {
        slug: "design-instagram-feed",
        title: "Design Instagram News Feed",
        description: [
            "Design the core news feed for a photo-sharing app like Instagram.",
            "",
            "Explain how a user opens the app and sees a personalized feed of posts from people they follow.",
            "Cover fan-out strategy, storage, ranking, and media delivery.",
            "",
            "Proceed in layers: requirements → architecture → APIs → data model → feed generation →",
            "caching/CDN → scaling → reliability → trade-offs.",
            "",
            "Use scale factors for estimation. Text, diagram, or both are accepted.",
        ].join("\n"),
        requirements: {
            functional: [
                "Upload and view images/videos",
                "Follow users and view a personalized home feed",
                "Like and comment on posts",
                "Paginate feed results",
            ],
            nonFunctional: [
                "Low latency feed load",
                "High availability",
                "Scalability for celebrity/hot accounts",
                "Durable media storage",
            ],
        },
        deliverables: [
            "High-level architecture",
            "Feed generation strategy",
            "APIs",
            "Database and data model",
            "Media storage and CDN approach",
            "Caching",
            "Scaling strategy",
            "Trade-offs",
        ],
        constraints: [
            "Assume millions of daily active users",
            "Feed is read-heavy compared to writes",
            "Eventual consistency is acceptable for non-critical counters",
        ],
        scaleFactors: [
            "Assume ~500M DAU and ~1B+ total users",
            "Assume average user follows ~200 accounts",
            "Assume ~100M new posts per day globally",
            "Assume each feed page returns ~20 posts",
            "Assume ~5B feed reads per day (multiple opens per DAU)",
            "Media storage grows by terabytes daily — plan tiered/hot-cold storage",
        ],
        difficulty: "HARD",
        topics: ["Feed", "Caching", "Databases", "CDN", "Scalability"],
        hints: [
            "Compare fan-out on write vs fan-out on read vs hybrid",
            "Address celebrity accounts and feed staleness",
            "Treat ranking as a separate pipeline from feed assembly",
        ],
        evaluationMetrics: [
            {
                id: "highLevelDesign",
                title: "High-Level Architecture",
                weight: 15,
                criteria: [
                    "Identifies services for posts, feed, media, social graph, and ranking",
                    "Shows end-to-end flow from post creation to feed read",
                    "Separates hot paths from background pipelines",
                ],
            },
            {
                id: "feedGeneration",
                title: "Feed Generation Strategy",
                weight: 15,
                criteria: [
                    "Chooses and justifies push, pull, or hybrid fan-out",
                    "Handles normal users vs celebrity/hot accounts",
                    "Explains precomputation vs on-demand assembly",
                ],
            },
            {
                id: "apiDesign",
                title: "APIs",
                weight: 10,
                criteria: [
                    "Defines feed, post, follow, and media endpoints",
                    "Supports pagination and consistent ordering",
                    "Covers failure and timeout behavior",
                ],
            },
            {
                id: "databaseAndDataModel",
                title: "Database and Data Model",
                weight: 15,
                criteria: [
                    "Models users, posts, follows, feeds, and engagement",
                    "Matches schema to read/write patterns",
                    "Explains sharding or partitioning strategy",
                ],
            },
            {
                id: "mediaStorageAndCdn",
                title: "Media Storage and CDN Approach",
                weight: 10,
                criteria: [
                    "Stores and serves images/videos efficiently",
                    "Uses CDN or edge caching for media delivery",
                    "Addresses upload pipeline and transcoding if relevant",
                ],
            },
            {
                id: "caching",
                title: "Caching",
                weight: 10,
                criteria: [
                    "Caches feed pages or feed fragments appropriately",
                    "Reduces load on origin services and databases",
                    "Handles cache invalidation on new posts",
                ],
            },
            {
                id: "scaling",
                title: "Scaling Strategy",
                weight: 10,
                criteria: [
                    "Scales feed reads under peak traffic",
                    "Handles write spikes from popular accounts",
                    "Uses horizontal scaling and async processing",
                ],
            },
            {
                id: "tradeoffs",
                title: "Trade-offs",
                weight: 15,
                criteria: [
                    "Compares fan-out and storage alternatives",
                    "Discusses freshness vs cost vs latency",
                    "Links decisions to product requirements",
                ],
            },
        ],
        isPublished: true,
    },
    {
        slug: "design-rate-limiter",
        title: "Design a Distributed Rate Limiter",
        description: [
            "Design a distributed rate limiting service that protects APIs from abuse.",
            "",
            "Define how limits are enforced per user, IP, or API key across multiple application servers.",
            "Explain algorithm choice, storage, synchronization, and edge cases such as clock skew",
            "and burst traffic.",
            "",
            "Structure your answer around requirements, architecture, APIs, storage, coordination,",
            "failure modes, and trade-offs. Diagrams are welcome if they clarify your design.",
        ].join("\n"),
        requirements: {
            functional: [
                "Enforce request limits per client identity",
                "Support multiple rate limit rules",
                "Return clear allow/deny decisions",
                "Expose current usage metadata",
            ],
            nonFunctional: [
                "Low overhead per request",
                "High availability",
                "Horizontal scalability",
                "Minimal false negatives during normal operation",
            ],
        },
        deliverables: [
            "High-level architecture",
            "Rate limiting algorithm",
            "APIs",
            "Storage design",
            "Distributed coordination approach",
            "Failure handling",
            "Trade-offs",
        ],
        constraints: [
            "Must work across multiple data centers",
            "Prefer approximate enforcement over global strong consistency if needed",
            "Decision latency budget under 5 ms per check",
        ],
        scaleFactors: [
            "Assume ~100K protected API endpoints across services",
            "Assume ~50K requests per second aggregate at peak",
            "Assume ~10M unique client identities (users/keys/IPs) active per hour",
            "Assume each rate check adds at most ~1–2 ms overhead",
            "Assume 99.9% availability target for the limiter service",
        ],
        difficulty: "MEDIUM",
        topics: ["Rate Limiting", "Redis", "Distributed Systems", "API Design"],
        hints: [
            "Compare token bucket, leaky bucket, and sliding window",
            "Discuss Redis vs local memory trade-offs",
            "Explain behavior during partial outages",
        ],
        evaluationMetrics: [
            {
                id: "highLevelDesign",
                title: "High-Level Architecture",
                weight: 20,
                criteria: [
                    "Shows how apps consult the limiter on each request",
                    "Identifies control plane vs data plane if applicable",
                    "Keeps the check path low-latency and stateless where possible",
                ],
            },
            {
                id: "rateLimitingAlgorithm",
                title: "Rate Limiting Algorithm",
                weight: 15,
                criteria: [
                    "Chooses an appropriate algorithm (token bucket, sliding window, etc.)",
                    "Explains burst handling and window boundaries",
                    "Discusses accuracy vs performance trade-offs",
                ],
            },
            {
                id: "apiDesign",
                title: "APIs",
                weight: 15,
                criteria: [
                    "Defines check, configure, and query usage interfaces",
                    "Returns actionable allow/deny responses with metadata",
                    "Supports multiple rule types and scopes",
                ],
            },
            {
                id: "storageDesign",
                title: "Storage Design",
                weight: 15,
                criteria: [
                    "Stores counters or tokens efficiently at scale",
                    "Matches storage to access pattern (high write/read churn)",
                    "Plans TTL and memory bounds",
                ],
            },
            {
                id: "distributedCoordination",
                title: "Distributed Coordination Approach",
                weight: 15,
                criteria: [
                    "Synchronizes limits across nodes and regions",
                    "Handles race conditions and concurrent increments",
                    "Explains consistency level and acceptable drift",
                ],
            },
            {
                id: "failureHandling",
                title: "Failure Handling",
                weight: 10,
                criteria: [
                    "Defines fail-open vs fail-closed policy with rationale",
                    "Handles Redis/storage outages gracefully",
                    "Avoids cascading failures in protected services",
                ],
            },
            {
                id: "tradeoffs",
                title: "Trade-offs",
                weight: 10,
                criteria: [
                    "Compares central vs edge enforcement",
                    "Discusses accuracy vs latency vs cost",
                    "Justifies final design against requirements",
                ],
            },
        ],
        isPublished: true,
    },
];

function toInputJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
}

function loadProblemFiles(): ProblemSeedFile[] {
    const files = readdirSync(PROBLEMS_DIR)
        .filter((name) => name.endsWith(".json"))
        .sort();

    return files.map((filename) => {
        const raw = readFileSync(join(PROBLEMS_DIR, filename), "utf8");
        return JSON.parse(raw) as ProblemSeedFile;
    });
}

async function upsertProblem(problem: ProblemSeedFile): Promise<void> {
    await prisma.problem.upsert({
        where: { slug: problem.slug },
        create: {
            slug: problem.slug,
            title: problem.title,
            description: problem.description,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            constraints: problem.constraints,
            examples: toInputJson(problem.examples),
            difficulty: problem.difficulty as Difficulty,
            topics: problem.topics,
            timeLimitMs: problem.timeLimitMs,
            memoryLimitKb: problem.memoryLimitKb,
            starterCode: toInputJson(problem.starterCode),
            solutionCode: toInputJson(problem.solutionCode),
            hints: problem.hints,
            isPublished: problem.isPublished,
            testCases: {
                create: problem.testCases.map((tc) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    explanation: tc.explanation ?? null,
                    isHidden: tc.isHidden,
                    order: tc.order,
                })),
            },
        },
        update: {
            title: problem.title,
            description: problem.description,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            constraints: problem.constraints,
            examples: toInputJson(problem.examples),
            difficulty: problem.difficulty as Difficulty,
            topics: problem.topics,
            timeLimitMs: problem.timeLimitMs,
            memoryLimitKb: problem.memoryLimitKb,
            starterCode: toInputJson(problem.starterCode),
            solutionCode: toInputJson(problem.solutionCode),
            hints: problem.hints,
            isPublished: problem.isPublished,
            testCases: {
                deleteMany: {},
                create: problem.testCases.map((tc) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    explanation: tc.explanation ?? null,
                    isHidden: tc.isHidden,
                    order: tc.order,
                })),
            },
        },
    });
}

interface SystemDesignQuestionWriteData {
    title: string;
    description: string;
    requirements: Prisma.InputJsonValue;
    deliverables: Prisma.InputJsonValue;
    constraints: string[];
    scaleFactors: string[];
    difficulty: Difficulty;
    topics: string[];
    hints: string[];
    evaluationMetrics: Prisma.InputJsonValue;
    isPublished: boolean;
}

function buildSystemDesignQuestionWriteData(
    question: SystemDesignQuestionSeed,
): SystemDesignQuestionWriteData {
    return {
        title: question.title,
        description: question.description,
        requirements: toInputJson(question.requirements),
        deliverables: toInputJson(question.deliverables),
        constraints: question.constraints,
        scaleFactors: question.scaleFactors,
        difficulty: question.difficulty,
        topics: question.topics,
        hints: question.hints,
        evaluationMetrics: toInputJson(question.evaluationMetrics),
        isPublished: question.isPublished,
    };
}

async function upsertSystemDesignQuestion(
    question: SystemDesignQuestionSeed,
): Promise<void> {
    const writeData = buildSystemDesignQuestionWriteData(question);

    await prisma.systemDesignQuestion.upsert({
        where: { slug: question.slug },
        create: {
            slug: question.slug,
            ...writeData,
        } as Prisma.SystemDesignQuestionCreateInput,
        update: writeData as Prisma.SystemDesignQuestionUpdateInput,
    });
}

async function main(): Promise<void> {
    const problems = loadProblemFiles();

    console.log(`Seeding ${problems.length} problems...`);

    for (const problem of problems) {
        await upsertProblem(problem);
        console.log(`  ✓ ${problem.slug}`);
    }

    console.log(`Seeding ${SYSTEM_DESIGN_QUESTIONS.length} system design questions...`);

    for (const question of SYSTEM_DESIGN_QUESTIONS) {
        await upsertSystemDesignQuestion(question);
        console.log(`  ✓ ${question.slug}`);
    }

    const [problemCount, testCaseCount, systemDesignQuestionCount] = await Promise.all([
        prisma.problem.count(),
        prisma.testCase.count(),
        prisma.systemDesignQuestion.count(),
    ]);

    console.log(`Done. Problems: ${problemCount}, Test cases: ${testCaseCount}, System design questions: ${systemDesignQuestionCount},`);
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
