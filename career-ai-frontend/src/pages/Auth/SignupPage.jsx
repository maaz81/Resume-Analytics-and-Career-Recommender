import Card, { CardContent } from '@common/Card';
import SignupForm from '@features/auth/components/SignupForm';
import OAuthButtons from '@features/auth/components/OAuthButtons';

/**
 * SignupPage Component
 * Registration page with form and OAuth options
 */
const SignupPage = () => {
  return (
    <div className="w-full space-y-6">
      {/* Logo & Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/10 mb-4">
          <svg
            className="w-10 h-10 text-brand-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Create your account</h1>
        <p className="text-text-secondary">
          Start your AI-powered career journey today
        </p>
      </div>

      {/* Signup Card */}
      <Card className="shadow-xl">
        <CardContent className="p-8">
          {/* OAuth Buttons */}
          <OAuthButtons />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface-card text-text-muted">
                Or create account with email
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <SignupForm />
        </CardContent>
      </Card>

      {/* Features List */}
      <div className="mt-8 space-y-3">
        <p className="text-sm font-medium text-text-secondary text-center mb-4">
          What you'll get:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '📄', text: 'AI Resume Analysis' },
            { icon: '🎯', text: 'Skill Gap Identification' },
            { icon: '🗺️', text: 'Personalized Roadmap' },
            { icon: '💼', text: 'Job Matching' },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-card border border-border"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-sm text-text-secondary">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;