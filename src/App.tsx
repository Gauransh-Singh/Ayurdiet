import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LoginPage from '@/components/LoginPage';
import DietitianDashboard from '@/components/DietitianDashboard';
import PatientDashboard from '@/components/PatientDashboard';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { setupDemoData } from '@/lib/demoData';
import { UserProfile } from '@/types';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Initialize demo data once
    setupDemoData();

    // Check for mock session first
    const mockSession = localStorage.getItem('ayurdiet_mock_session');
    if (mockSession) {
      setUser(JSON.parse(mockSession));
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUser(profile);
          localStorage.removeItem('ayurdiet_mock_session'); // Clear mock if real auth works
        }
      } else if (!mockSession) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00966d]"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <Sidebar 
        role={user.role} 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onSignOut={() => {
          auth.signOut();
          localStorage.removeItem('ayurdiet_mock_session');
          setUser(null);
        }}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {user.role === 'dietitian' ? (
            <DietitianDashboard 
              view={currentView} 
              user={user} 
              onViewChange={setCurrentView}
            />
          ) : (
            <PatientDashboard view={currentView} user={user} />
          )}
        </main>
      </div>
    </div>
  );
}
