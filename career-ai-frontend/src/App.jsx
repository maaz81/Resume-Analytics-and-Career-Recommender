import AppRoutes from '@routes/AppRoutes';

/**
 * Root App Component
 * Renders the main routing structure
 */
function App() {
  return (
    <div className="min-h-screen bg-surface-background">
      <AppRoutes />
    </div>
  );
}

export default App;