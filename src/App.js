import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute.js";
import { LoginPage } from "./components/LoginPage.js";
import LandingPage from "./components/LandingPage.js";
import NotFoundPage from "./components/NotFoundPage.js";
import BeginingBalance from './components/audits/auditsColumnTitles/auditsDetails/BeginingBalance.tsx';
// ------------------------------------------------------------------------------------------
// Data Value
//-------------------------------------------------------------------------------------------
import DataValue from "./components/datavalue/DataValueWithDDL.js";
import ManageGroups from "./components/manage-groups/ManageGroups.js";
import AuditsReports from "./components/audits/AuditsReports.js";
import AnalyticsReports from "./components/analytics/AnalyticsReports.js";
import DashboardContent from "./components/dashboard/DashboardContent.tsx";
//-------------------------------------------------------------------------------------------
import { UserProvider } from "./components/contexts/UserContext.js";
import { AuthProvider } from "./components/contexts/AuthContext.js";
import IdleHandler from "./components/IdleHandler.js";
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

const App = () => {

  return (
    <UserProvider>
      <AuthProvider>
        <Router>
          <IdleHandler>
            <QueryClientProvider client={queryClient}>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />
                {/* Protected Route */}
                <Route path="/" element={<PrivateRoute />}>
                  {/* Layout with Sidebar */}
                  <Route element={<LandingPage />}>
                    {/* Redirect '/' to '/dashboard' */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    {/* Nested Routes */}
                    <Route path="/dashboard" element={<DashboardContent />} />
                    <Route path="/data-value" element={<DataValue />} />
                    <Route path="/manage-groups" element={<ManageGroups />} />
                    <Route path="/audits-reports" element={<AuditsReports />} />
                    <Route path="/analytic-reports" element={<AnalyticsReports />} />
                         
                    
                  </Route>
                </Route>

                {/* 404 Route (must be last) */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </QueryClientProvider>
            
          </IdleHandler>
        </Router>
      </AuthProvider>
    </UserProvider>
  );
  
}

export default App;
