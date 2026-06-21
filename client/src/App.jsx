import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import InvitePage from "./pages/InvitePage";
import Home from "./pages/Home.jsx";
import EditorPage from "./pages/EditorPage.jsx";


function App() {

  return (
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>}
        />
        <Route path="/workspace/:roomId" element={<ProtectedRoute>
          <EditorPage />
          </ProtectedRoute>}/>
        <Route path="/invite/:roomId" element={<InvitePage />}/>

        <Route
          path="/"
          element={<Home />}
        />

      </Routes>

  );
}

export default App;