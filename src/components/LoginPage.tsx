import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInAnonymously 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const DEMO_ACCOUNTS = {
  'dr.sharma': {
    role: 'dietitian',
    displayName: 'Dr. Sharma',
    password: 'diet123',
    photoURL: 'https://picsum.photos/seed/sharma/200'
  },
  'rajesh.kumar': {
    role: 'patient',
    displayName: 'Rajesh Kumar',
    password: 'patient123',
    photoURL: 'https://picsum.photos/seed/rajesh/200'
  }
};

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists, if not create a default one (dietitian for now)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const profile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'New User',
          role: 'dietitian', // Default role
          photoURL: user.photoURL || ''
        };
        await setDoc(doc(db, 'users', user.uid), profile);
        localStorage.removeItem('ayurdiet_mock_session');
        onLoginSuccess(profile);
      } else {
        localStorage.removeItem('ayurdiet_mock_session');
        onLoginSuccess(userDoc.data());
      }
    } catch (err: any) {
      setError('Google login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check for demo accounts first
      const demoAccount = DEMO_ACCOUNTS[username as keyof typeof DEMO_ACCOUNTS];
      if (demoAccount && demoAccount.password === password) {
        let uid = 'demo-' + username.replace('.', '-');
        
        try {
          // Try to get a real UID if possible
          const userCredential = await signInAnonymously(auth);
          uid = userCredential.user.uid;
        } catch (authErr) {
          console.warn('Anonymous auth failed, using mock UID:', authErr);
          // Proceed with mock UID
        }
        
        const profile = {
          uid,
          email: `${username}@ayurdiet.pro`,
          displayName: demoAccount.displayName,
          role: demoAccount.role,
          photoURL: demoAccount.photoURL
        };

        // Create the profile in Firestore for this session
        await setDoc(doc(db, 'users', uid), profile);
        
        // If it's a patient, create a patient record too
        if (demoAccount.role === 'patient') {
          await setDoc(doc(db, 'patients', uid), {
            id: uid,
            name: demoAccount.displayName,
            age: 42,
            gender: 'Male',
            prakriti: 'Pitta',
            vikriti: 'Pitta',
            currentWeight: 78,
            targetWeight: 72,
            status: 'Active',
            createdAt: new Date().toISOString(),
            dietitianId: 'DEMO_DIETITIAN'
          });
        }

        onLoginSuccess(profile);
        localStorage.setItem('ayurdiet_mock_session', JSON.stringify(profile));
        return;
      }

      // Real login (requires Email/Password provider enabled in Firebase Console)
      const email = username.includes('@') ? username : `${username}@ayurdiet.pro`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        onLoginSuccess(userDoc.data());
      } else {
        setError('User profile not found.');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Demo login is active. Please use the demo buttons below or Google Login.');
      } else {
        setError('Invalid credentials or system error.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side - Brand */}
        <div className="md:w-1/2 bg-[#00966d] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Balance Wisdom <br /> With Science.
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              AyurDiet Pro: The ultimate intersection of traditional Ayurvedic healing and modern dietary management.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-3 opacity-80">
            <Shield className="w-6 h-6" />
            <span className="font-medium">HIPAA Compliant Security</span>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Enter your credentials to access the system.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Enter your username" 
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-[#00966d] focus:border-[#00966d]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-[#00966d] focus:border-[#00966d]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#00966d] hover:bg-[#007d5b] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Access Portal'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-bold">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
              disabled={isLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
              Sign in with Google
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Demo Accounts</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => useDemoAccount('dr.sharma', 'diet123')}
                className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left hover:border-[#00966d] hover:bg-green-50 transition-all group"
              >
                <span className="block text-xs font-bold text-[#00966d] mb-1">Dietitian</span>
                <span className="block text-sm text-gray-600 font-mono">dr.sharma / diet123</span>
              </button>
              <button 
                onClick={() => useDemoAccount('rajesh.kumar', 'patient123')}
                className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left hover:border-[#00966d] hover:bg-green-50 transition-all group"
              >
                <span className="block text-xs font-bold text-blue-600 mb-1">Patient</span>
                <span className="block text-sm text-gray-600 font-mono">rajesh.kumar / patient123</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
