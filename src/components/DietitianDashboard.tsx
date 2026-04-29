import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Clock, 
  Calendar, 
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import PatientManagement from './PatientManagement';
import ClinicalAnalysisForm from './ClinicalAnalysisForm';
import DietBuilder from './DietBuilder';
import AnalyticsView from './AnalyticsView';
import RegisterPatientModal from './RegisterPatientModal';
import PatientDashboard from './PatientDashboard';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { Patient, UserProfile } from '@/types';

const activityData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 19 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 5 },
];

interface DietitianDashboardProps {
  view: string;
  user: UserProfile;
  onViewChange: (view: string) => void;
}

export default function DietitianDashboard({ view, user, onViewChange }: DietitianDashboardProps) {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'patients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      console.log('Fetched patients:', patientData.length);
      // Sort manually to avoid index requirement
      const sortedData = patientData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPatients(sortedData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'appointments'), where('date', '==', today));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apptData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(apptData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'appointments'), where('date', '==', today));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apptData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(apptData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => unsubscribe();
  }, []);

  const vataCount = patients.filter(p => p.prakriti === 'Vata').length;
  const pittaCount = patients.filter(p => p.prakriti === 'Pitta').length;
  const kaphaCount = patients.filter(p => p.prakriti === 'Kapha').length;

  const prakritiData = [
    { name: 'Vata', value: vataCount, color: '#3b82f6' },
    { name: 'Pitta', value: pittaCount, color: '#ef4444' },
    { name: 'Kapha', value: kaphaCount, color: '#f59e0b' },
  ];

  if (view === 'patient-dashboard') return (
    <PatientDashboard 
      view="dashboard" 
      user={{ 
        uid: selectedPatientId || '', 
        email: patients.find(p => p.id === selectedPatientId)?.email || '',
        displayName: patients.find(p => p.id === selectedPatientId)?.name || '',
        role: 'patient'
      }} 
    />
  );

  if (view === 'patient-dashboard') return (
    <PatientDashboard 
      view="dashboard" 
      user={{ 
        uid: selectedPatientId || '', 
        email: patients.find(p => p.id === selectedPatientId)?.email || '',
        displayName: patients.find(p => p.id === selectedPatientId)?.name || '',
        role: 'patient'
      }} 
    />
  );

  if (view === 'patients') return (
    <PatientManagement 
      user={user} 
      onViewChange={(newView, patientId) => {
        if (patientId) setSelectedPatientId(patientId);
        onViewChange(newView);
      }} 
    />
  );
  if (view === 'analysis') return <ClinicalAnalysisForm />;
  if (view === 'diet-builder') return (
    <DietBuilder 
      initialPatientId={selectedPatientId} 
      onClearPatient={() => setSelectedPatientId(null)} 
    />
  );
  if (view === 'analytics') return <AnalyticsView patients={patients} />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Dr. Sharma. Manage your clinic effectively.</p>
        </div>
        <Button 
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-[#00966d] hover:bg-[#007d5b] text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-green-100"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Patient
        </Button>
      </div>

      <RegisterPatientModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        dietitianId={user.uid}
        patient={null}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Patients" 
          value={patients.length.toString()} 
          change={`+${patients.length}`} 
          trend="up" 
          icon={Users} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Active Plans" 
          value="0" 
          change="Sync" 
          trend="neutral" 
          icon={Activity} 
          iconBg="bg-green-50" 
          iconColor="text-green-600" 
        />
        <StatCard 
          title="Reviews" 
          value="18" 
          change="-2" 
          trend="down" 
          icon={Clock} 
          iconBg="bg-orange-50" 
          iconColor="text-orange-600" 
        />
        <StatCard 
          title="Consultations" 
          value={appointments.length.toString()} 
          change="Today" 
          trend="neutral" 
          icon={Calendar} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clinic Activity Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-gray-900">Clinic Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#00966d" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prakriti Mix Chart */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-gray-900">Prakriti Mix</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prakritiData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {prakritiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900">{patients.length}</span>
                <span className="text-xs text-gray-400 font-medium">Patients</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 mt-4">
              {prakritiData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value} Patients</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registry */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Recent Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {patients.slice(0, 5).map((patient) => (
                <RecentPatientItem 
                  key={patient.id}
                  name={patient.name} 
                  prakriti={patient.prakriti} 
                  date={(patient.createdAt || '').split('T')[0]} 
                  initials={(patient.name || '').split(' ').map(n => n[0]).join('')} 
                  color={
                    patient.prakriti === 'Vata' ? "bg-blue-100 text-blue-700" :
                    patient.prakriti === 'Pitta' ? "bg-red-100 text-red-700" :
                    "bg-orange-100 text-orange-700"
                  }
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    onViewChange('diet-builder');
                  }}
                />
              ))}
              {patients.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No patients registered yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Consults */}
        <Card className="bg-[#0f172a] border-none shadow-sm rounded-3xl overflow-hidden text-white">
          <CardHeader className="flex flex-row items-center gap-3">
            <Calendar className="w-5 h-5 text-green-400" />
            <CardTitle className="text-lg font-bold">Daily Consults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map(appt => (
                <ConsultItem 
                  key={appt.id}
                  time={appt.time} 
                  name={appt.patientName} 
                  type={appt.type} 
                />
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm bg-white/5 rounded-2xl border border-dashed border-white/10">
                No consults scheduled for today.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, iconBg, iconColor }: any) {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-2xl", iconBg)}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend === 'up' ? "bg-green-50 text-green-600" : 
            trend === 'down' ? "bg-red-50 text-red-600" : 
            "bg-gray-50 text-gray-500"
          )}>
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentPatientItem({ name, prakriti, date, initials, color, onClick }: any) {
  return (
    <div 
      className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg", color)}>
          {initials}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{prakriti} Prakriti • Added {date}</p>
        </div>
      </div>
      <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-all" />
    </div>
  );
}

function ConsultItem({ time, name, type }: any) {
  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400">{time}</span>
        <span className={cn(
          "text-[10px] font-black px-2 py-0.5 rounded-md",
          type === 'REVIEW' ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
        )}>{type}</span>
      </div>
      <h4 className="font-bold text-white">{name}</h4>
    </div>
  );
}
