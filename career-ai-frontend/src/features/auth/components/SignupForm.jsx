import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import Input from '@common/Input';
import Button from '@common/Button';
import Alert from '@common/Alert';
import ProgressBar from '@common/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { validateSignupForm, getPasswordStrength } from '../utils/validation';
import { ROUTES } from '@constants/routes';
import { cn } from '@utils/helpers';

/**
 * SignupForm Component
 * Registration form with password strength indicator
 */
const SignupForm = () => {
  const { signup, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Calculate password strength
  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Show password strength when typing password
    if (name === 'password' && value.length > 0) {
      setShowPasswordStrength(true);
    } else if (name === 'password' && value.length === 0) {
      setShowPasswordStrength(false);
    }

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
    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check terms acceptance
    if (!acceptTerms) {
      setErrors({ terms: 'Please accept the terms and conditions' });
      return;
    }

    // Submit signup
    const { confirmPassword, ...signupData } = formData;
    await signup(signupData);
  };

  return (
    <div className="w-full">
      {/* Error Alert */}
      {authError && (
        <Alert variant="error" className="mb-6" dismissible onDismiss={() => { }}>
          {authError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Input */}
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          leftIcon={<User className="w-5 h-5" />}
          error={errors.name}
          required
          autoComplete="name"
          disabled={isLoading}
        />

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
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            leftIcon={<Lock className="w-5 h-5" />}
            error={errors.password}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />

          {/* Password Strength Indicator */}
          {showPasswordStrength && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Password strength:</span>
                <span
                  className={cn(
                    'text-xs font-medium capitalize',
                    passwordStrength.color === 'error' && 'text-status-error',
                    passwordStrength.color === 'warning' && 'text-status-warning',
                    passwordStrength.color === 'success' && 'text-status-success'
                  )}
                >
                  {passwordStrength.strength}
                </span>
              </div>
              <ProgressBar
                value={(passwordStrength.score / 6) * 100}
                variant={passwordStrength.color}
                size="sm"
              />
              <div className="text-xs text-text-muted space-y-1">
                <p>Password should contain:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li className={formData.password.length >= 8 ? 'text-status-success' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-status-success' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-status-success' : ''}>
                    One number
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(formData.password) ? 'text-status-success' : ''}>
                    One special character
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Terms & Conditions */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: null }));
                }
              }}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-border text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
            />
            <span className="text-sm text-text-secondary">
              I agree to the{' '}
              <Link to="#" className="text-brand-primary hover:text-brand-primary/80 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="#" className="text-brand-primary hover:text-brand-primary/80 font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-sm text-status-error">{errors.terms}</p>
          )}
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
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;