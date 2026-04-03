import { useState, useEffect, useCallback } from "react";

// ─── API Config ───────────────────────────────────────────────────────────────
// Set this to your backend base URL (e.g. http://localhost:5000/api/v1)
const API_BASE = "http://localhost:5000/api/v1";

/**
 * Generic fetch helper — attaches the JWT stored in localStorage,
 * throws on non-2xx, and returns parsed JSON data payload.
 */
async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
    }

    const json = await res.json();
    // Backend wraps responses: { success, data, message }
    return json.data ?? json;
}

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

/**
 * Generic data-fetching hook.
 * Returns { data, loading, error, refetch }
 */
function useApi(fetcher, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const run = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            setData(result);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => { run(); }, [run]);

    return { data, loading, error, refetch: run };
}

// ─── Level Meta (mirrors backend) ────────────────────────────────────────────

const LEVEL_META = {
    Beginner: { tagColor: "bg-status-success-light text-status-success-dark", icon: "📗" },
    Intermediate: { tagColor: "bg-status-info-light text-status-info-dark", icon: "📘" },
    Advanced: { tagColor: "bg-status-warning-light text-status-warning-dark", icon: "📕" },
};

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

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

function Spinner() {
    return (
        <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
        </div>
    );
}

function ErrorBanner({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-3xl">⚠️</span>
            <p className="text-text-secondary text-sm max-w-sm">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 px-4 py-2 text-sm font-medium rounded bg-brand-primary text-white hover:bg-opacity-90 transition-all"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="text-center py-12 text-text-muted text-sm">{message}</div>
    );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course }) {
    const [saved, setSaved] = useState(false);
    const meta = LEVEL_META[course.level] || LEVEL_META["Beginner"];

    return (
        <div className="bg-surface-card border border-border rounded-lg p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-start justify-between">
                {/* Show thumbnail for YouTube results, emoji icon for static */}
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-14 h-10 object-cover rounded"
                    />
                ) : (
                    <span className="text-2xl">{course.icon || meta.icon}</span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${course.tagColor || meta.tagColor}`}>
                    {course.tag || course.level}
                </span>
            </div>

            <div>
                <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-brand-primary transition-colors line-clamp-2">
                    {course.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {course.description}
                </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-muted mt-auto pt-2 border-t border-border-light">
                {course.lessons && <span>📚 {course.lessons} lessons</span>}
                {course.hours && <span>⏱ {course.hours}</span>}
                {course.channelTitle && (
                    <span className="truncate max-w-[120px]" title={course.channelTitle}>
                        📺 {course.channelTitle}
                    </span>
                )}
                <button
                    onClick={() => setSaved(!saved)}
                    className="ml-auto text-text-muted hover:text-brand-accent transition-colors"
                    title={saved ? "Unsave" : "Save"}
                >
                    {saved ? "♥" : "♡"}
                </button>
            </div>

            <a
                href={course.videoUrl || "#"}
                target={course.videoUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="w-full py-2 text-sm font-medium rounded bg-brand-primary text-white hover:bg-opacity-90 active:scale-95 transition-all text-center"
            >
                Start Course →
            </a>
        </div>
    );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }) {
    return (
        <div
            className="bg-surface-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 border-l-4"
            style={{ borderLeftColor: project.accent }}
        >
            <div className="flex items-center justify-between">
                <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: project.accent + "18", color: project.accent }}
                >
                    {project.difficulty}
                </span>
                <span className="text-xs text-text-muted">Project</span>
            </div>
            <h3 className="text-base font-semibold text-text-primary">{project.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-1">
                {project.stack.map((s) => (
                    <span key={s} className="text-xs bg-surface-alt text-text-secondary px-2 py-0.5 rounded-sm font-mono">
                        {s}
                    </span>
                ))}
            </div>

        </div>
    );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job }) {
    const [applied, setApplied] = useState(false);
    return (
        <div className="bg-surface-card border border-border rounded-lg p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow duration-200 hover:border-brand-primary">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 ${job.logoColor}`}>
                {job.logo}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                    <h3 className="text-base font-semibold text-text-primary">{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary ml-auto flex-shrink-0">
                        {job.type}
                    </span>
                </div>
                <p className="text-sm text-text-secondary mb-2">{job.company} · {job.location}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {job.tags.map((t) => (
                        <span key={t} className="text-xs font-mono bg-surface-alt text-text-secondary px-2 py-0.5 rounded-sm">
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

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = ["Courses", "Projects", "Roadmap"];

function Navbar({ active, setActive }) {
    return (
        <header className="sticky top-0 z-sticky bg-surface-default border-b border-border shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-center h-16">
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

// ─── Courses Section ──────────────────────────────────────────────────────────

function CoursesSection() {
    const [filter, setFilter] = useState("All");
    const [query, setQuery] = useState("programming course");
    const [input, setInput] = useState("programming course");

    const levels = ["All", "Beginner", "Intermediate", "Advanced"];

    const { data, loading, error, refetch } = useApi(
        () => apiFetch(`/recommendations/courses?q=${encodeURIComponent(query)}&max=12`),
        [query]
    );

    const courses = data?.courses ?? [];

    const filtered =
        filter === "All"
            ? courses
            : courses.filter((c) => (c.level || c.tag) === filter);

    function handleSearch(e) {
        e.preventDefault();
        setQuery(input.trim() || "programming course");
    }

    return (
        <section>
            <SectionHeader
                label="Learn"
                title="Courses"
                subtitle="Structured, project-driven courses to take you from zero to production-ready developer."
            />

            {/* Search bar — hits GET /recommendations/courses?q=... */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search courses…"
                    className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-surface-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-white hover:bg-opacity-90 transition-all"
                >
                    Search
                </button>
            </form>

            {/* Level filter pills */}
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

            {loading && <Spinner />}
            {!loading && error && <ErrorBanner message={error} onRetry={refetch} />}
            {!loading && !error && filtered.length === 0 && (
                <EmptyState message={`No ${filter === "All" ? "" : filter + " "}courses found.`} />
            )}
            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((course, i) => (
                        <CourseCard key={course.id || i} course={course} />
                    ))}
                </div>
            )}
        </section>
    );
}

// ─── Projects Section ─────────────────────────────────────────────────────────

function ProjectsSection() {
    const { data, loading, error, refetch } = useApi(
        () => apiFetch("/recommendations/projects")
    );

    const projects = data?.projects ?? [];

    return (
        <section>
            <SectionHeader
                label="Build"
                title="Projects"
                subtitle="Real-world projects that belong in your portfolio. Each one ships with a guided walkthrough."
            />
            {loading && <Spinner />}
            {!loading && error && <ErrorBanner message={error} onRetry={refetch} />}
            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
            )}
        </section>
    );
}

// ─── Roadmap Section ──────────────────────────────────────────────────────────

function RoadmapSection() {
    const { data, loading, error, refetch } = useApi(
        () => apiFetch("/recommendations/roadmap")
    );

    const roadmapSteps = data?.roadmapSteps ?? [];

    return (
        <section>
            <SectionHeader
                label="Plan"
                title="Roadmap"
                subtitle="A clear, phase-by-phase journey from web fundamentals to full-stack mastery."
            />
            {loading && <Spinner />}
            {!loading && error && <ErrorBanner message={error} onRetry={refetch} />}
            {!loading && !error && (
                <div className="relative border-l border-border ml-3">
                    {roadmapSteps.map((step, index) => (
                        <div key={index} className="mb-10 ml-6">
                            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-brand-primary rounded-full text-white text-xs font-bold">
                                {index + 1}
                            </span>
                            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
                                    <span className="text-xs px-2 py-1 rounded bg-surface-alt text-text-secondary">
                                        {step.duration}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-primary font-semibold mb-3">{step.phase}</p>
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
            )}
        </section>
    );
}

// ─── Jobs Section ─────────────────────────────────────────────────────────────

function JobsSection() {
    const [search, setSearch] = useState("");

    const { data, loading, error, refetch } = useApi(
        () => apiFetch("/recommendations/jobs")
    );

    const jobs = data?.jobs ?? [];

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

            {/* Client-side filter — no extra API call needed */}
            <div className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by title, company, or skill…"
                    className="w-full sm:max-w-sm px-4 py-2 text-sm border border-border rounded-lg bg-surface-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
            </div>

            {loading && <Spinner />}
            {!loading && error && <ErrorBanner message={error} onRetry={refetch} />}
            {!loading && !error && (
                <div className="flex flex-col gap-4">
                    {filtered.length > 0 ? (
                        filtered.map((job) => <JobCard key={job.id} job={job} />)
                    ) : (
                        <EmptyState message={search ? `No jobs found for "${search}"` : "No jobs available."} />
                    )}
                </div>
            )}
        </section>
    );
}

// ─── Page Root ────────────────────────────────────────────────────────────────

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