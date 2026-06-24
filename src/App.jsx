import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';
import ContentDetail from './pages/ContentDetail';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#111111] text-gray-200 font-sans overflow-hidden">
        <Sidebar onLogout={() => supabase.auth.signOut()} />
        
        <main className="flex-1 overflow-y-auto p-8 bg-[#18181b] rounded-tl-2xl shadow-inner ml-2 mt-2 border-t border-l border-[#27272a]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/build" element={<Generator />} />
            <Route path="/content/:id" element={<ContentDetail session={session} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
