import clsx from 'clsx';

/**
 * Utility function to merge Tailwind classes
 * Uses clsx for conditional class names
 * @param {...any} classes - Class names to merge
 * @returns {string} - Merged class string
 */
export const cn = (...classes) => {
  return clsx(...classes);
};

/**
 * Format ATS score to percentage
 * @param {number} score - Score value (0-100)
 * @returns {string} - Formatted percentage
 */
export const formatATSScore = (score) => {
  return `${Math.round(score)}%`;
};

/**
 * Get ATS score color based on value
 * @param {number} score - Score value (0-100)
 * @returns {string} - Tailwind color class
 */
export const getATSScoreColor = (score) => {
  if (score >= 80) return 'text-status-success';
  if (score >= 60) return 'text-status-warning';
  return 'text-status-error';
};

/**
 * Get ATS score background color
 * @param {number} score - Score value (0-100)
 * @returns {string} - Tailwind background color class
 */
export const getATSScoreBgColor = (score) => {
  if (score >= 80) return 'bg-status-success-light';
  if (score >= 60) return 'bg-status-warning-light';
  return 'bg-status-error-light';
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Calculate progress percentage
 * @param {number} completed - Completed items
 * @param {number} total - Total items
 * @returns {number} - Progress percentage
 */
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get skill level badge color
 * @param {string} level - Skill level (beginner, intermediate, advanced)
 * @returns {string} - Tailwind color classes
 */
export const getSkillLevelColor = (level) => {
  const colors = {
    beginner: 'bg-status-info-light text-status-info-dark',
    intermediate: 'bg-status-warning-light text-status-warning-dark',
    advanced: 'bg-status-success-light text-status-success-dark',
  };
  return colors[level.toLowerCase()] || colors.beginner;
};

/**
 * Get priority badge color
 * @param {string} priority - Priority level (high, medium, low)
 * @returns {string} - Tailwind color classes
 */
export const getPriorityColor = (priority) => {
  const colors = {
    high: 'bg-status-error-light text-status-error-dark',
    medium: 'bg-status-warning-light text-status-warning-dark',
    low: 'bg-status-info-light text-status-info-dark',
  };
  return colors[priority.toLowerCase()] || colors.medium;
};