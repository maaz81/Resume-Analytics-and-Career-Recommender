import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, MapPin, Building2 } from 'lucide-react';
import Input from '@common/Input';
import Dropdown from '@common/Dropdown';
import Button from '@common/Button';
import Alert from '@common/Alert';

/**
 * ProfileForm Component
 * Form for updating user profile and career goals
 */
const ProfileForm = ({ user, onSave, isUpdating = false, updateSuccess = false }) => {
    const [formData, setFormData] = useState({
        name: user?.full_name || '',
        email: user?.email || '',
        targetRole: user?.target_role || '',
        experienceLevel: user?.years_of_experience || '',
        location: user?.location || '',
        targetCompanies: user?.careerGoal?.targetCompanies || [],
    });

    const [errors, setErrors] = useState({});

    // Re-initialize form when user data loads asynchronously
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.full_name || '',
                email: user.email || '',
                targetRole: user.target_role || '',
                experienceLevel: user.years_of_experience || '',
                location: user.location || '',
                targetCompanies: user.careerGoal?.targetCompanies || [],
            });
        }
    }, [user]);

    const experienceLevels = [
        { value: 1, label: 'Entry Level (0-2 years)' },
        { value: 4, label: 'Intermediate (3-5 years)' },
        { value: 8, label: 'Senior (6-10 years)' },
        { value: 12, label: 'Lead/Principal (10+ years)' },
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

        onSave({
            full_name: formData.name,
            target_role: formData.targetRole,
            years_of_experience: formData.experienceLevel,
            location: formData.location
        })
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Alert */}
            {updateSuccess && (
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
                        disabled={isUpdating}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        leftIcon={<Mail className="w-5 h-5" />}
                        error={errors.email}
                        required
                        disabled
                        helperText="Email cannot be changed"
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
                        disabled={isUpdating}
                    />

                    <Dropdown
                        label="Experience Level"
                        options={experienceLevels}
                        value={formData.experienceLevel}
                        onChange={(value) => handleChange('experienceLevel', value)}
                        placeholder="Select your experience level"
                        disabled={isUpdating}
                    />

                    <Input
                        label="Preferred Location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        leftIcon={<MapPin className="w-5 h-5" />}
                        placeholder="e.g., San Francisco, CA"
                        disabled={isUpdating}
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
                    isLoading={isUpdating}
                    disabled={isUpdating}
                >
                    Save Changes
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isUpdating}
                    onClick={() => window.location.reload()}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;