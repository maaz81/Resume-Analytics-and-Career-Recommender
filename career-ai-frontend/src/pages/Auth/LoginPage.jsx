import Card, { CardContent } from '@common/Card';
import LoginForm from '@features/auth/components/LoginForm';
import OAuthButtons from '@features/auth/components/OAuthButtons';

/**
 * LoginPage Component
 * Main login page with form and OAuth options
 */
const LoginPage = () => {
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
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Welcome back</h1>
        <p className="text-text-secondary">
          Sign in to continue your career journey
        </p>
      </div>

      {/* Login Card */}
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
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm />
        </CardContent>
      </Card>

      {/* Footer Text */}
      <p className="text-center text-xs text-text-muted">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default LoginPage;