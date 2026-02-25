// ===== src/pages/Profile/ProfilePage.jsx =====
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Shield, Bell, Palette, LogOut, Trash2 } from 'lucide-react';
import ProfileForm from '@features/profile/components/ProfileForm';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import Modal from '@common/Modal';
import { logout } from '@features/auth/slices/authSlice';
import { loadProfile, updateProfile } from '@features/profile/slices/profileSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { formatDate, getInitials } from '@utils/helpers';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile, isLoading, isUpdating, updateSuccess } = useSelector((state) => state.profile);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadProfile());
    }
  }, [dispatch, isAuthenticated]);

  const user = profile;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    weeklyProgress: true,
    jobMatches: false,
    learningReminders: true,
  });

  const handleSaveProfile = (formData) => {
    // Map frontend form fields to backend snake_case fields
    const mappedData = {
      fullName: formData.name,
      targetRole: formData.targetRole,
      yearsOfExperience: formData.experienceLevel,
      location: formData.location,
    };

    dispatch(updateProfile(mappedData));
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const handleDeleteAccount = () => {
    // In real app, call delete API
    alert('Account deletion would be processed here');
    setShowDeleteModal(false);
  };

  // Map backend snake_case fields to the format ProfileForm expects
  const mappedUser = user && {
    name: user.full_name,
    email: user.email,
    careerGoal: {
      targetRole: user.target_role,
      experience: user.years_of_experience,
      location: user.location,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-secondary">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Summary Card */}
      <Card className="border-2 border-brand-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-brand-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {getInitials(user?.full_name || 'User')}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-primary">{user?.full_name}</h2>
              <p className="text-text-secondary">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="primary">
                  {user?.target_role || 'No target role set'}
                </Badge>
                <Badge variant="default">
                  {user?.years_of_experience ? `${user.years_of_experience} years` : 'Experience not set'}
                </Badge>
              </div>
            </div>

            {/* Account Status */}
            <div className="text-right">
              <p className="text-sm text-text-muted">Member since</p>
              <p className="text-sm font-semibold text-text-primary">
                {formatDate(user?.created_at || new Date())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information & Career Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            user={mappedUser}
            onSave={handleSaveProfile}
            isUpdating={isUpdating}
            updateSuccess={updateSuccess}
          />
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-primary" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-text-primary">Email Notifications</p>
                <p className="text-sm text-text-muted">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationToggle('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-alt rounded-full peer peer-checked:bg-brand-primary peer-focus:ring-2 peer-focus:ring-brand-primary/20 transition-colors">
                  <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-text-primary">Weekly Progress Reports</p>
                <p className="text-sm text-text-muted">Get weekly summaries of your learning progress</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weeklyProgress}
                  onChange={() => handleNotificationToggle('weeklyProgress')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-alt rounded-full peer peer-checked:bg-brand-primary peer-focus:ring-2 peer-focus:ring-brand-primary/20 transition-colors">
                  <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-text-primary">Job Match Alerts</p>
                <p className="text-sm text-text-muted">Notify when new jobs match your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.jobMatches}
                  onChange={() => handleNotificationToggle('jobMatches')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-alt rounded-full peer peer-checked:bg-brand-primary peer-focus:ring-2 peer-focus:ring-brand-primary/20 transition-colors">
                  <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-text-primary">Learning Reminders</p>
                <p className="text-sm text-text-muted">Daily reminders to maintain your learning streak</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.learningReminders}
                  onChange={() => handleNotificationToggle('learningReminders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-alt rounded-full peer peer-checked:bg-brand-primary peer-focus:ring-2 peer-focus:ring-brand-primary/20 transition-colors">
                  <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-status-error/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-status-error" />
            <CardTitle className="text-status-error">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-lg bg-status-error/5 border border-status-error/20">
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-1">Logout</h4>
                <p className="text-sm text-text-secondary">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="outline"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                className="text-status-error hover:text-status-error hover:border-status-error"
              >
                Logout
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 rounded-lg bg-status-error/5 border border-status-error/20">
              <div className="flex-1">
                <h4 className="font-semibold text-status-error mb-1">Delete Account</h4>
                <p className="text-sm text-text-secondary">
                  Permanently delete your account and all data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="outline"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteModal(true)}
                className="text-status-error hover:text-status-error hover:border-status-error"
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Yes, Delete My Account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete your account? This will permanently remove:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>All your resume versions and analysis</li>
            <li>Your skill gap analysis and learning progress</li>
            <li>Your personalized roadmap</li>
            <li>All chat history with the AI assistant</li>
          </ul>
          <p className="text-status-error font-semibold">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
