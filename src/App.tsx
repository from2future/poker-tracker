import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Players } from './pages/Players';
import { Sessions } from './pages/Sessions';
import { SessionDetails } from './pages/SessionDetails';
import { Login } from './pages/Login';
import { AuthGuard } from './components/AuthGuard';
import { useEffect } from 'react';
import { usePokerStore } from './store/usePokerStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const fetchInitialData = usePokerStore((state) => state.fetchInitialData);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, fetchInitialData]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AuthGuard />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="players" element={<Players />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="sessions/:sessionId" element={<SessionDetails />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
