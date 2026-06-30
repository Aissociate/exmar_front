import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ActivityLoggerProvider } from './contexts/ActivityLoggerContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ActivityLogViewer } from './components/ActivityLogViewer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DossiersPage } from './pages/DossiersPage';
import { NewDossierPage } from './pages/NewDossierPage';
import { DossierDetailPage } from './pages/DossierDetailPage';
import { ExpertiseReportWizardPage } from './pages/ExpertiseReportWizardPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MessagesPage } from './pages/MessagesPage';

function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
          <ActivityLoggerProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <Layout>
                      <MessagesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dossiers"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <Layout>
                      <DossiersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dossiers/new"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <Layout>
                      <NewDossierPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dossiers/:id"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <Layout>
                      <DossierDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dossiers/:dossierId/expertise-report"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <ExpertiseReportWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <Layout>
                      <ReportsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/:reportId/wizard"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <ExpertiseReportWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <ActivityLogViewer />
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ActivityLoggerProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
