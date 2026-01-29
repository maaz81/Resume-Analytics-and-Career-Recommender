import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * Dropdown Component
 * Custom select dropdown with search functionality
 * 
 * @param {string} label - Dropdown label
 * @param {string} placeholder - Placeholder text
 * @param {Array} options - Array of options [{value, label}]
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {boolean} searchable - Enable search
 * @param {boolean} disabled - Disable dropdown
 * @param {boolean} required - Mark as required
 */
const Dropdown = ({
  label,
  placeholder = 'Select an option',
  options = [],
  value,
  onChange,
  error,
  searchable = false,
  disabled = false,
  required = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-status-error focus:border-status-error focus:ring-status-error/20'
            : 'border-border focus:border-brand-primary focus:ring-brand-primary/20',
          disabled
            ? 'bg-disabled-bg text-disabled-text cursor-not-allowed'
            : 'bg-surface-card text-text-primary hover:border-brand-primary',
          isOpen && 'border-brand-primary ring-2 ring-brand-primary/20'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-text-primary' : 'text-text-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-text-muted transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-dropdown w-full mt-2 bg-surface-card border border-border rounded-lg shadow-lg max-h-60 overflow-hidden animate-slideInUp"
          role="listbox"
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'bg-brand-primary text-white'
                        : 'text-text-primary hover:bg-surface-alt'
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-text-muted text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-status-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Dropdown;