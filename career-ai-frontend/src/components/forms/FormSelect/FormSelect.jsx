// ===== src/components/forms/FormSelect/FormSelect.jsx =====
import Dropdown from '@common/Dropdown';

/**
 * FormSelect - Dropdown wrapper for form libraries
 */
const FormSelect = ({ name, control, error, ...props }) => {
  return <Dropdown {...props} error={error?.message} />;
};

export default FormSelect;