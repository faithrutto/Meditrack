import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSpinner from './components/LoadingSpinner';

const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Mfa = React.lazy(() => import('./pages/Mfa'));
const PatientDashboard = React.lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = React.lazy(() => import('./pages/DoctorDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Appointments = React.lazy(() => import('./pages/Appointments'));
const Profile = React.lazy(() => import('./pages/Profile'));
const VerifyOTP = React.lazy(() => import('./pages/VerifyOTP'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Layout = React.lazy(() => import('./components/Layout'));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to home/default dashboard
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'PATIENT') return <Navigate to="/patient" replace />;
  if (user.role === 'PROVIDER') return <Navigate to="/doctor" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <React.Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/mfa" element={<Mfa />} />

              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardRouter />} />

                <Route path="patient" element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                } />

                <Route path="doctor" element={
                  <ProtectedRoute allowedRoles={['PROVIDER']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } />

                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="appointments" element={
                  <ProtectedRoute allowedRoles={['PATIENT', 'PROVIDER']}>
                    <Appointments />
                  </ProtectedRoute>
                } />

                <Route path="profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </React.Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
