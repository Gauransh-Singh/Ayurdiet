import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Stethoscope, 
  Sparkles, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { generateClinicalInsight } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function ClinicalAnalysisForm() {
  const [prakriti, setPrakriti] = useState('Vata');
  const [symptoms, setSymptoms] = useState('');
  const [agni, setAgni] = useState('Sama Agni (Balanced)');
  const [koshtha, setKoshtha] = useState('Mridu (Soft/Loose)');
  const [insight, setInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInsight = async () => {
    setIsGenerating(true);
    const result = await generateClinicalInsight(prakriti, symptoms, agni, koshtha);
    setInsight(result);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Ayurvedic Clinical Analysis</CardTitle>
          <p className="text-gray-500">Perform a deep constitutional assessment to identify Prakriti and Vikriti imbalances.</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700">Primary Prakriti Dominance</h3>
            <div className="grid grid-cols-3 gap-4">
              {['Vata', 'Pitta', 'Kapha'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPrakriti(type)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-left",
                    prakriti === type 
                      ? "border-[#00966d] bg-green-50/50 ring-4 ring-green-50" 
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <p className={cn("font-bold text-lg", prakriti === type ? "text-[#00966d]" : "text-gray-900")}>{type}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    {type === 'Vata' ? 'Space & Air' : type === 'Pitta' ? 'Fire & Water' : 'Earth & Water'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700">Patient Symptoms & Complaints</h3>
            <textarea 
              placeholder="Describe current symptoms like bloating, heat sensation, lethargy, etc."
              className="w-full h-32 p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-green-100 transition-all resize-none"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">Agni (Digestive Fire)</h3>
              <Select value={agni} onValueChange={setAgni}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sama Agni (Balanced)">Sama Agni (Balanced)</SelectItem>
                  <SelectItem value="Vishama Agni (Irregular)">Vishama Agni (Irregular)</SelectItem>
                  <SelectItem value="Tikshna Agni (Sharp)">Tikshna Agni (Sharp)</SelectItem>
                  <SelectItem value="Manda Agni (Slow)">Manda Agni (Slow)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">Koshtha (Bowel Type)</h3>
              <Select value={koshtha} onValueChange={setKoshtha}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mridu (Soft/Loose)">Mridu (Soft/Loose)</SelectItem>
                  <SelectItem value="Madhyama (Medium)">Madhyama (Medium)</SelectItem>
                  <SelectItem value="Krura (Hard/Constipated)">Krura (Hard/Constipated)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateInsight}
            disabled={isGenerating || !symptoms}
            className="w-full h-14 bg-[#00966d] hover:bg-[#007d5b] text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing Constitution...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Clinical Insight
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-xl shadow-green-100/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-green-50/50 p-8 border-b border-green-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Sparkles className="w-5 h-5 text-[#00966d]" />
                </div>
                <CardTitle className="text-xl font-bold text-[#00966d]">Clinical Insight</CardTitle>
              </div>
              <Badge className="bg-[#00966d] text-white rounded-lg px-3 py-1">AI Generated</Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-green max-w-none">
                <div className="text-gray-700 leading-relaxed text-lg font-medium bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <ReactMarkdown>{insight}</ReactMarkdown>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-medium">This is an AI-assisted analysis. Please verify with clinical findings.</span>
                </div>
                <Button variant="ghost" className="text-[#00966d] font-bold hover:bg-green-50 rounded-xl">
                  Save to Patient Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
