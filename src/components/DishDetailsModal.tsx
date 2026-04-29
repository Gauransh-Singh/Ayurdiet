import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Apple, 
  Flame, 
  Droplets, 
  Wind, 
  Info, 
  CloudSun, 
  Activity,
  Zap,
  Scale,
  Leaf
} from 'lucide-react';
import { Dish, Ingredient } from '@/types';
import { cn } from '@/lib/utils';
import { INGREDIENTS } from '@/lib/constants';
import { calculateDishNutrition } from '@/lib/nutrition';

interface DishDetailsModalProps {
  dish: Dish;
  isOpen: boolean;
  onClose: () => void;
}

export default function DishDetailsModal({ dish, isOpen, onClose }: DishDetailsModalProps) {
  const resolvedIngredients = dish.ingredients.map(di => {
    const ingredient = INGREDIENTS.find(i => i.id === di.ingredientId);
    return {
      ...ingredient,
      amount: di.units ? `${di.units} ${ingredient?.unit || ''}` : ingredient?.unit || ''
    };
  }).filter(i => i.name) as (Ingredient & { amount: string })[];

  // Calculate total nutrition
  const nutrition = calculateDishNutrition(dish);

  const getDoshaEffect = (dosha: string) => {
    if (dish.suitableDosha.includes(dosha)) return 'Pacifying';
    if (dish.suitableDosha.includes('All')) return 'Pacifying';
    return 'Neutral';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 bg-white border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[#00966d] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                <Apple className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-2xl font-bold text-gray-900">{dish.name}</DialogTitle>
                  <Badge variant="outline" className="rounded-lg border-green-100 text-[#00966d] font-bold text-[10px] uppercase tracking-wider">
                    {dish.mealType}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {Math.round(nutrition.calories)} KCAL</span>
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {nutrition.protein.toFixed(1)}G PROTEIN</span>
                  <span className="flex items-center gap-1"><CloudSun className="w-3 h-3" /> {(dish.season || []).join(', ')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {(dish.suitableDosha || []).map(s => (
                <Badge key={s} variant="secondary" className={cn(
                  "rounded-lg px-3 py-1 text-xs font-black",
                  s === 'Vata' ? "bg-blue-50 text-blue-600" : 
                  s === 'Pitta' ? "bg-red-50 text-red-600" : 
                  s === 'Kapha' ? "bg-orange-50 text-orange-600" :
                  "bg-green-50 text-green-600"
                )}>
                  {(s || '').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Dosha Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <DoshaEffectCard dosha="Vata" effect={getDoshaEffect('Vata')} icon={Wind} color="text-blue-600" bg="bg-blue-50" />
            <DoshaEffectCard dosha="Pitta" effect={getDoshaEffect('Pitta')} icon={Flame} color="text-red-600" bg="bg-red-50" />
            <DoshaEffectCard dosha="Kapha" effect={getDoshaEffect('Kapha')} icon={Droplets} color="text-orange-600" bg="bg-orange-50" />
          </div>

          {/* Nutritional Breakdown */}
          <div className="grid grid-cols-5 gap-4">
            <NutrientCard label="Carbs" value={`${nutrition.carbs.toFixed(1)}g`} icon={Scale} color="text-purple-600" bg="bg-purple-50" />
            <NutrientCard label="Fat" value={`${nutrition.fat.toFixed(1)}g`} icon={Activity} color="text-yellow-600" bg="bg-yellow-50" />
            <NutrientCard label="Fiber" value={`${nutrition.fiber.toFixed(1)}g`} icon={Leaf} color="text-emerald-600" bg="bg-emerald-50" />
            <NutrientCard label="Iron" value={`${nutrition.iron.toFixed(1)}mg`} icon={Zap} color="text-indigo-600" bg="bg-indigo-50" />
            <NutrientCard label="Calcium" value={`${nutrition.calcium.toFixed(0)}mg`} icon={Droplets} color="text-cyan-600" bg="bg-cyan-50" />
          </div>

          {/* Ingredient Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Ingredients & Ayurvedic Properties
              </h3>
              <Badge variant="secondary" className="bg-gray-50 text-gray-400 rounded-lg px-2 py-1 text-[10px] font-bold">
                {resolvedIngredients.length} COMPONENTS
              </Badge>
            </div>
            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-none">
                    <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Ingredient</TableHead>
                    <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</TableHead>
                    <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Taste (Rasa)</TableHead>
                    <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Potency</TableHead>
                    <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-8">Digestibility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedIngredients.map((ing, idx) => (
                    <TableRow key={idx} className="border-gray-50 hover:bg-gray-50/30 transition-all">
                      <TableCell className="pl-8 py-5">
                        <div>
                          <p className="font-bold text-gray-900">{ing.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{ing.amount}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-gray-500">{ing.category}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(ing.rasa || []).map(r => (
                            <span key={r} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "rounded-md text-[10px] font-black px-2 py-0.5 border-none",
                          ing.virya === 'Cold' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                        )}>
                          {(ing.virya || '').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider",
                          ing.digestibility === 'Easy' ? "text-green-500" : 
                          ing.digestibility === 'Medium' ? "text-orange-500" : 
                          "text-red-500"
                        )}>
                          {ing.digestibility}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {resolvedIngredients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-gray-400 italic">
                        No detailed ingredient analysis available for this dish.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Clinical Insights */}
          <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-start gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <Info className="w-6 h-6 text-[#00966d]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Ayurvedic Clinical Insight</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                This {dish.name} is specifically formulated to balance {(dish.suitableDosha || []).join(' and ')} doshas. 
                With a primary focus on {resolvedIngredients[0]?.rasa?.[0] || 'balanced'} tastes, it supports 
                optimal Agni (digestive fire) and is particularly suitable for the {(dish.season || []).join(', ')} season(s).
                The combination of {resolvedIngredients.slice(0, 2).map(i => i.name).join(' and ')} ensures a 
                harmonious post-digestive effect (Vipaka).
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-white border-t border-gray-50 gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
          >
            Close Details
          </Button>
          <Button 
            className="flex-1 h-14 bg-[#00966d] hover:bg-[#007d5b] text-white rounded-2xl font-bold shadow-xl shadow-green-100 transition-all active:scale-95"
          >
            Add to Weekly Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DoshaEffectCard({ dosha, effect, icon: Icon, color, bg }: any) {
  return (
    <div className={cn("p-6 rounded-3xl border-2 border-transparent transition-all shadow-sm", bg)}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 bg-white rounded-2xl shadow-sm", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <Badge className={cn("rounded-lg text-[10px] font-black px-2.5 py-1 border-none", 
          effect === 'Pacifying' ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
        )}>
          {(effect || '').toUpperCase()}
        </Badge>
      </div>
      <h4 className="text-xl font-bold text-gray-900">{dosha}</h4>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Constitution Impact</p>
    </div>
  );
}

function NutrientCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className={cn("p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all", bg)}>
      <div className={cn("p-2 bg-white rounded-xl shadow-sm mb-2", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={cn("text-sm font-bold", color)}>{value}</p>
    </div>
  );
}
