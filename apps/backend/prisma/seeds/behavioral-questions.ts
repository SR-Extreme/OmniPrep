import type { Difficulty } from "@prisma/client";

export type BehavioralPhaseTypeSeed =
    | "INTRODUCTION"
    | "ICE_BREAKER"
    | "RESUME_DEEP_DIVE"
    | "CORE_BEHAVIORAL"
    | "COMPANY_VALUES"
    | "CANDIDATE_QUESTIONS"
    | "WRAP_UP";

export interface BehavioralPhaseSeed {
    type: BehavioralPhaseTypeSeed;
    title: string;
    description: string;
    totalQuestions: number;
    content: Record<string, unknown>;
}

export interface BehavioralQuestionSeed {
    slug: string;
    title: string;
    description: string;
    companyName: string;
    roleName: string;
    difficulty: Difficulty;
    phases: BehavioralPhaseSeed[];
    isPublished: boolean;
}

function buildStandardPhases(
    companyName: string,
    roleName: string,
    options: {
        introStatement: string;
        wrapUpStatement: string;
        iceBreakerGuidance: string[];
        resumeGuidance: string[];
        coreGuidance: string[];
        valuesGuidance: string[];
    },
): BehavioralPhaseSeed[] {
    return [
        {
            type: "INTRODUCTION",
            title: "Introduction",
            description:
                "The interviewer introduces themselves and explains the format. Upload your resume to begin.",
            totalQuestions: 0,
            content: {
                statement: options.introStatement,
                requiresResumeUpload: true,
            },
        },
        {
            type: "ICE_BREAKER",
            title: "Ice-breaker",
            description:
                "Light opening questions to help the candidate relax and share background.",
            totalQuestions: 2,
            content: {
                generationGuidance: options.iceBreakerGuidance,
            },
        },
        {
            type: "RESUME_DEEP_DIVE",
            title: "Resume Deep Dive",
            description:
                "Project and experience questions based on the candidate resume.",
            totalQuestions: 3,
            content: {
                generationGuidance: options.resumeGuidance,
            },
        },
        {
            type: "CORE_BEHAVIORAL",
            title: "Core Behavioral Questions",
            description:
                "Main behavioral section covering teamwork, conflict, ownership, and leadership.",
            totalQuestions: 3,
            content: {
                generationGuidance: options.coreGuidance,
            },
        },
        {
            type: "COMPANY_VALUES",
            title: "Company Values Questions",
            description:
                "Assess alignment with the company's working style and values.",
            totalQuestions: 2,
            content: {
                generationGuidance: options.valuesGuidance,
            },
        },
        {
            type: "CANDIDATE_QUESTIONS",
            title: "Candidate Questions",
            description:
                "The candidate asks questions; the AI interviewer responds on behalf of the company.",
            totalQuestions: 0,
            content: {
                prompt: "Do you have any questions for me?",
                answerStyle: `Respond as a ${roleName} interviewer at ${companyName} in a realistic, helpful tone.`,
                answerGuidance: [
                    "Answer all candidate questions in one response.",
                    "Be professional and conversational.",
                    "Do not invent confidential internal details.",
                    "If asked about culture, growth, stack, collaboration, or onboarding, answer as a company representative would.",
                ],
            },
        },
        {
            type: "WRAP_UP",
            title: "Wrap Up",
            description: "Close the interview.",
            totalQuestions: 0,
            content: {
                statement: options.wrapUpStatement,
            },
        },
    ];
}

export const BEHAVIORAL_QUESTIONS: BehavioralQuestionSeed[] = [
    {
        slug: "google-software-engineer-behavioral",
        title: "Google — Software Engineer Behavioral Round",
        description: [
            "A Google-style behavioral interview for a Software Engineer / Engineer role.",
            "",
            "You will go through a full interview simulation:",
            "introduction → ice-breaker → resume deep dive → core behavioral → company values → your questions → wrap-up.",
            "",
            "Upload your resume at the start. AI questions will be tailored to Google and this role.",
        ].join("\n"),
        companyName: "Google",
        roleName: "Software Engineer",
        difficulty: "MEDIUM",
        isPublished: true,
        phases: buildStandardPhases("Google", "Software Engineer", {
            introStatement:
                "Hi, I'm Alex, a Software Engineer at Google. Today we'll spend around 30 to 40 minutes discussing your experiences — how you've worked with teams, handled challenges, and approached technical decisions. Please upload your resume and we'll get started.",
            wrapUpStatement:
                "Thanks for taking the time today. I appreciated hearing about your experiences and how you approach teamwork and problem solving at Google. That concludes our round.",
            iceBreakerGuidance: [
                "Ask light opening questions suited to a Google SWE candidate.",
                "Examples: tell me about yourself, what you've been working on recently, why software engineering.",
                "Use resume context when available.",
            ],
            resumeGuidance: [
                "Ask about specific projects, system design choices, scalability, and measurable impact.",
                "Probe technical depth appropriate for Google SWE bar.",
                "Follow up on interesting technical decisions.",
            ],
            coreGuidance: [
                "Frame questions around Googleyness, problem-solving, and collaboration.",
                "Ask for specific examples with clear reasoning and measurable impact.",
                "Sound like a real Google interviewer.",
            ],
            valuesGuidance: [
                "Questions should reflect Google's emphasis on collaboration, user impact, and thoughtful engineering.",
                "Avoid generic motivational questions without Google context.",
            ],
        }),
    },
    {
        slug: "amazon-sde-behavioral",
        title: "Amazon — SDE Behavioral Round",
        description: [
            "An Amazon-style behavioral interview for a Software Development Engineer role.",
            "",
            "Expect questions aligned with Amazon's Leadership Principles, your resume, and SDE-level ownership.",
            "Upload your resume to begin the interview simulation.",
        ].join("\n"),
        companyName: "Amazon",
        roleName: "Software Development Engineer",
        difficulty: "MEDIUM",
        isPublished: true,
        phases: buildStandardPhases("Amazon", "Software Development Engineer", {
            introStatement:
                "Hi, I'm Priya, an SDE at Amazon. We'll spend the next 30 to 40 minutes on behavioral questions focused on how you've handled real situations — ownership, customer impact, and working under pressure. Please upload your resume and we'll begin.",
            wrapUpStatement:
                "Thank you for sharing your experiences today. I enjoyed learning about how you approach ownership and customer-focused decisions. That wraps up our session.",
            iceBreakerGuidance: [
                "Ask opening questions suited to an Amazon SDE candidate.",
                "Keep tone professional and direct.",
                "Use resume context when available.",
            ],
            resumeGuidance: [
                "Ask about projects where the candidate owned end-to-end delivery.",
                "Probe trade-offs, customer impact, and operational excellence.",
                "Follow up on scope, metrics, and what they would improve.",
            ],
            coreGuidance: [
                "Frame questions around Amazon Leadership Principles where natural.",
                "Ask for specific situations with measurable outcomes.",
                "Sound like a real Amazon interviewer.",
            ],
            valuesGuidance: [
                "Questions must reflect Amazon's Leadership Principles and SDE expectations.",
                "Avoid generic culture questions without Amazon context.",
            ],
        }),
    },
    {
        slug: "microsoft-software-engineer-behavioral",
        title: "Microsoft — Software Engineer Behavioral Round",
        description: [
            "A Microsoft-style behavioral interview for a Software Engineer role.",
            "",
            "Covers collaboration, growth mindset, technical depth from your resume, and company-fit questions.",
            "Upload your resume to start.",
        ].join("\n"),
        companyName: "Microsoft",
        roleName: "Software Engineer",
        difficulty: "EASY",
        isPublished: true,
        phases: buildStandardPhases("Microsoft", "Software Engineer", {
            introStatement:
                "Hi, I'm Jordan, a Software Engineer at Microsoft. Today we'll discuss your background, how you collaborate with teams, and how you handle challenges in your work. The session should take about 30 minutes. Please upload your resume to proceed.",
            wrapUpStatement:
                "Thanks for your time today. I appreciated your thoughtful answers and examples from your experience. That concludes our interview.",
            iceBreakerGuidance: [
                "Ask friendly opening questions suited to a Microsoft SWE candidate.",
                "Examples: tell me about yourself, recent projects, why Microsoft or why this role.",
            ],
            resumeGuidance: [
                "Ask about projects, collaboration across teams, and technical decisions.",
                "Probe how the candidate handled ambiguity or changing requirements.",
            ],
            coreGuidance: [
                "Frame questions around growth mindset, customer obsession, and teamwork.",
                "Ask for real situations that demonstrate ownership and measurable results.",
                "Sound like a real Microsoft interviewer.",
            ],
            valuesGuidance: [
                "Questions should reflect Microsoft's culture of growth mindset and inclusive collaboration.",
            ],
        }),
    },
];