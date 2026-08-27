import Card, { CardContent } from '@common/Card';
import ResetPasswordForm from '@features/auth/components/ResetPasswordForm';

/**
 * ResetPasswordPage Component
 */
const ResetPasswordPage = () => {
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
                            d="M12 11v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-text-primary">
                    Reset your password
                </h1>

                <p className="text-text-secondary">
                    Choose a strong new password for your account
                </p>
            </div>

            {/* Reset Password Card */}
            <Card className="shadow-xl">
                <CardContent className="p-8">
                    <ResetPasswordForm />
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;