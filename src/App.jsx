import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MaintenancePage from './pages/MaintenancePage';
import RecurringTemplatesPage from './pages/RecurringTemplatesPage';
import RecurringTemplatesPageDebug from './pages/RecurringTemplatesPageDebug';
import InventoryPage from './pages/InventoryPage';
import EquipmentPage from './pages/EquipmentPage';
import OperatorsPage from './pages/OperatorsPage';
import RequisitionsPage from './pages/RequisitionsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/layout/Layout';

// Componente de ruta protegida
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.rol !== requiredRole && user.rol !== 'administrador') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="recurring-templates" element={<RecurringTemplatesPage />} />
          <Route path="recurring-templates-debug" element={<RecurringTemplatesPageDebug />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="operators" element={<OperatorsPage />} />
          <Route path="requisitions" element={<RequisitionsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route 
            path="settings" 
            element={
              <ProtectedRoute requiredRole="administrador">
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Inicializar base de datos
    const initDatabase = async () => {
      try {
        // En un entorno Electron, esto se manejaría diferente
        // Por ahora, simulamos la inicialización
        console.log('🔄 App.jsx: Inicializando DEVAD-MTO...');
        
        // Simular carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ App.jsx: Inicialización completa, setDbInitialized(true)');
        setDbInitialized(true);
        console.log('✅ App.jsx: DEVAD-MTO listo');
      } catch (err) {
        console.error('❌ App.jsx: Error al inicializar:', err);
        setError(err.message);
      }
    };

    initDatabase();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-danger-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            Error al inicializar
          </h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dbInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">DEVAD-MTO</h1>
            <p className="text-primary-100">Sistema Integral de Mantenimiento</p>
          </div>
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          <p className="text-white text-sm">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
