import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

import Input from '@common/Input';
import Button from '@common/Button';
import Alert from '@common/Alert';

import { resetPasswordService } from '../services/authService';
import { ROUTES } from '@constants/routes';

const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError('Invalid or missing password reset token');
            return;
        }

        if (!formData.newPassword) {
            setError('New password is required');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await resetPasswordService(
                token,
                formData.newPassword
            );

            navigate(ROUTES.LOGIN, {
                replace: true,
                state: {
                    message:
                        'Password reset successfully. Please sign in with your new password.',
                },
            });
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Unable to reset password';

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="w-full">
                <Alert variant="error">
                    This password reset link is invalid or incomplete.
                </Alert>

                <div className="mt-6 text-center">
                    <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-primary/80"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {error && (
                <Alert
                    variant="error"
                    className="mb-6"
                    dismissible
                    onDismiss={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                />

                <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                />

                <p className="text-xs text-text-secondary">
                    Password must contain at least 8 characters, including an uppercase
                    letter, lowercase letter, and number.
                </p>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Resetting password...'
                        : 'Reset Password'}
                </Button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;