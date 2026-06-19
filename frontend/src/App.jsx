import { Routes, Route, Navigate } from 'react-router-dom';
import Register                from './pages/Register';
import Login                   from './pages/Login';
import Search                  from './pages/Search';
import CPForm                  from './pages/CPForm';
import CollectorDashboard      from './pages/CollectorDashboard';
import MySubmissions           from './pages/MySubmissions';
import ModeratorDashboard      from './pages/ModeratorDashboard';
import SubmissionReviewDetail  from './pages/SubmissionReviewDetail';
import AdminDashboard          from './pages/AdminDashboard';
import AdminCareerPath         from './pages/AdminCareerPath';
import ProtectedRoute          from './components/ProtectedRoute';
import Navbar                  from './components/Navbar';
import { isAuthenticated, getUser } from './utils/auth';

function WithNavbar({ children }) {
  return (
    <>
      <Navbar />
      <div className="page-content">{children}</div>
    </>
  );
}

function RoleRedirect() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const role = getUser()?.role;
  if (role === 'admin')     return <Navigate to="/admin" replace />;
  if (role === 'moderator') return <Navigate to="/moderator-dashboard" replace />;
  if (role === 'collector') return <Navigate to="/collector" replace />;
  return <Navigate to="/search" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/register" element={<Register />} />
      <Route path="/login"    element={<Login />} />

      {/* User: explore + submit own path */}
      <Route path="/search" element={
        <ProtectedRoute roles={['user', 'collector', 'admin']}>
          <WithNavbar><Search /></WithNavbar>
        </ProtectedRoute>
      } />
      <Route path="/cp-form" element={
        <ProtectedRoute roles={['user', 'admin']}>
          <WithNavbar><CPForm /></WithNavbar>
        </ProtectedRoute>
      } />

      {/* Collector dashboard */}
      <Route path="/collector" element={
        <ProtectedRoute roles={['collector', 'admin']}>
          <WithNavbar><CollectorDashboard /></WithNavbar>
        </ProtectedRoute>
      } />

      {/* Collector: view my submissions */}
      <Route path="/my-submissions" element={
        <ProtectedRoute roles={['collector', 'admin']}>
          <WithNavbar><MySubmissions /></WithNavbar>
        </ProtectedRoute>
      } />

      {/* Moderator dashboard */}
      <Route path="/moderator-dashboard" element={
        <ProtectedRoute roles={['moderator', 'admin']}>
          <WithNavbar><ModeratorDashboard /></WithNavbar>
        </ProtectedRoute>
      } />

      {/* Moderator: view & review submission details */}
      <Route path="/submission-review/:id" element={
        <ProtectedRoute roles={['moderator', 'admin']}>
          <WithNavbar><SubmissionReviewDetail /></WithNavbar>
        </ProtectedRoute>
      } />

      {/* Admin dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <WithNavbar><AdminDashboard /></WithNavbar>
        </ProtectedRoute>
      } />
      <Route path="/admin/path/:id" element={
        <ProtectedRoute roles={['admin']}>
          <WithNavbar><AdminCareerPath /></WithNavbar>
        </ProtectedRoute>
      } />

      {/* Default redirect based on role */}
      <Route path="/"  element={<RoleRedirect />} />
      <Route path="*"  element={<RoleRedirect />} />
    </Routes>
  );
}

export default App;
