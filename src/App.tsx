import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ShoppingCartPage from './pages/ShoppingCartPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<ShoppingCartPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </>
  );
}