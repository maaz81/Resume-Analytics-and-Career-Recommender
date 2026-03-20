import { Upload, FileText, Briefcase } from "lucide-react";
import { ROUTES } from "@constants/routes";
import Button from '@common/Button';
import { useNavigate } from "react-router-dom";


export default function RecommendationPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-surface-background p-6 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-text-primary">
                    Recommendations
                </h1>

                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        leftIcon={<Upload className="w-4 h-4" />}
                        onClick={() => navigate(ROUTES.ONBOARDING_RESUME_UPLOAD)}
                    >
                        Upload New Version
                    </Button>


                </div>
            </div>

            {/* OVERVIEW */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* MATCH SCORE */}
                <div className="bg-surface-card p-6 rounded-lg shadow-md">
                    <p className="text-sm text-text-secondary">Match Score</p>
                    <h2 className="text-4xl font-bold text-brand-primary mt-2">72%</h2>
                    <p className="text-status-success text-sm mt-1">Strong Match</p>
                </div>

                {/* ATS */}
                <div className="bg-surface-card p-6 rounded-lg shadow-md">
                    <p className="text-sm text-text-secondary mb-2">ATS Score</p>

                    <div className="w-full bg-surface-alt h-2 rounded-full">
                        <div className="bg-status-success h-2 rounded-full w-[78%]" />
                    </div>

                    <ul className="mt-3 text-sm text-text-secondary space-y-1">
                        <li>✔ Structure</li>
                        <li>✔ Experience</li>
                        <li className="text-status-warning">⚠ Improve keywords</li>
                    </ul>
                </div>

                {/* MISSING SKILLS */}
                <div className="bg-surface-card p-6 rounded-lg shadow-md">
                    <p className="text-sm text-text-secondary mb-3">
                        Missing Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {["Docker", "Kubernetes", "ML", "DSA"].map((s, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-status-error-light text-status-error text-xs rounded-full"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN SECTION */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* COURSES */}
                <div className="bg-surface-card p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-medium text-text-primary mb-4">
                        Recommended Courses
                    </h2>

                    <div className="space-y-4">
                        {[
                            { name: "Machine Learning", duration: "8 weeks" },
                            { name: "Docker Fundamentals", duration: "6 weeks" },
                        ].map((course, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center p-4 border border-border rounded-md hover:shadow-md transition"
                            >
                                <div>
                                    <p className="font-medium text-text-primary">
                                        {course.name}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {course.duration}
                                    </p>
                                </div>


                            </div>
                        ))}
                    </div>
                </div>

                {/* PROJECTS */}
                <div className="bg-surface-card p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-medium text-text-primary mb-4">
                        Recommended Projects
                    </h2>

                    <div className="space-y-4">
                        {[
                            "AI Resume Analyzer",
                            "Job Skill Matcher",
                        ].map((project, i) => (
                            <div
                                key={i}
                                className="p-4 border border-border rounded-md hover:shadow-md transition"
                            >
                                <p className="text-brand-primary font-medium">
                                    {project}
                                </p>
                                <p className="text-xs text-text-muted">Medium</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* JOBS */}
            <div className="bg-surface-card p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Briefcase size={18} /> Available Jobs
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { role: "Frontend Developer", company: "Google" },
                        { role: "Backend Developer", company: "Amazon" },
                        { role: "Full Stack Developer", company: "Microsoft" },
                    ].map((job, i) => (
                        <div
                            key={i}
                            className="p-4 border border-border rounded-md hover:shadow-md transition"
                        >
                            <p className="text-text-primary font-medium text-sm">
                                {job.role}
                            </p>
                            <p className="text-text-muted text-xs">
                                {job.company}
                            </p>

                            <button className="mt-3 w-full bg-brand-primary text-white text-sm py-1 rounded-md">
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}