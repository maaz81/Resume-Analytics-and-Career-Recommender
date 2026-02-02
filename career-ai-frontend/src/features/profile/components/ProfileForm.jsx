import { useState } from 'react';
import { User, Mail, Briefcase, MapPin, Building2 } from 'lucide-react';
import Input from '@common/Input';
import Dropdown from '@common/Dropdown';
import Button from '@common/Button';
import Alert from '@common/Alert';

/**
 * ProfileForm Component
 * Form for updating user profile and career goals
 */
const ProfileForm = ({ user, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        targetRole: user?.careerGoal?.targetRole || '',
        experienceLevel: user?.careerGoal?.experience || '',
        location: user?.careerGoal?.location || '',
        targetCompanies: user?.careerGoal?.targetCompanies || [],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const experienceLevels = [
        { value: 'entry', label: 'Entry Level (0-2 years)' },
        { value: 'intermediate', label: 'Intermediate (3-5 years)' },
        { value: 'senior', label: 'Senior (6-10 years)' },
        { value: 'lead', label: 'Lead/Principal (10+ years)' },
    ];

    const targetRoles = [
        { value: 'software-engineer', label: 'Software Engineer' },
        { value: 'senior-software-engineer', label: 'Senior Software Engineer' },
        { value: 'frontend-developer', label: 'Frontend Developer' },
        { value: 'backend-developer', label: 'Backend Developer' },
        { value: 'full-stack-developer', label: 'Full Stack Developer' },
        { value: 'devops-engineer', label: 'DevOps Engineer' },
        { value: 'data-scientist', label: 'Data Scientist' },
    ];

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: null,
            }));
        }

        // Clear success message
        if (success) {
            setSuccess(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        // Simulate save delay
        setTimeout(() => {
            onSave(formData);
            setIsLoading(false);
            setSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Alert */}
            {success && (
                <Alert variant="success">
                    Profile updated successfully!
                </Alert>
            )}

            {/* Personal Information */}
            <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Personal Information
                </h3>
                <div className="space-y-4">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        leftIcon={<User className="w-5 h-5" />}
                        error={errors.name}
                        required
                        disabled={isLoading}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        leftIcon={<Mail className="w-5 h-5" />}
                        error={errors.email}
                        required
                        disabled={isLoading}
                        helperText="Used for account login and notifications"
                    />
                </div>
            </div>

            {/* Career Goals */}
            <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Career Goals
                </h3>
                <div className="space-y-4">
                    <Dropdown
                        label="Target Role"
                        options={targetRoles}
                        value={formData.targetRole}
                        onChange={(value) => handleChange('targetRole', value)}
                        placeholder="Select your target role"
                        searchable
                        disabled={isLoading}
                    />

                    <Dropdown
                        label="Experience Level"
                        options={experienceLevels}
                        value={formData.experienceLevel}
                        onChange={(value) => handleChange('experienceLevel', value)}
                        placeholder="Select your experience level"
                        disabled={isLoading}
                    />

                    <Input
                        label="Preferred Location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        leftIcon={<MapPin className="w-5 h-5" />}
                        placeholder="e.g., San Francisco, CA"
                        disabled={isLoading}
                        helperText="Optional"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    Save Changes
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isLoading}
                    onClick={() => window.location.reload()}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;