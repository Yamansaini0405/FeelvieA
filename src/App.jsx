import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/users/UsersPage";
import CarouselsPage from "./pages/carousels/CarouselsPage";
import CouponsPage from "./pages/coupons/CouponsPage";
import PlansPage from "./pages/plans/PlansPage";
import CreditsPage from "./pages/credits/CreditsPage";
import ImageHistoryPage from "./pages/history/ImageHistoryPage";
import QueriesPage from "./pages/queries/QueriesPage";
import UserSubscriptions from "./pages/subscriptions/UserSubscriptions";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/carousels" element={<CarouselsPage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/queries" element={<QueriesPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/image-history" element={<ImageHistoryPage />} />
            <Route path="/user-subscriptions" element={<UserSubscriptions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
