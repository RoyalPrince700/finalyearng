import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUniversities, getFaculties, getDepartments } from '../constants/universities';
import { LuSave, LuUser, LuMail, LuBuilding, LuBookOpen, LuGraduationCap, LuTriangleAlert, LuTrash2 } from 'react-icons/lu';
import SuccessModal from '../components/SuccessModal';
import DeleteAccountModal from '../components/DeleteAccountModal';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({
    title: 'Profile Updated!',
    message: 'Your university, faculty, and department changes have been saved successfully.'
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    university: user?.university || '',
    faculty: user?.faculty || '',
    department: user?.department || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [availableFaculties, setAvailableFaculties] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Update available faculties when university changes
  useEffect(() => {
    if (formData.university) {
      const faculties = getFaculties(formData.university);
      setAvailableFaculties(faculties);
      // Reset faculty and department if university changes
      if (!faculties.includes(formData.faculty)) {
        setFormData(prev => ({ ...prev, faculty: '', department: '' }));
        setAvailableDepartments([]);
      }
    } else {
      setAvailableFaculties([]);
      setAvailableDepartments([]);
    }
  }, [formData.university]);

  // Update available departments when faculty changes
  useEffect(() => {
    if (formData.university && formData.faculty) {
      const departments = getDepartments(formData.university, formData.faculty);
      setAvailableDepartments(departments);
      // Reset department if faculty changes
      if (!departments.includes(formData.department)) {
        setFormData(prev => ({ ...prev, department: '' }));
      }
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.faculty, formData.university]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      university: user?.university || '',
      faculty: user?.faculty || '',
      department: user?.department || ''
    });
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile({
      name: formData.name,
      department: formData.department,
      faculty: formData.faculty,
      university: formData.university
    });

    if (result.success) {
      setSuccessModalContent({
        title: 'Profile Updated!',
        message: 'Your university, faculty, and department changes have been saved successfully.'
      });
      setIsSuccessModalOpen(true);
    } else {
      // For now, we'll show an alert for errors. You could also add an error modal later
      alert(result.message || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    setPasswordLoading(true);

    const result = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessModalContent({
        title: 'Password Updated!',
        message: 'Your password has been changed successfully.'
      });
      setIsSuccessModalOpen(true);
    } else {
      alert(result.message || 'Failed to update password');
    }

    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    const result = await deleteAccount();

    if (result.success) {
      setIsDeleteModalOpen(false);
      alert('Your account has been deleted successfully.');
      navigate('/login', { replace: true });
    } else {
      alert(result.message || 'Failed to delete account');
    }

    setDeleteLoading(false);
  };

  const universities = getUniversities();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
          <p className="text-neutral-600">Manage your account settings and preferences</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <LuUser className="w-5 h-5" />
            Profile Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <LuUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
                readOnly
              />
            </div>
            <p className="mt-1 text-sm text-neutral-500">Email cannot be changed</p>
          </div>

          {/* University Field */}
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-neutral-700 mb-2">
              University *
            </label>
            <div className="relative">
              <LuBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                id="university"
                value={formData.university}
                onChange={(e) => handleInputChange('university', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors appearance-none bg-white"
                required
              >
                <option value="">Select your university</option>
                {universities.map((university) => (
                  <option key={university} value={university}>
                    {university}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Faculty Field */}
          <div>
            <label htmlFor="faculty" className="block text-sm font-medium text-neutral-700 mb-2">
              Faculty *
            </label>
            <div className="relative">
              <LuBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                id="faculty"
                value={formData.faculty}
                onChange={(e) => handleInputChange('faculty', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors appearance-none bg-white disabled:bg-neutral-50 disabled:cursor-not-allowed"
                required
                disabled={!formData.university}
              >
                <option value="">
                  {formData.university ? 'Select your faculty' : 'Select university first'}
                </option>
                {availableFaculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Field */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-2">
              Department *
            </label>
            <div className="relative">
              <LuGraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors appearance-none bg-white disabled:bg-neutral-50 disabled:cursor-not-allowed"
                required
                disabled={!formData.faculty}
              >
                <option value="">
                  {formData.faculty ? 'Select your department' : 'Select faculty first'}
                </option>
                {availableDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-neutral-200">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <LuSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
          </form>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Change Password
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Enter your new password"
                required
              />
              <p className="mt-1 text-sm text-neutral-500">Password must be at least 6 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Confirm your new password"
                required
              />
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {passwordLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <LuSave className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-red-700">
            <LuTriangleAlert className="h-5 w-5" />
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-red-700">
            Deleting your account will permanently remove your profile, projects,
            saved content, and conversations from the platform.
          </p>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition-colors hover:bg-red-700"
          >
            <LuTrash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>

        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title={successModalContent.title}
          message={successModalContent.message}
        />
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          isDeleting={deleteLoading}
        />
      </div>
    </div>
  );
};

export default Settings;
