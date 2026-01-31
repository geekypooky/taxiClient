import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ChatWidget from "./components/ChatWidget";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";

// User Pages
import Home from "./pages/Home";
import SearchTaxis from "./pages/SearchTaxis";
import Payment from "./pages/Payment";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageTaxis from "./pages/admin/ManageTaxis";
import ManageRoutes from "./pages/admin/ManageRoutes";
import ViewBookings from "./pages/admin/ViewBookings";

import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* ... existing routes ... */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected User Routes */}
              <Route path="/search" element={<SearchTaxis />} />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/taxis"
                element={
                  <AdminRoute>
                    <ManageTaxis />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/routes"
                element={
                  <AdminRoute>
                    <ManageRoutes />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/bookings"
                element={
                  <AdminRoute>
                    <ViewBookings />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
          <ChatWidget />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
