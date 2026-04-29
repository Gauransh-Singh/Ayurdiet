import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Patient } from '@/types';
import { Users, Activity, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsViewProps {
  patients: Patient[];
}

export default function AnalyticsView({ patients }: AnalyticsViewProps) {
  // Process Dosha Distribution
  const doshaData = [
    { name: 'Vata', value: patients.filter(p => p.prakriti === 'Vata').length, color: '#3b82f6' },
    { name: 'Pitta', value: patients.filter(p => p.prakriti === 'Pitta').length, color: '#ef4444' },
    { name: 'Kapha', value: patients.filter(p => p.prakriti === 'Kapha').length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Process Age Demographics
  const ageGroups = [
    { range: '18-25', count: patients.filter(p => p.age >= 18 && p.age <= 25).length },
    { range: '26-35', count: patients.filter(p => p.age >= 26 && p.age <= 35).length },
    { range: '36-45', count: patients.filter(p => p.age >= 36 && p.age <= 45).length },
    { range: '46-60', count: patients.filter(p => p.age >= 46 && p.age <= 60).length },
    { range: '60+', count: patients.filter(p => p.age > 60).length },
  ];

  // Process Vikriti vs Prakriti (Imbalance Analysis)
  const imbalanceData = [
    { name: 'Balanced', value: patients.filter(p => p.prakriti === p.vikriti).length },
    { name: 'Imbalanced', value: patients.filter(p => p.prakriti !== p.vikriti).length },
  ];

  // Mock Growth Data (since we don't have historical snapshots)
  const growthData = [
    { month: 'Jan', patients: Math.max(0, patients.length - 10) },
    { month: 'Feb', patients: Math.max(0, patients.length - 7) },
    { month: 'Mar', patients: Math.max(0, patients.length - 4) },
    { month: 'Apr', patients: patients.length },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Analytics</h1>
          <p className="text-gray-500 mt-1">Deep insights into your patient population and clinical outcomes.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-bold text-gray-600">Live Data</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Patients" value={patients.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard title="Imbalance Rate" value={`${patients.length > 0 ? Math.round((imbalanceData[1].value / patients.length) * 100) : 0}%`} icon={Activity} color="text-red-600" bg="bg-red-50" />
        <MetricCard title="Avg. Age" value={patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + p.age, 0) / patients.length) : 0} icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
        <MetricCard title="Active Goals" value={patients.filter(p => p.status === 'Active').length} icon={Target} color="text-green-600" bg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dosha Distribution */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Constitution (Prakriti) Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doshaData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {doshaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Age Demographics */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Age Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Growth Trend */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Patient Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00966d" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00966d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="patients" stroke="#00966d" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Imbalance Analysis */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Prakriti-Vikriti Alignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={imbalanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
