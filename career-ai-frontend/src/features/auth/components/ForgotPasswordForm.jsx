import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

import Input from '@common/Input';
import Button from '@common/Button';
import Alert from '@common/Alert';

import { forgotPasswordService } from '../services/authService';
import { ROUTES } from '@constants/routes';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);

        try {
            const response = await forgotPasswordService(email);

            setSuccess(
                response?.message ||
                'If an account exists with this email, a password reset link has been sent.'
            );
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Unable to send password reset link';

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

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

            {success && (
                <Alert
                    variant="success"
                    className="mb-6"
                    dismissible
                    onDismiss={() => setSuccess('')}
                >
                    {success}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Sending reset link...'
                        : 'Send Reset Link'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;