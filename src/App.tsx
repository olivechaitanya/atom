import { useEffect } from 'react';
import { useStore } from './store';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GoalSheet from './pages/GoalSheet';
import CheckIn from './pages/CheckIn';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';
import ToastContainer from './components/Toast';
import './index.css';

function AppRouter() {
  const activePage = useStore(s => s.activePage);

  switch (activePage) {
    case 'dashboard': return <Dashboard />;
    case 'goals':     return <GoalSheet />;
    case 'checkin':   return <CheckIn />;
    case 'team':      return <GoalSheet />;   // Manager sees team sheets here
    case 'analytics': return <Analytics />;
    case 'reports':   return <Reports />;
    case 'admin':     return <AdminPanel />;
    default:          return <Dashboard />;
  }
}

export default function App() {
  const currentUser = useStore(s => s.currentUser);
  const initializeAuth = useStore(s => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      {!currentUser ? (
        <LoginPage />
      ) : (
        <Layout>
          <AppRouter />
        </Layout>
      )}
      <ToastContainer />
    </>
  );
}
