import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserPlus, X, Save } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { Patient } from '@/types';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  dietitianId: string;
  patient?: Patient | null;
}

export default function RegisterPatientModal({ isOpen, onClose, dietitianId, patient }: RegisterPatientModalProps) {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    email: (patient as any)?.email || '',
    age: patient?.age.toString() || '30',
    gender: patient?.gender || 'Male',
    prakriti: patient?.prakriti || 'Vata',
    vikriti: patient?.vikriti || 'Vata',
    currentWeight: patient?.currentWeight.toString() || '70',
    targetWeight: patient?.targetWeight.toString() || '65'
  });

  React.useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        email: (patient as any).email || '',
        age: patient.age.toString(),
        gender: patient.gender,
        prakriti: patient.prakriti,
        vikriti: patient.vikriti,
        currentWeight: patient.currentWeight.toString(),
        targetWeight: patient.targetWeight.toString()
      });
    } else {
      setFormData({
        name: '',
        email: '',
        age: '30',
        gender: 'Male',
        prakriti: 'Vata',
        vikriti: 'Vata',
        currentWeight: '70',
        targetWeight: '65'
      });
    }
  }, [patient, isOpen]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!dietitianId) {
        throw new Error('User session not found. Please log in again.');
      }
      const patientData = {
        ...formData,
        email: formData.email.toLowerCase().trim(),
        age: parseInt(formData.age),
        currentWeight: parseFloat(formData.currentWeight),
        targetWeight: parseFloat(formData.targetWeight),
        status: patient?.status || 'Active',
        createdAt: patient?.createdAt || new Date().toISOString(),
        dietitianId: dietitianId
      };

      console.log('Submitting patient data:', patientData);
      if (patient) {
        await setDoc(doc(db, 'patients', patient.id), patientData);
        console.log('Patient updated successfully');
      } else {
        await addDoc(collection(db, 'patients'), patientData);
        console.log('Patient registered successfully');
      }
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register patient. Please try again.');
      // Still call handleFirestoreError for system logging
      try {
        handleFirestoreError(err, OperationType.CREATE, 'patients');
      } catch (e) {
        // Ignore the re-thrown error from handleFirestoreError
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 bg-white border-b border-gray-50 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00966d] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
              <UserPlus className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Register New Patient</DialogTitle>
          </div>
          <button 
            onClick={onClose}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Full Name</label>
              <Input 
                placeholder="Patient's name" 
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <Input 
                type="email"
                placeholder="patient@example.com" 
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Age</label>
              <Input 
                type="number" 
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Gender</label>
              <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Prakriti (Birth)</label>
              <Select value={formData.prakriti} onValueChange={(v) => setFormData({ ...formData, prakriti: v })}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vata">Vata</SelectItem>
                  <SelectItem value="Pitta">Pitta</SelectItem>
                  <SelectItem value="Kapha">Kapha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Vikriti (Current)</label>
              <Select value={formData.vikriti} onValueChange={(v) => setFormData({ ...formData, vikriti: v })}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vata">Vata</SelectItem>
                  <SelectItem value="Pitta">Pitta</SelectItem>
                  <SelectItem value="Kapha">Kapha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Current Weight (kg)</label>
              <Input 
                type="number" 
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Target Weight (kg)</label>
              <Input 
                type="number" 
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#00966d]"
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border-gray-200 font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 bg-[#00966d] hover:bg-[#007d5b] text-white rounded-xl font-bold shadow-lg shadow-green-100 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                'Registering...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Register Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
