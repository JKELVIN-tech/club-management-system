import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MembersListPage } from './pages/MembersListPage';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { MyProfileRedirect } from './pages/MyProfileRedirect';
import { FinancePage } from './pages/FinancePage';
import { EventsListPage } from './pages/EventsListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { ReportsPage } from './pages/ReportsPage';

export default function App() {
  const fetchCurrentMember = useAuthStore((s) => s.fetchCurrentMember);

  useEffect(() => {
    fetchCurrentMember();
  }, [fetchCurrentMember]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<MyProfileRedirect />} />

            <Route path="/members/:id" element={<MemberProfilePage />} />
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TREASURER', 'SECRETARY']} />}>
              <Route path="/members" element={<MembersListPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TREASURER']} />}>
              <Route path="/finance" element={<FinancePage />} />
            </Route>

            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/communication" element={<CommunicationPage />} />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SECRETARY', 'TREASURER']} />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
