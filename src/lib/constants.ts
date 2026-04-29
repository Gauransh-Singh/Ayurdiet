import { User, UserRole, Ingredient, Dish } from '../types';

export const MOCK_PATIENT_USER: User = {
  id: 'p1',
  username: 'rajesh.kumar',
  name: 'Rajesh Kumar',
  role: UserRole.PATIENT,
  avatar: 'https://picsum.photos/seed/pat/100/100'
};

export const INGREDIENTS: Ingredient[] = [
  {
    id: "ING001",
    name: "Basmati Rice",
    category: "Grains",
    unit: "1 cup cooked",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.6,
    iron: 0.8,
    calcium: 10,
    rasa: ["Sweet"],
    virya: "Cold",
    vipaka: "Sweet",
    digestibility: "Easy",
    doshaEffect: { vata: "Pacifying", pitta: "Pacifying", kapha: "Aggravating" }
  },
  {
    id: "ING002",
    name: "Moong Dal",
    category: "Legumes",
    unit: "1/2 cup cooked",
    calories: 104,
    protein: 7,
    carbs: 19,
    fat: 0.4,
    fiber: 7.6,
    iron: 1.4,
    calcium: 13,
    rasa: ["Sweet", "Astringent"],
    virya: "Cold",
    vipaka: "Sweet",
    digestibility: "Easy",
    doshaEffect: { vata: "Neutral", pitta: "Pacifying", kapha: "Neutral" }
  },
  {
    id: "ING003",
    name: "Masoor Dal",
    category: "Legumes",
    unit: "1/2 cup cooked",
    calories: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    fiber: 8,
    iron: 3.3,
    calcium: 19,
    rasa: ["Sweet", "Astringent"],
    virya: "Hot",
    vipaka: "Pungent",
    digestibility: "Medium",
    doshaEffect: { vata: "Aggravating", pitta: "Aggravating", kapha: "Pacifying" }
  },
  {
    id: "ING004",
    name: "Ghee",
    category: "Fats",
    unit: "1 tbsp",
    calories: 112,
    protein: 0,
    carbs: 0,
    fat: 12.8,
    fiber: 0,
    iron: 0,
    calcium: 0,
    rasa: ["Sweet"],
    virya: "Hot",
    vipaka: "Sweet",
    digestibility: "Easy",
    doshaEffect: { vata: "Pacifying", pitta: "Pacifying", kapha: "Aggravating" }
  },
  {
    id: "ING005",
    name: "Cow Milk",
    category: "Dairy",
    unit: "1 cup warm",
    calories: 60,
    protein: 3.2,
    carbs: 5,
    fat: 3.3,
    fiber: 0,
    iron: 0,
    calcium: 113,
    rasa: ["Sweet"],
    virya: "Cold",
    vipaka: "Sweet",
    digestibility: "Heavy",
    doshaEffect: { vata: "Pacifying", pitta: "Pacifying", kapha: "Aggravating" }
  },
  {
    id: "ING006",
    name: "Curd",
    category: "Dairy",
    unit: "1/2 cup",
    calories: 98,
    protein: 5,
    carbs: 7,
    fat: 4,
    fiber: 0,
    iron: 0.1,
    calcium: 120,
    rasa: ["Sour"],
    virya: "Hot",
    vipaka: "Sour",
    digestibility: "Heavy",
    doshaEffect: { vata: "Pacifying", pitta: "Aggravating", kapha: "Aggravating" }
  },
  {
    id: "ING007",
    name: "Spinach",
    category: "Vegetables",
    unit: "1 cup cooked",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    iron: 2.7,
    calcium: 99,
    rasa: ["Bitter", "Astringent"],
    virya: "Cold",
    vipaka: "Pungent",
    digestibility: "Easy",
    doshaEffect: { vata: "Neutral", pitta: "Pacifying", kapha: "Neutral" }
  },
  {
    id: "ING008",
    name: "Carrot",
    category: "Vegetables",
    unit: "1 medium",
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    iron: 0.3,
    calcium: 33,
    rasa: ["Sweet"],
    virya: "Cold",
    vipaka: "Sweet",
    digestibility: "Easy",
    doshaEffect: { vata: "Pacifying", pitta: "Pacifying", kapha: "Neutral" }
  },
  {
    id: "ING009",
    name: "Bottle Gourd",
    category: "Vegetables",
    unit: "1 cup cooked",
    calories: 14,
    protein: 0.6,
    carbs: 3.4,
    fat: 0.1,
    fiber: 0.5,
    iron: 0.2,
    calcium: 26,
    rasa: ["Sweet"],
    virya: "Cold",
    vipaka: "Sweet",
    digestibility: "Easy",
    doshaEffect: { vata: "Neutral", pitta: "Pacifying", kapha: "Pacifying" }
  },
  {
    id: "ING010",
    name: "Bitter Gourd",
    category: "Vegetables",
    unit: "1 cup cooked",
    calories: 34,
    protein: 2.6,
    carbs: 8.4,
    fat: 0.2,
    fiber: 2.8,
    iron: 1,
    calcium: 19,
    rasa: ["Bitter"],
    virya: "Cold",
    vipaka: "Pungent",
    digestibility: "Medium",
    doshaEffect: { vata: "Aggravating", pitta: "Pacifying", kapha: "Pacifying" }
  },
  {
    id: "ING011",
    name: "Apple",
    category: "Fruits",
    unit: "1 medium",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    iron: 0.1,
    calcium: 6,
    rasa: ["Sweet", "Astringent"],
    virya: "Cold",
    vipaka: "Sweet",
    digestibility: "Easy",
    doshaEffect: { vata: "Pacifying", pitta: "Pacifying", kapha: "Neutral" }
  },
  {
    id: "ING012",
    name: "Banana",
    category: "Fruits",
    unit: "1 medium",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    iron: 0.3,
    calcium: 5,
    rasa: ["Sweet"],
    virya: "Cold",
    vipaka: "Sweet",
    digestibility: "Heavy",
    doshaEffect: { vata: "Pacifying", pitta: "Pacifying", kapha: "Aggravating" }
  },
  {
    id: "ING013",
    name: "Papaya",
    category: "Fruits",
    unit: "1 cup",
    calories: 43,
    protein: 0.5,
    carbs: 11,
    fat: 0.3,
    fiber: 1.7,
    iron: 0.3,
    calcium: 20,
    rasa: ["Sweet"],
    virya: "Hot",
    vipaka: "Sweet",
    digestibility: "Easy",
    doshaEffect: { vata: "Neutral", pitta: "Pacifying", kapha: "Pacifying" }
  },
  {
    id: "ING014",
    name: "Almonds",
    category: "Nuts",
    unit: "10 soaked",
    calories: 161,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
    iron: 1,
    calcium: 76,
    rasa: ["Sweet"],
    virya: "Hot",
    vipaka: "Sweet",
    digestibility: "Heavy",
    doshaEffect: { vata: "Pacifying", pitta: "Aggravating", kapha: "Aggravating" }
  },
  {
    id: "ING015",
    name: "Turmeric",
    category: "Spices",
    unit: "1/2 tsp",
    calories: 8,
    protein: 0.3,
    carbs: 1.4,
    fat: 0.2,
    fiber: 0.5,
    iron: 1.7,
    calcium: 4,
    rasa: ["Bitter", "Pungent"],
    virya: "Hot",
    vipaka: "Pungent",
    digestibility: "Easy",
    doshaEffect: { vata: "Pacifying", pitta: "Neutral", kapha: "Pacifying" }
  }
];

export const DISHES: Dish[] = [
  {
    id: "D01",
    name: "Moong Dal Khichdi",
    mealType: "Lunch",
    suitableDosha: ["Vata", "Pitta", "Kapha"],
    season: ["All"],
    ingredients: [
      { ingredientId: "ING001", units: 0.5 },
      { ingredientId: "ING002", units: 0.25 },
      { ingredientId: "ING004", units: 0.1 },
      { ingredientId: "ING015", units: 0.05 }
    ]
  },
  {
    id: "D02",
    name: "Plain Steamed Rice",
    mealType: "Lunch",
    suitableDosha: ["Vata", "Pitta"],
    season: ["Grishma", "Varsha"],
    ingredients: [{ ingredientId: "ING001", units: 1 }]
  },
  {
    id: "D03",
    name: "Moong Dal Soup",
    mealType: "Dinner",
    suitableDosha: ["Pitta", "Kapha"],
    season: ["Sharad", "Hemant"],
    ingredients: [
      { ingredientId: "ING002", units: 0.5 }
    ]
  },
  {
    id: "D04",
    name: "Masoor Dal",
    mealType: "Lunch",
    suitableDosha: ["Kapha"],
    season: ["Hemant"],
    ingredients: [
      { ingredientId: "ING003", units: 0.5 }
    ]
  },
  {
    id: "D05",
    name: "Warm Milk with Turmeric",
    mealType: "Dinner",
    suitableDosha: ["Vata", "Kapha"],
    season: ["Shishira"],
    ingredients: [
      { ingredientId: "ING005", units: 1 },
      { ingredientId: "ING015", units: 0.05 }
    ]
  },
  {
    id: "D06",
    name: "Curd Rice",
    mealType: "Lunch",
    suitableDosha: ["Vata"],
    season: ["Grishma"],
    ingredients: [
      { ingredientId: "ING001", units: 0.75 },
      { ingredientId: "ING006", units: 0.5 }
    ]
  },
  {
    id: "D07",
    name: "Spinach Stir Fry",
    mealType: "Lunch",
    suitableDosha: ["Pitta", "Kapha"],
    season: ["Varsha"],
    ingredients: [{ ingredientId: "ING007", units: 1 }]
  },
  {
    id: "D08",
    name: "Bottle Gourd Curry",
    mealType: "Lunch",
    suitableDosha: ["Pitta", "Kapha"],
    season: ["Grishma"],
    ingredients: [{ ingredientId: "ING009", units: 1 }]
  },
  {
    id: "D09",
    name: "Bitter Gourd Stir Fry",
    mealType: "Lunch",
    suitableDosha: ["Kapha", "Pitta"],
    season: ["Sharad"],
    ingredients: [{ ingredientId: "ING010", units: 1 }]
  },
  {
    id: "D10",
    name: "Carrot Soup",
    mealType: "Dinner",
    suitableDosha: ["Vata", "Pitta"],
    season: ["Hemant"],
    ingredients: [{ ingredientId: "ING008", units: 1 }]
  },
  {
    id: "D11",
    name: "Apple Breakfast Bowl",
    mealType: "Breakfast",
    suitableDosha: ["Vata", "Pitta"],
    season: ["Sharad"],
    ingredients: [{ ingredientId: "ING011", units: 1 }]
  },
  {
    id: "D12",
    name: "Banana with Ghee",
    mealType: "Breakfast",
    suitableDosha: ["Vata"],
    season: ["All"],
    ingredients: [
      { ingredientId: "ING012", units: 1 },
      { ingredientId: "ING004", units: 0.05 }
    ]
  },
  {
    id: "D13",
    name: "Papaya Bowl",
    mealType: "Breakfast",
    suitableDosha: ["Pitta", "Kapha"],
    season: ["Grishma"],
    ingredients: [{ ingredientId: "ING013", units: 1 }]
  },
  {
    id: "D14",
    name: "Almond Milk",
    mealType: "Breakfast",
    suitableDosha: ["Vata"],
    season: ["Shishira"],
    ingredients: [
      { ingredientId: "ING014", units: 0.2 },
      { ingredientId: "ING005", units: 1 }
    ]
  },
  {
    id: "D15",
    name: "Rice with Ghee",
    mealType: "Lunch",
    suitableDosha: ["Vata"],
    season: ["All"],
    ingredients: [
      { ingredientId: "ING001", units: 1 },
      { ingredientId: "ING004", units: 0.1 }
    ]
  },
  {
    id: "D16",
    name: "Vegetable Rice",
    mealType: "Lunch",
    suitableDosha: ["Pitta", "Kapha"],
    season: ["Varsha"],
    ingredients: [
      { ingredientId: "ING001", units: 0.75 },
      { ingredientId: "ING007", units: 0.5 },
      { ingredientId: "ING008", units: 0.5 }
    ]
  },
  {
    id: "D17",
    name: "Light Dal Dinner",
    mealType: "Dinner",
    suitableDosha: ["Pitta"],
    season: ["Sharad"],
    ingredients: [{ ingredientId: "ING002", units: 0.4 }]
  },
  {
    id: "D18",
    name: "Ginger Milk",
    mealType: "Dinner",
    suitableDosha: ["Kapha"],
    season: ["Hemant"],
    ingredients: [
      { ingredientId: "ING005", units: 1 }
    ]
  },
  {
    id: "D19",
    name: "Rice Gruel",
    mealType: "Dinner",
    suitableDosha: ["Vata", "Pitta"],
    season: ["All"],
    ingredients: [{ ingredientId: "ING001", units: 0.5 }]
  },
  {
    id: "D21",
    name: "Simple Vegetable Soup",
    mealType: "Dinner",
    suitableDosha: ["All"],
    season: ["Hemant"],
    ingredients: [
      { ingredientId: "ING007", units: 0.5 },
      { ingredientId: "ING009", units: 0.5 }
    ]
  },
  {
    id: "D23",
    name: "Dal Rice Combo",
    mealType: "Lunch",
    suitableDosha: ["All"],
    season: ["All"],
    ingredients: [
      { ingredientId: "ING001", units: 0.5 },
      { ingredientId: "ING002", units: 0.3 }
    ]
  },
  {
    id: "D24",
    name: "Fruit Plate",
    mealType: "Breakfast",
    suitableDosha: ["Pitta"],
    season: ["Sharad"],
    ingredients: [
      { ingredientId: "ING011", units: 0.5 },
      { ingredientId: "ING013", units: 0.5 }
    ]
  },
  {
    id: "D25",
    name: "Rice with Vegetables",
    mealType: "Lunch",
    suitableDosha: ["Kapha"],
    season: ["Varsha"],
    ingredients: [
      { ingredientId: "ING001", units: 0.5 },
      { ingredientId: "ING010", units: 0.5 }
    ]
  },
  {
    id: "D26",
    name: "Spinach Dal",
    mealType: "Lunch",
    suitableDosha: ["Pitta"],
    season: ["Sharad"],
    ingredients: [
      { ingredientId: "ING002", units: 0.4 },
      { ingredientId: "ING007", units: 0.5 }
    ]
  },
  {
    id: "D28",
    name: "Simple Rice Dinner",
    mealType: "Dinner",
    suitableDosha: ["Vata", "Pitta"],
    season: ["All"],
    ingredients: [{ ingredientId: "ING001", units: 0.75 }]
  },
  {
    id: "D29",
    name: "Vegetable Mash",
    mealType: "Dinner",
    suitableDosha: ["Kapha"],
    season: ["Hemant"],
    ingredients: [
      { ingredientId: "ING008", units: 0.5 },
      { ingredientId: "ING009", units: 0.5 }
    ]
  },
  {
    id: "D30",
    name: "Almond Snack",
    mealType: "Breakfast",
    suitableDosha: ["Vata"],
    season: ["All"],
    ingredients: [{ ingredientId: "ING014", units: 0.2 }]
  }
];
