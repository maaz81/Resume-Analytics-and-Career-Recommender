import { useState } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

const courses = [
    {
        id: 1,
        tag: "Beginner",
        tagColor: "bg-status-success-light text-status-success-dark",
        title: "React Fundamentals",
        description: "Master component design, hooks, and state management from the ground up.",
        lessons: 24,
        hours: "12h 30m",
        level: "Beginner",
        icon: "⚛",
    },
    {
        id: 2,
        tag: "Intermediate",
        tagColor: "bg-status-info-light text-status-info-dark",
        title: "Node.js & Express API",
        description: "Build scalable RESTful APIs with authentication, middleware, and databases.",
        lessons: 31,
        hours: "18h 45m",
        level: "Intermediate",
        icon: "🟢",
    },
    {
        id: 3,
        tag: "Advanced",
        tagColor: "bg-status-warning-light text-status-warning-dark",
        title: "System Design Mastery",
        description: "Design high-traffic distributed systems — caching, queues, sharding, and more.",
        lessons: 18,
        hours: "22h 00m",
        level: "Advanced",
        icon: "🏗",
    },
    {
        id: 4,
        tag: "Beginner",
        tagColor: "bg-status-success-light text-status-success-dark",
        title: "TypeScript Deep Dive",
        description: "From basic types to generics, decorators, and real-world patterns.",
        lessons: 20,
        hours: "10h 15m",
        level: "Beginner",
        icon: "🔷",
    },
    {
        id: 5,
        tag: "Intermediate",
        tagColor: "bg-status-info-light text-status-info-dark",
        title: "PostgreSQL & Prisma ORM",
        description: "Relational database design, query optimization, and ORM patterns.",
        lessons: 27,
        hours: "14h 20m",
        level: "Intermediate",
        icon: "🐘",
    },
    {
        id: 6,
        tag: "Advanced",
        tagColor: "bg-status-warning-light text-status-warning-dark",
        title: "DevOps & CI/CD Pipelines",
        description: "Docker, Kubernetes, GitHub Actions, and production deployment strategies.",
        lessons: 22,
        hours: "19h 50m",
        level: "Advanced",
        icon: "🚀",
    },
];

const projects = [
    {
        id: 1,
        title: "Full-Stack E-Commerce",
        description: "Build a production-ready store with cart, payments (Stripe), auth, and admin dashboard.",
        stack: ["React", "Node.js", "PostgreSQL", "Stripe"],
        difficulty: "Advanced",
        color: "border-l-brand-accent",
        accent: "#FF8C42",
    },
    {
        id: 2,
        title: "Real-Time Chat App",
        description: "WebSocket-powered chat with rooms, DMs, typing indicators, and file sharing.",
        stack: ["React", "Socket.io", "Express", "Redis"],
        difficulty: "Intermediate",
        color: "border-l-brand-primary",
        accent: "#3F76FF",
    },
    {
        id: 3,
        title: "AI Content Dashboard",
        description: "Integrate OpenAI API to generate, edit, and manage AI-assisted content at scale.",
        stack: ["Next.js", "OpenAI", "Prisma", "Tailwind"],
        difficulty: "Intermediate",
        color: "border-l-status-success",
        accent: "#16A34A",
    },
    {
        id: 4,
        title: "DevOps Monitoring Stack",
        description: "Set up Prometheus, Grafana, and alerting for a Node.js microservices cluster.",
        stack: ["Docker", "Prometheus", "Grafana", "Node.js"],
        difficulty: "Advanced",
        color: "border-l-status-error",
        accent: "#EF4444",
    },
];

const roadmapSteps = [
    {
        phase: "Phase 1",
        title: "Web Foundations",
        duration: "4 weeks",
        items: ["HTML5 & CSS3", "JavaScript ES6+", "Git & GitHub", "Command Line Basics"],
    },
    {
        phase: "Phase 2",
        title: "Frontend Development",
        duration: "6 weeks",
        items: ["React.js", "TypeScript", "State Management", "REST APIs & Fetch"],
    },
    {
        phase: "Phase 3",
        title: "Backend Development",
        duration: "6 weeks",
        items: ["Node.js & Express", "PostgreSQL", "Authentication (JWT)", "API Design"],
    },
    {
        phase: "Phase 4",
        title: "Full-Stack Projects",
        duration: "4 weeks",
        items: ["E-Commerce App", "Real-Time Features", "Testing & QA", "Deployment"],
    },
    {
        phase: "Phase 5",
        title: "DevOps & Scale",
        duration: "4 weeks",
        items: ["Docker & Kubernetes", "CI/CD Pipelines", "Monitoring", "System Design"],
    },
];

const jobs = [
    {
        id: 1,
        title: "Senior Frontend Engineer",
        company: "Stripe",
        location: "Remote",
        type: "Full-time",
        salary: "$140k – $180k",
        tags: ["React", "TypeScript", "GraphQL"],
        posted: "2 days ago",
        logo: "S",
        logoColor: "bg-[#635BFF] text-white",
    },
    {
        id: 2,
        title: "Node.js Backend Developer",
        company: "Vercel",
        location: "San Francisco, CA",
        type: "Full-time",
        salary: "$130k – $170k",
        tags: ["Node.js", "PostgreSQL", "AWS"],
        posted: "1 day ago",
        logo: "V",
        logoColor: "bg-surface-dark text-text-inverse",
    },
    {
        id: 3,
        title: "Full-Stack Engineer",
        company: "Linear",
        location: "Remote",
        type: "Full-time",
        salary: "$120k – $160k",
        tags: ["React", "Node.js", "Prisma"],
        posted: "3 days ago",
        logo: "L",
        logoColor: "bg-brand-primary text-white",
    },
    {
        id: 4,
        title: "React Native Developer",
        company: "Notion",
        location: "New York, NY",
        type: "Full-time",
        salary: "$125k – $155k",
        tags: ["React Native", "TypeScript", "Redux"],
        posted: "5 days ago",
        logo: "N",
        logoColor: "bg-text-primary text-text-inverse",
    },
    {
        id: 5,
        title: "DevOps / Platform Engineer",
        company: "PlanetScale",
        location: "Remote",
        type: "Contract",
        salary: "$95/hr",
        tags: ["Docker", "Kubernetes", "CI/CD"],
        posted: "1 week ago",
        logo: "P",
        logoColor: "bg-brand-accent text-white",
    },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ label, title, subtitle }) {
    return (
        <div className="mb-10">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-primary mb-2">
                {label}
            </span>
            <h2 className="text-3xl font-bold text-text-primary mb-3">{title}</h2>
            <p className="text-text-secondary max-w-xl">{subtitle}</p>
        </div>
    );
}

function CourseCard({ course }) {
    const [saved, setSaved] = useState(false);
    return (
        <div className="bg-surface-card border border-border rounded-lg p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-start justify-between">
                <span className="text-2xl">{course.icon}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${course.tagColor}`}>
                    {course.tag}
                </span>
            </div>
            <div>
                <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-brand-primary transition-colors">
                    {course.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{course.description}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted mt-auto pt-2 border-t border-border-light">
                <span>📚 {course.lessons} lessons</span>
                <span>⏱ {course.hours}</span>
                <button
                    onClick={() => setSaved(!saved)}
                    className="ml-auto text-text-muted hover:text-brand-accent transition-colors"
                    title={saved ? "Unsave" : "Save"}
                >
                    {saved ? "♥" : "♡"}
                </button>
            </div>
            <button className="w-full py-2 text-sm font-medium rounded bg-brand-primary text-white hover:bg-opacity-90 active:scale-95 transition-all">
                Start Course →
            </button>
        </div>
    );
}

function ProjectCard({ project }) {
    return (
        <div
            className="bg-surface-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 border-l-4"
            style={{ borderLeftColor: project.accent }}
        >
            <div className="flex items-center justify-between">
                <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                        background: project.accent + "18",
                        color: project.accent,
                    }}
                >
                    {project.difficulty}
                </span>
                <span className="text-xs text-text-muted">Project</span>
            </div>
            <h3 className="text-base font-semibold text-text-primary">{project.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-1">
                {project.stack.map((s) => (
                    <span
                        key={s}
                        className="text-xs bg-surface-alt text-text-secondary px-2 py-0.5 rounded-sm font-mono"
                    >
                        {s}
                    </span>
                ))}
            </div>
            <button className="mt-auto text-sm font-medium text-brand-primary hover:underline text-left">
                View Project →
            </button>
        </div>
    );
}



function JobCard({ job }) {
    const [applied, setApplied] = useState(false);
    return (
        <div className="bg-surface-card border border-border rounded-lg p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow duration-200 hover:border-brand-primary">
            {/* Logo */}
            <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 ${job.logoColor}`}
            >
                {job.logo}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                    <h3 className="text-base font-semibold text-text-primary">{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary ml-auto flex-shrink-0">
                        {job.type}
                    </span>
                </div>
                <p className="text-sm text-text-secondary mb-2">
                    {job.company} · {job.location}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {job.tags.map((t) => (
                        <span
                            key={t}
                            className="text-xs font-mono bg-surface-alt text-text-secondary px-2 py-0.5 rounded-sm"
                        >
                            {t}
                        </span>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-brand-primary">{job.salary}</span>
                    <span className="text-xs text-text-muted">Posted {job.posted}</span>
                    <button
                        onClick={() => setApplied(!applied)}
                        className={`ml-auto text-sm font-medium px-4 py-1.5 rounded transition-all active:scale-95 ${applied
                            ? "bg-status-success-light text-status-success border border-status-success"
                            : "bg-brand-primary text-white hover:bg-opacity-90"
                            }`}
                    >
                        {applied ? "✓ Applied" : "Apply Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = ["Courses", "Projects", "Roadmap", "Jobs"];

function Navbar({ active, setActive }) {
    return (
        <header className="sticky top-0 z-sticky bg-surface-default border-b border-border shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-center h-16">

                {/* Nav links */}
                <nav className="hidden sm:flex items-center gap-10">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item}
                            onClick={() => setActive(item)}
                            className={`px-4 py-2 text-sm font-medium rounded transition-all ${active === item
                                ? "bg-brand-primary text-white shadow-sm"
                                : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>


            </div>

            {/* Mobile nav */}
            <div className="sm:hidden flex border-t border-border-light">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item}
                        onClick={() => setActive(item)}
                        className={`flex-1 py-2.5 text-xs font-medium transition-all ${active === item
                            ? "text-brand-primary border-b-2 border-brand-primary"
                            : "text-text-muted"
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </header>
    );
}

// ─── Sections ────────────────────────────────────────────────────────────────

function CoursesSection() {
    const [filter, setFilter] = useState("All");
    const levels = ["All", "Beginner", "Intermediate", "Advanced"];
    const filtered =
        filter === "All" ? courses : courses.filter((c) => c.level === filter);

    return (
        <section>
            <SectionHeader
                label="Learn"
                title="Courses"
                subtitle="Structured, project-driven courses to take you from zero to production-ready developer."
            />
            <div className="flex gap-2 mb-6 flex-wrap">
                {levels.map((l) => (
                    <button
                        key={l}
                        onClick={() => setFilter(l)}
                        className={`px-4 py-1.5 text-sm rounded-full border transition-all ${filter === l
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "border-border text-text-secondary hover:border-brand-primary hover:text-brand-primary"
                            }`}
                    >
                        {l}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </section>
    );
}

function ProjectsSection() {
    return (
        <section>
            <SectionHeader
                label="Build"
                title="Projects"
                subtitle="Real-world projects that belong in your portfolio. Each one ships with a guided walkthrough."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {projects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                ))}
            </div>
        </section>
    );
}

function RoadmapSection() {
    return (
        <section>
            <SectionHeader
                label="Plan"
                title="Roadmap"
                subtitle="A clear, phase-by-phase journey from web fundamentals to full-stack mastery."
            />

            <div className="relative border-l border-border ml-3">
                {roadmapSteps.map((step, index) => (
                    <div key={index} className="mb-10 ml-6">

                        {/* Dot */}
                        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-brand-primary rounded-full text-white text-xs font-bold">
                            {index + 1}
                        </span>

                        {/* Card */}
                        <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-text-primary">
                                    {step.title}
                                </h3>
                                <span className="text-xs px-2 py-1 rounded bg-surface-alt text-text-secondary">
                                    {step.duration}
                                </span>
                            </div>

                            {/* Phase */}
                            <p className="text-xs text-brand-primary font-semibold mb-3">
                                {step.phase}
                            </p>

                            {/* Items */}
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-secondary">
                                {step.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="text-brand-primary">✔</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
function JobsSection() {
    const [search, setSearch] = useState("");
    const filtered = jobs.filter(
        (j) =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company.toLowerCase().includes(search.toLowerCase()) ||
            j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <section>
            <SectionHeader
                label="Hire"
                title="Jobs"
                subtitle="Curated developer roles matched to your skill level and stack preferences."
            />

            <div className="flex flex-col gap-4">
                {filtered.length > 0 ? (
                    filtered.map((job) => <JobCard key={job.id} job={job} />)
                ) : (
                    <div className="text-center py-12 text-text-muted text-sm">
                        No jobs found for "{search}"
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Recommendation() {
    const [active, setActive] = useState("Courses");

    const sectionMap = {
        Courses: <CoursesSection />,
        Projects: <ProjectsSection />,
        Roadmap: <RoadmapSection />,
        Jobs: <JobsSection />,
    };

    return (
        <div className="min-h-screen bg-surface-background font-sans">
            <Navbar active={active} setActive={setActive} />
            <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
                {sectionMap[active]}
            </main>
        </div>
    );
}