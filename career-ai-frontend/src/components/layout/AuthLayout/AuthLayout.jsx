/**
 * AuthLayout - Layout for authentication pages
 * Centered content with minimal UI
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-background px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;