// ===== src/components/forms/FormInput/FormInput.jsx =====
import Input from '@common/Input';

/**
 * FormInput - Input wrapper for form libraries (React Hook Form, Formik)
 */
const FormInput = ({ name, control, error, ...props }) => {
  return <Input {...props} error={error?.message} />;
};

export default FormInput;