import AppRoutes from '@routes/AppRoutes';
import { ErrorBoundary } from '@components/ui';

/**
 * Root App Component
 * Renders the main routing structure with error boundary
 */
function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface-background">
        <AppRoutes />
      </div>
    </ErrorBoundary>
  );
}

export default App;