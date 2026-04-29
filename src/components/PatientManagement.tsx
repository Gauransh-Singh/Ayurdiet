import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  History,
  MoreVertical,
  X,
  Calendar,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Patient, UserProfile } from '@/types';
import RegisterPatientModal from './RegisterPatientModal';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface PatientManagementProps {
  user: UserProfile;
  onViewChange: (view: string, patientId?: string) => void;
}

export default function PatientManagement({ user, onViewChange }: PatientManagementProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrakriti, setFilterPrakriti] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'patients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      // Sort manually to avoid index requirement
      const sortedData = patientData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPatients(sortedData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
    });

    return () => unsubscribe();
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrakriti = filterPrakriti === 'All' || p.prakriti === filterPrakriti;
    return matchesSearch && matchesPrakriti;
  });

  const handleExport = () => {
    const headers = ['Name', 'Age', 'Gender', 'Prakriti', 'Vikriti', 'Weight', 'Target', 'Status', 'Created At'];
    const csvData = filteredPatients.map(p => [
      p.name, p.age, p.gender, p.prakriti, p.vikriti, p.currentWeight, p.targetWeight, p.status, (p.createdAt || '').split('T')[0]
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;
    try {
      await deleteDoc(doc(db, 'patients', patientToDelete));
      setIsDeleteConfirmOpen(false);
      setPatientToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `patients/${patientToDelete}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Directory</h1>
          <p className="text-gray-500 mt-1">Clinical records and historical diet tracking.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00966d] hover:bg-[#007d5b] text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-green-100"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Patient
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Select value={filterPrakriti} onValueChange={setFilterPrakriti}>
                <SelectTrigger className="w-[140px] rounded-xl border-gray-200 text-gray-600">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Prakriti</SelectItem>
                  <SelectItem value="Vata">Vata</SelectItem>
                  <SelectItem value="Pitta">Pitta</SelectItem>
                  <SelectItem value="Kapha">Kapha</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none rounded-xl border-gray-200 text-gray-600"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-none">
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Identity</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Constitution</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metric (W/T)</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Entry</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow 
                  key={patient.id} 
                  className="border-gray-50 hover:bg-gray-50/50 transition-all group cursor-pointer"
                  onClick={() => {
                    setSelectedPatient(patient);
                    setIsDetailsOpen(true);
                  }}
                >
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 rounded-xl">
                        <AvatarImage src={`https://picsum.photos/seed/${patient.id}/200`} />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-400 font-medium uppercase">{patient.age}Y • {patient.gender}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(
                      "rounded-md text-[10px] font-black px-2 py-0.5",
                      patient.prakriti === 'Pitta' ? "bg-red-50 text-red-600" : 
                      patient.prakriti === 'Vata' ? "bg-blue-50 text-blue-600" : 
                      "bg-orange-50 text-orange-600"
                    )}>
                      {(patient.prakriti || '').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", patient.status === 'Active' ? "bg-green-500" : "bg-gray-300")} />
                      <span className="text-sm font-bold text-gray-600">{patient.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{patient.currentWeight} / {patient.targetWeight} kg</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">BMI 24.5</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500 font-medium">{(patient.createdAt || '').split('T')[0]}</span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewChange('patient-dashboard', patient.id);
                        }}
                        title="View Patient Dashboard"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                          setIsScheduleModalOpen(true);
                        }}
                        title="Schedule Consult"
                      >
                        <Calendar className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-gray-400 hover:text-[#00966d] hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewChange('diet-builder', patient.id);
                        }}
                      >
                        <History className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPatientToDelete(patient.id);
                          setIsDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RegisterPatientModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
        }} 
        dietitianId={user.uid}
        patient={selectedPatient}
      />

      <ScheduleAppointmentModal 
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        dietitianId={user.uid}
      />

      {selectedPatient && (
        <PatientDetailsModal 
          patient={selectedPatient} 
          isOpen={isDetailsOpen} 
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedPatient(null);
          }} 
          onEdit={() => {
            setIsDetailsOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}

      <DeleteConfirmationModal 
        isOpen={isDeleteConfirmOpen} 
        onClose={() => setIsDeleteConfirmOpen(false)} 
        onConfirm={handleDelete} 
      />
    </div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none shadow-2xl">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Delete Patient Record?</h2>
            <p className="text-gray-500 text-sm">This action cannot be undone. All clinical history for this patient will be permanently removed.</p>
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl border-gray-200 font-bold h-12" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold h-12" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PatientDetailsModal({ patient, isOpen, onClose, onEdit }: { patient: Patient, isOpen: boolean, onClose: () => void, onEdit: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 bg-[#00966d] text-white relative">
          <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 rounded-2xl border-4 border-white/20">
              <AvatarImage src={`https://picsum.photos/seed/${patient.id}/200`} />
              <AvatarFallback className="text-2xl">{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              <p className="text-green-100 opacity-80">{patient.age} years • {patient.gender}</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prakriti</p>
              <p className="font-bold text-gray-900">{patient.prakriti}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vikriti</p>
              <p className="font-bold text-gray-900">{patient.vikriti}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Weight</p>
              <p className="font-bold text-gray-900">{patient.currentWeight} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Weight</p>
              <p className="font-bold text-gray-900">{patient.targetWeight} kg</p>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-50 flex gap-4">
            <Button 
              className="flex-1 bg-[#00966d] hover:bg-[#007d5b] text-white rounded-xl font-bold h-12"
              onClick={onEdit}
            >
              Edit Details
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl border-gray-200 font-bold h-12" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
