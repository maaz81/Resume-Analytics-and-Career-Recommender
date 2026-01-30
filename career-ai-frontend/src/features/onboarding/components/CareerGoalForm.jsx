import { useState, useEffect } from 'react';
import { Target, Briefcase, MapPin, Building2, X } from 'lucide-react';
import Dropdown from '@common/Dropdown';
import Input from '@common/Input';
import Button from '@common/Button';
import Badge from '@common/Badge';
import Alert from '@common/Alert';
import { useOnboarding } from '../hooks/useOnboarding';
import { cn } from '@utils/helpers';

/**
 * CareerGoalForm Component
 * Form for selecting career goals and preferences
 */
const CareerGoalForm = ({ onComplete }) => {
  const { saveCareerGoal, getCareerRoles, getTopCompanies, isLoading, error } = useOnboarding();

  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    targetRole: '',
    experienceLevel: '',
    targetCompanies: [],
    location: '',
    remotePreference: 'flexible',
  });

  const [errors, setErrors] = useState({});
  const [companyInput, setCompanyInput] = useState('');

  // Experience level options
  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (3-5 years)' },
    { value: 'senior', label: 'Senior (6-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' },
  ];

  // Remote preference options
  const remotePreferences = [
    { value: 'remote', label: 'Remote Only' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
    { value: 'flexible', label: 'Flexible' },
  ];

  // Load roles and companies on mount
  useEffect(() => {
    const loadData = async () => {
      const [rolesData, companiesData] = await Promise.all([
        getCareerRoles(),
        getTopCompanies(),
      ]);
      setRoles(rolesData);
      setCompanies(companiesData);
    };
    loadData();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleAddCompany = () => {
    if (!companyInput.trim()) return;

    if (formData.targetCompanies.length >= 5) {
      setErrors({ targetCompanies: 'Maximum 5 companies allowed' });
      return;
    }

    if (!formData.targetCompanies.includes(companyInput)) {
      setFormData((prev) => ({
        ...prev,
        targetCompanies: [...prev.targetCompanies, companyInput],
      }));
    }

    setCompanyInput('');
  };

  const handleRemoveCompany = (company) => {
    setFormData((prev) => ({
      ...prev,
      targetCompanies: prev.targetCompanies.filter((c) => c !== company),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!formData.targetRole) {
      newErrors.targetRole = 'Please select a target role';
    }
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Please select your experience level';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save career goal
    const result = await saveCareerGoal(formData);

    if (result.success) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => { }}>
          {error}
        </Alert>
      )}

      {/* Target Role */}
      <Dropdown
        label="Target Role"
        placeholder="Select your desired role"
        options={roles}
        value={formData.targetRole}
        onChange={(value) => handleChange('targetRole', value)}
        error={errors.targetRole}
        searchable
        required
        disabled={isLoading}
      />

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Experience Level <span className="text-status-error">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => handleChange('experienceLevel', level.value)}
              disabled={isLoading}
              className={cn(
                'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                formData.experienceLevel === level.value
                  ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                  : 'border-border hover:border-brand-primary/50',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                    formData.experienceLevel === level.value
                      ? 'border-brand-primary bg-brand-primary'
                      : 'border-border'
                  )}
                >
                  {formData.experienceLevel === level.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {level.label.split('(')[0].trim()}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {level.label.match(/\(([^)]+)\)/)?.[1]}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.experienceLevel && (
          <p className="mt-2 text-sm text-status-error">{errors.experienceLevel}</p>
        )}
      </div>

      {/* Target Companies (Optional) */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Target Companies <span className="text-text-muted">(Optional)</span>
        </label>

        <div className="flex gap-2">
          <Input
            placeholder="Add company name"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCompany();
              }
            }}
            disabled={isLoading || formData.targetCompanies.length >= 5}
            leftIcon={<Building2 className="w-5 h-5" />}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCompany}
            disabled={isLoading || formData.targetCompanies.length >= 5 || !companyInput.trim()}
          >
            Add
          </Button>
        </div>

        {/* Popular Companies */}
        <div className="mt-3">
          <p className="text-xs text-text-muted mb-2">Popular companies:</p>
          <div className="flex flex-wrap gap-2">
            {companies.slice(0, 8).map((company) => (
              <button
                key={company}
                type="button"
                onClick={() => {
                  if (formData.targetCompanies.length < 5 && !formData.targetCompanies.includes(company)) {
                    handleChange('targetCompanies', [...formData.targetCompanies, company]);
                  }
                }}
                disabled={isLoading || formData.targetCompanies.includes(company) || formData.targetCompanies.length >= 5}
                className="text-xs px-2 py-1 rounded-md border border-border hover:border-brand-primary hover:bg-brand-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {company}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Companies */}
        {formData.targetCompanies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.targetCompanies.map((company) => (
              <Badge
                key={company}
                variant="primary"
                className="flex items-center gap-1 pr-1"
              >
                {company}
                <button
                  type="button"
                  onClick={() => handleRemoveCompany(company)}
                  disabled={isLoading}
                  className="p-0.5 rounded hover:bg-brand-primary/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {errors.targetCompanies && (
          <p className="mt-2 text-sm text-status-error">{errors.targetCompanies}</p>
        )}
      </div>

      {/* Location (Optional) */}
      <Input
        label="Preferred Location"
        placeholder="e.g., San Francisco, CA"
        value={formData.location}
        onChange={(e) => handleChange('location', e.target.value)}
        leftIcon={<MapPin className="w-5 h-5" />}
        helperText="Optional"
        disabled={isLoading}
      />

      {/* Remote Preference */}
      <Dropdown
        label="Work Preference"
        placeholder="Select work preference"
        options={remotePreferences}
        value={formData.remotePreference}
        onChange={(value) => handleChange('remotePreference', value)}
        disabled={isLoading}
      />

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Continue to Resume Upload
        </Button>
      </div>
    </form>
  );
};

export default CareerGoalForm;