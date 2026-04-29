import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  Save, 
  Eye, 
  X,
  Clock,
  Calendar as CalendarIcon,
  Zap,
  CloudSun
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, getDoc, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { Patient, Dish, DietPlan } from '@/types';
import { cn } from '@/lib/utils';
import DishDetailsModal from './DishDetailsModal';
import { calculateDishNutrition } from '@/lib/nutrition';

interface DietBuilderProps {
  initialPatientId?: string | null;
  onClearPatient?: () => void;
}

export default function DietBuilder({ initialPatientId, onClearPatient }: DietBuilderProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [searchDish, setSearchDish] = useState('');
  const [currentPlan, setCurrentPlan] = useState<Record<string, Record<string, Dish[]>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots = [
    { id: 'breakfast', label: 'Breakfast', time: '08:00 AM' },
    { id: 'mid-morning', label: 'Mid-Morning', time: '10:30 AM' },
    { id: 'lunch', label: 'Lunch', time: '01:00 PM' },
    { id: 'evening', label: 'Evening Snack', time: '04:30 PM' },
    { id: 'dinner', label: 'Dinner', time: '07:30 PM' },
  ];

  useEffect(() => {
    const pUnsubscribe = onSnapshot(collection(db, 'patients'), (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
    });
    const dUnsubscribe = onSnapshot(collection(db, 'dishes'), (snapshot) => {
      setDishes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dish)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dishes');
    });
    return () => { pUnsubscribe(); dUnsubscribe(); };
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      const q = query(collection(db, 'dietPlans'), where('patientId', '==', selectedPatient.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const plan = snapshot.docs[0].data() as DietPlan;
          setCurrentPlan(plan.schedule as any || {});
        } else {
          setCurrentPlan({});
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'dietPlans');
      });
      return () => unsubscribe();
    }
  }, [selectedPatient]);

  const addDishToSlot = (slotId: string, dish: Dish) => {
    setCurrentPlan(prev => {
      const dayPlan = prev[selectedDay] || {};
      const slotDishes = dayPlan[slotId] || [];
      
      // Don't add duplicate dishes to same slot
      if (slotDishes.find(d => d.id === dish.id)) return prev;

      return {
        ...prev,
        [selectedDay]: {
          ...dayPlan,
          [slotId]: [...slotDishes, dish]
        }
      };
    });
    setActiveSlot(null);
  };

  const removeDishFromSlot = (day: string, slotId: string, dishId: string) => {
    setCurrentPlan(prev => {
      const dayPlan = prev[day] || {};
      const slotDishes = dayPlan[slotId] || [];
      return {
        ...prev,
        [day]: {
          ...dayPlan,
          [slotId]: slotDishes.filter(d => d.id !== dishId)
        }
      };
    });
  };

  const handleSavePlan = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const q = query(collection(db, 'dietPlans'), where('patientId', '==', selectedPatient.id));
      const snapshot = await getDocs(q);
      
      const planData = {
        patientId: selectedPatient.id,
        weekOf: new Date().toISOString().split('T')[0],
        schedule: currentPlan,
        updatedAt: new Date().toISOString()
      };

      if (!snapshot.empty) {
        await updateDoc(doc(db, 'dietPlans', snapshot.docs[0].id), planData);
      } else {
        await addDoc(collection(db, 'dietPlans'), {
          ...planData,
          createdAt: new Date().toISOString()
        });
      }
      alert('Diet plan saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'dietPlans');
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Regimen Builder</h1>
          <p className="text-gray-500 mt-1">Select a patient to begin constructing their multi-dish weekly regimen.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Card 
              key={patient.id} 
              className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedPatient(patient)}
            >
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-400">
                    {patient.name.charAt(0)}
                  </div>
                  <Badge variant="secondary" className={cn(
                    "rounded-md text-[10px] font-black px-2 py-0.5",
                    patient.prakriti === 'Pitta' ? "bg-red-50 text-red-600" : 
                    patient.prakriti === 'Vata' ? "bg-blue-50 text-blue-600" : 
                    "bg-orange-50 text-orange-600"
                  )}>
                    {(patient.prakriti || '').toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-400 font-bold uppercase mt-1">{patient.age} YEARS • {patient.gender}</p>
                <div className="mt-8 pt-6 border-t border-gray-50">
                  <Button variant="ghost" className="w-full text-[#00966d] font-bold group-hover:bg-green-50 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="rounded-xl border-gray-200 text-gray-600 h-12 font-bold"
          >
            <Eye className="w-5 h-5 mr-2" />
            Preview Plan
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setSelectedPatient(null);
              onClearPatient?.();
            }}
            className="rounded-xl hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span className="text-[#00966d]">Switch Patient</span>
              <span>/</span>
              <span>Building for {selectedPatient.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Regimen Builder</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-600">Week of 4/9/2026</span>
          </div>
          <Button 
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="rounded-xl border-gray-200 text-gray-600 h-12 font-bold"
          >
            <Eye className="w-5 h-5 mr-2" />
            Preview Plan
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="rounded-xl border-gray-200 text-gray-600 h-12 font-bold"
          >
            <Eye className="w-5 h-5 mr-2" />
            Preview Plan
          </Button>
          <Button 
            onClick={handleSavePlan}
            disabled={isSaving}
            className="bg-[#00966d] hover:bg-[#007d5b] text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-green-100"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save to History'}
          </Button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 flex gap-2 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              selectedDay === day 
                ? "bg-[#00966d] text-white shadow-lg shadow-green-100" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schedule Builder */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-[#00966d]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{selectedDay}'s Schedule</h2>
          </div>
          
          <div className="space-y-4">
            {slots.map((slot) => {
              const slotDishes = currentPlan[selectedDay]?.[slot.id] || [];
              return (
                <Card 
                  key={slot.id} 
                  className={cn(
                    "border-2 shadow-none rounded-3xl overflow-hidden transition-all",
                    activeSlot === slot.id ? "border-[#00966d] bg-green-50/30" : "border-gray-50"
                  )}
                  onClick={() => setActiveSlot(slot.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{slot.time}</span>
                        <h3 className="text-lg font-bold text-gray-900">{slot.label}</h3>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-500 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                        {slotDishes.length} ITEMS
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {slotDishes.map((dish) => (
                        <div key={dish.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">
                              {dish.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{dish.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{calculateDishNutrition(dish).calories} kcal</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDishFromSlot(selectedDay, slot.id, dish.id);
                            }}
                            className="p-2 text-gray-300 hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {slotDishes.length === 0 && (
                        <div className="min-h-[60px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl text-xs font-medium text-gray-400">
                          {activeSlot === slot.id ? "Select a dish from library..." : "Click to add dishes..."}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Dish Library */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Dish Library</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search recipes..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-100 transition-all"
                value={searchDish}
                onChange={(e) => setSearchDish(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[700px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dishes.filter(d => d.name.toLowerCase().includes(searchDish.toLowerCase())).map((dish) => {
                const nutrition = calculateDishNutrition(dish);
                return (
                  <Card 
                    key={dish.id} 
                    className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      if (activeSlot) {
                        addDishToSlot(activeSlot, dish);
                      } else {
                        setSelectedDish(dish);
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#00966d] transition-all">{dish.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <Zap className="w-3 h-3" /> {Math.round(nutrition.calories)} kcal
                            </span>
                            <span className="text-gray-200">•</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <CloudSun className="w-3 h-3" /> {(dish.season || []).slice(0, 1).join('')}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#00966d] hover:bg-green-50 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                          {(dish.mealType || (dish as any).type || '').toUpperCase()}
                        </Badge>
                        {(dish.suitableDosha || (dish as any).suitability || []).map(s => (
                          <Badge key={s} variant="secondary" className={cn(
                            "rounded-lg px-2 py-0.5 text-[10px] font-bold",
                            s === 'Vata' ? "bg-blue-50 text-blue-600" : 
                            s === 'Pitta' ? "bg-red-50 text-red-600" : 
                            "bg-orange-50 text-orange-600"
                          )}>
                            {(s || '').toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {selectedDish && (
        <DishDetailsModal 
          dish={selectedDish} 
          isOpen={!!selectedDish} 
          onClose={() => setSelectedDish(null)} 
        />
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col">
          <DialogHeader className="p-8 bg-white border-b border-gray-50 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Weekly Regimen Preview</DialogTitle>
              <p className="text-sm text-gray-500">Full 7-day schedule for {selectedPatient.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)} className="rounded-xl">
              <X className="w-6 h-6" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-8 bg-gray-50">
            <div className="grid grid-cols-7 gap-4 min-w-[1200px]">
              {days.map(day => (
                <div key={day} className="space-y-4">
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                    <p className="font-bold text-gray-900">{day}</p>
                  </div>
                  <div className="space-y-3">
                    {slots.map(slot => {
                      const dishes = currentPlan[day]?.[slot.id] || [];
                      return (
                        <div key={slot.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{slot.label}</p>
                          <div className="space-y-2">
                            {dishes.map(dish => (
                              <p key={dish.id} className="text-xs font-bold text-gray-700 leading-tight">
                                {dish.name}
                              </p>
                            ))}
                            {dishes.length === 0 && <p className="text-[10px] text-gray-300 italic">Rest</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
