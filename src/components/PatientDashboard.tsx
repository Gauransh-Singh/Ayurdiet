import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Apple, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Flame,
  Droplets,
  Wind,
  Check,
  X,
  Zap,
  Clock,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query, where, doc, getDoc, setDoc, addDoc, getDocs } from 'firebase/firestore';
import { UserProfile, Patient, DietPlan, Dish } from '@/types';
import { calculateDishNutrition } from '@/lib/nutrition';

const weightData = [
  { name: 'Week 1', weight: 78 },
  { name: 'Week 2', weight: 77.2 },
  { name: 'Week 3', weight: 76.8 },
  { name: 'Week 4', weight: 76.1 },
  { name: 'Week 5', weight: 75.5 },
];

export default function PatientDashboard({ view, user }: { view: string, user: UserProfile }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Fetch patient record by email or ID
    const pQuery = query(collection(db, 'patients'), where('email', '==', user.email));
    
    const unsubscribePatient = onSnapshot(pQuery, (snapshot) => {
      if (!snapshot.empty) {
        setPatient({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Patient);
      } else {
        // Fallback to ID if email not found (for existing records)
        const pRef = doc(db, 'patients', user.uid);
        getDoc(pRef).then(snap => {
          if (snap.exists()) {
            setPatient({ id: snap.id, ...snap.data() } as Patient);
          }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
    });

    return () => unsubscribePatient();
  }, [user.uid, user.email]);

  useEffect(() => {
    if (patient) {
      // Fetch Diet Plan
      const dpQuery = query(collection(db, 'dietPlans'), where('patientId', '==', patient.id));
      const unsubscribeDP = onSnapshot(dpQuery, (snapshot) => {
        if (!snapshot.empty) {
          setDietPlan(snapshot.docs[0].data() as DietPlan);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'dietPlans');
      });

      // Fetch Meal Logs for today
      const mlQuery = query(
        collection(db, 'mealLogs'), 
        where('patientId', '==', patient.id),
        where('date', '==', dateStr)
      );
      const unsubscribeML = onSnapshot(mlQuery, (snapshot) => {
        setMealLogs(snapshot.docs.map(doc => doc.data()));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'mealLogs');
      });

      return () => {
        unsubscribeDP();
        unsubscribeML();
      };
    }
  }, [patient, dateStr]);

  const handleToggleMeal = async (slotId: string, dish: Dish) => {
    if (!patient) return;
    
    const logId = `${patient.id}_${dateStr}_${slotId}_${dish.id}`;
    const logRef = doc(db, 'mealLogs', logId);
    const logSnap = await getDoc(logRef);

    if (logSnap.exists()) {
      const currentData = logSnap.data();
      await setDoc(logRef, { taken: !currentData.taken }, { merge: true });
    } else {
      const nutrition = calculateDishNutrition(dish);
      await setDoc(logRef, {
        patientId: patient.id,
        date: dateStr,
        slotId,
        dishId: dish.id,
        dishName: dish.name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        taken: true,
        timestamp: new Date().toISOString()
      });
    }
  };

  const todaysPlan = (dietPlan?.schedule as any)?.[today] || {};
  const slots = [
    { id: 'breakfast', label: 'Breakfast', time: '08:00 AM' },
    { id: 'mid-morning', label: 'Mid-Morning', time: '10:30 AM' },
    { id: 'lunch', label: 'Lunch', time: '01:00 PM' },
    { id: 'evening', label: 'Evening Snack', time: '04:30 PM' },
    { id: 'dinner', label: 'Dinner', time: '07:30 PM' },
  ];

  const totals = mealLogs
    .filter(log => log.taken)
    .reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  if (view === 'diet-plan') return <PatientDietPlan patient={patient} dietPlan={dietPlan} />;
  if (view === 'progress') return <PatientProgress patient={patient} mealLogs={mealLogs} />;
  if (view === 'profile') return <PatientProfile patient={patient} />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Center</h1>
          <p className="text-gray-500 mt-1">Namaste, {patient?.name || 'User'}. Your Ayurvedic journey continues.</p>
        </div>
        <div className="flex gap-4">
          <NutrientCard label="Calories" value={Math.round(totals.calories)} unit="kcal" icon={Zap} color="text-orange-600" bg="bg-orange-50" />
          <NutrientCard label="Protein" value={Math.round(totals.protein)} unit="g" icon={Activity} color="text-blue-600" bg="bg-blue-50" />
          <NutrientCard label="Carbs" value={Math.round(totals.carbs)} unit="g" icon={Apple} color="text-green-600" bg="bg-green-50" />
        </div>
      </div>

      {/* Constitution Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">My Constitution (Prakriti)</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid grid-cols-3 gap-6">
              <DoshaStatus 
                dosha="Vata" 
                percentage={patient?.prakriti === 'Vata' ? 70 : 15} 
                icon={Wind} 
                color="text-blue-600" 
                bg="bg-blue-50" 
                barColor="bg-blue-500" 
              />
              <DoshaStatus 
                dosha="Pitta" 
                percentage={patient?.prakriti === 'Pitta' ? 70 : 15} 
                icon={Flame} 
                color="text-red-600" 
                bg="bg-red-50" 
                barColor="bg-red-500" 
              />
              <DoshaStatus 
                dosha="Kapha" 
                percentage={patient?.prakriti === 'Kapha' ? 70 : 15} 
                icon={Droplets} 
                color="text-orange-600" 
                bg="bg-orange-50" 
                barColor="bg-orange-500" 
              />
            </div>
            <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00966d]" />
                Clinical Insight
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {patient?.vikriti ? `Your current imbalance (Vikriti) is ${patient.vikriti}. ` : ''}
                Focus on pacifying your primary dosha through the prescribed diet plan below.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-[#0f172a] text-white">
          <CardHeader className="pb-2 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Today's Regimen</CardTitle>
              <Badge className="bg-green-500/20 text-green-400 border-none">{today}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {slots.map((slot) => {
                const dishes = todaysPlan[slot.id] || [];
                return (
                  <div key={slot.id} className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{slot.time}</span>
                      </div>
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{slot.label}</span>
                    </div>
                    <div className="space-y-3">
                      {dishes.map((dish: Dish) => {
                        const isTaken = mealLogs.find(l => l.slotId === slot.id && l.dishId === dish.id && l.taken);
                        return (
                          <div key={dish.id} className="flex items-center justify-between group">
                            <p className={cn("font-bold text-sm transition-all", isTaken ? "text-gray-500 line-through" : "text-white")}>
                              {dish.name}
                            </p>
                            <button 
                              onClick={() => handleToggleMeal(slot.id, dish)}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                isTaken ? "bg-green-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                              )}
                            >
                              {isTaken ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })}
                      {dishes.length === 0 && (
                        <p className="text-xs text-gray-500 italic">No meals scheduled</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Weight Progress</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Target: {patient?.targetWeight || '--'} kg</p>
          </div>
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <TrendingUp className="w-5 h-5" />
            <span>Current: {patient?.currentWeight || '--'} kg</span>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
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
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#00966d" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#00966d', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NutrientCard({ label, value, unit, icon: Icon, color, bg }: any) {
  return (
    <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-3">
      <div className={cn("p-2 rounded-xl", bg)}>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value} <span className="text-[10px] text-gray-400">{unit}</span></p>
      </div>
    </div>
  );
}

function DoshaStatus({ dosha, percentage, icon: Icon, color, bg, barColor }: any) {
  return (
    <div className="space-y-4">
      <div className={cn("p-4 rounded-2xl flex items-center justify-between", bg)}>
        <div className={cn("p-2 bg-white rounded-xl shadow-sm", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn("text-lg font-bold", color)}>{percentage}%</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>{dosha}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", barColor)} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: any) {
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", className)}>
      {children}
    </span>
  );
}

function PatientDietPlan({ patient, dietPlan }: { patient: Patient | null, dietPlan: DietPlan | null }) { 
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots = [
    { id: 'breakfast', label: 'Breakfast', time: '08:00 AM' },
    { id: 'mid-morning', label: 'Mid-Morning', time: '10:30 AM' },
    { id: 'lunch', label: 'Lunch', time: '01:00 PM' },
    { id: 'evening', label: 'Evening Snack', time: '04:30 PM' },
    { id: 'dinner', label: 'Dinner', time: '07:30 PM' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Weekly Regimen</h1>
        <p className="text-gray-500 mt-1">A balanced timetable prescribed specifically for your {patient?.prakriti} constitution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {days.map(day => (
          <div key={day} className="space-y-4">
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
              <p className="font-bold text-gray-900">{day}</p>
            </div>
            <div className="space-y-3">
              {slots.map(slot => {
                const dishes = (dietPlan?.schedule as any)?.[day]?.[slot.id] || [];
                return (
                  <Card key={slot.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-4">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{slot.label}</p>
                      <div className="space-y-2">
                        {dishes.map((dish: Dish) => (
                          <p key={dish.id} className="text-xs font-bold text-gray-700 leading-tight">
                            {dish.name}
                          </p>
                        ))}
                        {dishes.length === 0 && <p className="text-[10px] text-gray-300 italic">Rest</p>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientProgress({ patient, mealLogs }: { patient: Patient | null, mealLogs: any[] }) { 
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health Progress</h1>
        <p className="text-gray-500 mt-1">Tracking your adherence and nutritional intake.</p>
      </div>
      <div className="p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
        <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Detailed progress analytics coming in the next update.</p>
      </div>
    </div>
  ); 
}

function PatientProfile({ patient }: { patient: Patient | null }) { 
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal details and health records.</p>
      </div>
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 gap-8">
            <ProfileField label="Full Name" value={patient?.name} />
            <ProfileField label="Age" value={`${patient?.age} Years`} />
            <ProfileField label="Gender" value={patient?.gender} />
            <ProfileField label="Prakriti" value={patient?.prakriti} />
            <ProfileField label="Vikriti" value={patient?.vikriti || 'None identified'} />
            <ProfileField label="Target Weight" value={`${patient?.targetWeight} kg`} />
          </div>
        </CardContent>
      </Card>
    </div>
  ); 
}

function ProfileField({ label, value }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value || 'Not set'}</p>
    </div>
  );
}
