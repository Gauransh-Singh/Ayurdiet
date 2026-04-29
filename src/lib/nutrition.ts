import { Dish, Ingredient } from '@/types';
import { INGREDIENTS } from './constants';

export function calculateDishNutrition(dish: Dish) {
  const resolvedIngredients = dish.ingredients.map(di => {
    const ingredient = INGREDIENTS.find(i => i.id === di.ingredientId);
    return {
      ...ingredient,
      factor: di.units || 1
    };
  }).filter(i => i.name);

  return resolvedIngredients.reduce((acc, ing) => {
    return {
      calories: acc.calories + (ing.calories || 0) * ing.factor,
      protein: acc.protein + (ing.protein || 0) * ing.factor,
      carbs: acc.carbs + (ing.carbs || 0) * ing.factor,
      fat: acc.fat + (ing.fat || 0) * ing.factor,
      fiber: acc.fiber + (ing.fiber || 0) * ing.factor,
      iron: acc.iron + (ing.iron || 0) * ing.factor,
      calcium: acc.calcium + (ing.calcium || 0) * ing.factor,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, calcium: 0 });
}
