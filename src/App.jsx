import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CreateReport from './pages/CreateReport';
import TransformData from './pages/TransformData';
import WorkerFiles from './pages/WorkerFiles';
import AddWorker from './pages/AddWorker';
import DetailWorker from './pages/DetailWorker';
import EditWorker from './pages/EditWorker';
import Dashboard from './pages/Dashboard';
import { Icons } from './constants/Icons';
import LoginPage from './pages/Login';
import DashboardGeneral from './components/DashboardGeneral';

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

    return (
      <div className="grid grid-rows-[4rem_1fr] bg-primary h-screen relative">
        {/* Sidebar solo si está autenticado y no es login */}
        {hasHeader && (
          <aside className="my-2 mx-3 z-2 glass-primary rounded-sm">
            <Sidebar onLogout={handleLogout} />
          </aside>
        )}

        {/* Botón menú solo si hay header */}
        {hasHeader && (
          <button
            onClick={() => setMenuVisible(true)}
            className="sm:hidden fixed top-4 left-4 z-50 bg-primary px-4 py-1 rounded-full"
          >
            {Icons.menu}
          </button>
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
          className={`h-full bg-primary overflow-hidden relative ${
            hasHeader ? 'row-start-2' : 'row-start-1 row-span-2'
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
              path="/transformar-datos"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <TransformData />
                </PrivateRoute>
              }
            />
            <Route
              path="/archivos-trabajadores"
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
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
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
