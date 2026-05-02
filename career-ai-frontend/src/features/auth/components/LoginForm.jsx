import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Input from '@common/Input';
import Button from '@common/Button';
import Alert from '@common/Alert';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm } from '../utils/validation';
import { ROUTES } from '@constants/routes';

/**
 * LoginForm Component
 * Login form with validation and error handling
 */
const LoginForm = () => {
  const { login, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit login
    await login(formData);
  };

  return (
    <div className="w-full">
      {/* Error Alert */}
      {authError && (
        <Alert variant="error" className="mb-6" dismissible onDismiss={() => { }}>
          {authError}
        </Alert>
      )}

      {/* Demo Credentials Info
      <Alert variant="info" className="mb-6">
        <p className="text-sm font-medium mb-1">Demo Credentials:</p>
        <p className="text-sm">Email: john@example.com</p>
        <p className="text-sm">Password: password123</p>
      </Alert> */}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.password}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-border text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
            />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>

          <Link
            to="#"
            className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        {/* Signup Link */}
        <p className="text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link
            to={ROUTES.SIGNUP}
            className="font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;