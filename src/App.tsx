import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useUserStore } from "./stores/userStore";
import { Auth } from "./components/Auth";
import { ServiceSelection } from "./components/ServiceSelection";
import { Chat } from "./components/Chat";

const App: React.FC = () => {
  const { user } = useUserStore();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/services" replace /> : <Auth />}
        />
        <Route
          path="/services"
          element={user ? <ServiceSelection /> : <Navigate to="/" replace />}
        />
        <Route
          path="/chat/:serviceId"
          element={user ? <Chat /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
