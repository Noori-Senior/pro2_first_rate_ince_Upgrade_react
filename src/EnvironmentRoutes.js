import { useParams, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute.js";
import { LoginPage } from "./components/LoginPage.js";
import LandingPage from "./components/LandingPage.js";
import DataValue from "./components/datavalue/DataValueWithDDL.js";
import DashboardContent from "./components/dashboard/DashboardContent.tsx";
import { ConfigProvider } from "./components/contexts/ConfigContext"; // 👈 New context

const EnvironmentRoutes = ({ config }) => {
  const { env } = useParams();

  return (
    <ConfigProvider env={env} config={config}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="" element={<PrivateRoute />}>
          <Route element={<LandingPage />}>
            <Route index element={<Navigate to={`/${env}/dashboard`} />} />
            <Route path="dashboard" element={<DashboardContent />} />
            <Route path="data-value" element={<DataValue />} />
          </Route>
        </Route>
      </Routes>
    </ConfigProvider>
  );
};

export default EnvironmentRoutes;
