import { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CreateReport from './pages/CreateReport';
import TransformData from './pages/TransformData';
import WorkerFiles from "./pages/WorkerFiles";
import AddWorker from './pages/AddWorker';
import DetailWorker from './pages/DetailWorker';
import EditWorker from './pages/EditWorker';
import Dashboard from './pages/Dashboard';
import { Icons } from './constants/Icons';
import LoginPage from './pages/Login';
import DashboardGeneral from './components/DashboardGeneral copy';

// Componente para rutas privadas
function PrivateRoute({ children, isAuthenticated }) {
  const authed = isAuthenticated || !!localStorage.getItem("access");
  return authed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("access"));

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access") setIsAuthenticated(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Función para login (recibe token del backend)
  const handleLogin = (token) => {
    localStorage.setItem("access", token);
    setIsAuthenticated(true);
  };

  // Función para logout
  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  }

  function AppContent() {
    const location = useLocation();
    const isLoginRoute = location.pathname === '/login';
    const hasHeader = isAuthenticated && !isLoginRoute;

    // Actualiza una variable CSS --app-height para manejar cambios de barra de URL móvil / resize
    useLayoutEffect(() => {
      const setVh = () => {
        const vh = window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${vh}px`);
      };
      setVh();
      window.addEventListener('resize', setVh);
      window.addEventListener('orientationchange', setVh);
      return () => {
        window.removeEventListener('resize', setVh);
        window.removeEventListener('orientationchange', setVh);
      };
    }, []);

    const gridRows = hasHeader ? 'auto 1fr' : '1fr';

    return (
      <div
        className="grid bg-primary relative overflow-x-hidden overflow-y-auto w-full min-w-0"
        style={{
          gridTemplateRows: gridRows,
          minHeight: '100dvh',
          width: '100%',
        }}
      >
        {/* Sidebar solo si está autenticado y no es login */}
        {hasHeader && (
          <aside className="z-2 w-full">
            <div className="glass-primary rounded-sm mx-3 mt-2 mb-1 py-2">
              <Sidebar onLogout={handleLogout} />
            </div>
          </aside>
        )}

        {/* Sidebar móvil */}
        {hasHeader && menuVisible && (
          <div className="fixed inset-0 z-40 bg-primary p-6 shadow-xl lg:hidden transition-transform">
            <button
              onClick={() => setMenuVisible(false)}
              className="absolute top-4 right-4 p-2 text-primary"
            >
              {Icons.close()}
            </button>
            <Sidebar onLogout={handleLogout} />
          </div>
        )}

        {/* IMPORTANTE: posicionar el main en la fila correcta */}
        <main
          className={`min-h-0 bg-primary overflow-hidden relative w-full max-w-full min-w-0 ${
            hasHeader ? '' : ''
          }`}
        >
          <Routes>
            {/* Rutas privadas */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <DashboardGeneral />
                </PrivateRoute>
              }
            />
            <Route
              path="/generar-informe"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <CreateReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/exportar-datos"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <TransformData />
                </PrivateRoute>
              }
            />
            <Route
              path="/transformar-datos"
              element={<Navigate to="/exportar-datos" replace />}
            />
            <Route
              path="/gestionar-trabajadores"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <WorkerFiles />
                </PrivateRoute>
              }
            />
            <Route
              path="/añadir-trabajador"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <AddWorker />
                </PrivateRoute>
              }
            />
            <Route
              path="/detalles-trabajador/:id"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <DetailWorker />
                </PrivateRoute>
              }
            />
            <Route
              path="/editar-trabajador/:id"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <EditWorker />
                </PrivateRoute>
              }
            />

            {/* Login vive en /login */}
            <Route path="/login" element={<LoginPage setIsAuthenticated={handleLogin} />} />

            {/* Raíz: decide una sola vez según estado */}
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? "/gestionar-trabajadores" : "/login"} replace />}
            />

            {/* 404 */}
            <Route path="*" element={<div>Página no encontrada</div>} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}
