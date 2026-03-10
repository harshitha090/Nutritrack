import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Sparkles, Clock, Utensils, ChefHat, Star } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
}

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  serving: string;
}

interface MealPlan {
  id: string;
  userId: string;
  date: string;
  meals: {
    breakfast: Food[];
    lunch: Food[];
    dinner: Food[];
    snacks: Food[];
  };
}

interface MealPlannerProps {
  user: UserData;
  mealPlans: MealPlan[];
  onAddMealPlan: (mealPlan: MealPlan) => void;
}

const sampleFoods: Food[] = [
  { id: '1', name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 45, fat: 4, fiber: 6, sugar: 12, serving: '1 bowl' },
  { id: '2', name: 'Greek Yogurt', calories: 130, protein: 20, carbs: 9, fat: 0, fiber: 0, sugar: 9, serving: '1 cup' },
  { id: '3', name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, serving: '100g' },
  { id: '4', name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 4, sugar: 1, serving: '1 cup cooked' },
  { id: '5', name: 'Steamed Broccoli', calories: 25, protein: 3, carbs: 5, fat: 0.3, fiber: 2.3, sugar: 1.5, serving: '1 cup' },
  { id: '6', name: 'Almonds', calories: 161, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1.2, serving: '23 nuts' },
  { id: '7', name: 'Salmon Fillet', calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0, serving: '100g' },
  { id: '8', name: 'Sweet Potato', calories: 103, protein: 2, carbs: 24, fat: 0.1, fiber: 3.8, sugar: 7, serving: '1 medium' },
];

const aiRecommendations = {
  lose: {
    breakfast: ['Greek Yogurt', 'Oatmeal with Berries'],
    lunch: ['Grilled Chicken Breast', 'Steamed Broccoli', 'Brown Rice'],
    dinner: ['Salmon Fillet', 'Sweet Potato', 'Steamed Broccoli'],
    snacks: ['Almonds']
  },
  maintain: {
    breakfast: ['Oatmeal with Berries', 'Greek Yogurt'],
    lunch: ['Grilled Chicken Breast', 'Brown Rice', 'Steamed Broccoli'],
    dinner: ['Salmon Fillet', 'Sweet Potato', 'Steamed Broccoli'],
    snacks: ['Almonds', 'Greek Yogurt']
  },
  gain: {
    breakfast: ['Oatmeal with Berries', 'Greek Yogurt', 'Almonds'],
    lunch: ['Grilled Chicken Breast', 'Brown Rice', 'Sweet Potato'],
    dinner: ['Salmon Fillet', 'Brown Rice', 'Sweet Potato'],
    snacks: ['Almonds', 'Greek Yogurt']
  }
};

export function MealPlanner({ user, mealPlans, onAddMealPlan }: MealPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [customMeal, setCustomMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    serving: '',
    mealType: 'breakfast'
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const generateAIMealPlan = () => {
    const recommendations = aiRecommendations[user.goal as keyof typeof aiRecommendations];
    
    const mealPlan: MealPlan = {
      id: Date.now().toString(),
      userId: user.id,
      date: selectedDate,
      meals: {
        breakfast: recommendations.breakfast.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean),
        lunch: recommendations.lunch.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean),
        dinner: recommendations.dinner.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean),
        snacks: recommendations.snacks.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean)
      }
    };
    
    onAddMealPlan(mealPlan);
  };

  const addCustomMeal = () => {
    if (!customMeal.name) return;
    
    const newFood: Food = {
      id: Date.now().toString(),
      name: customMeal.name,
      calories: parseInt(customMeal.calories) || 0,
      protein: parseInt(customMeal.protein) || 0,
      carbs: parseInt(customMeal.carbs) || 0,
      fat: parseInt(customMeal.fat) || 0,
      fiber: parseInt(customMeal.fiber) || 0,
      sugar: parseInt(customMeal.sugar) || 0,
      serving: customMeal.serving || '1 serving'
    };

    const existingPlan = mealPlans.find(plan => plan.date === selectedDate);
    if (existingPlan) {
      const updatedPlan = {
        ...existingPlan,
        meals: {
          ...existingPlan.meals,
          [customMeal.mealType]: [...existingPlan.meals[customMeal.mealType as keyof typeof existingPlan.meals], newFood]
        }
      };
      
      // Remove old plan and add updated one
      // In a real app, you'd update the existing plan
      onAddMealPlan(updatedPlan);
    } else {
      const newPlan: MealPlan = {
        id: Date.now().toString(),
        userId: user.id,
        date: selectedDate,
        meals: {
          breakfast: customMeal.mealType === 'breakfast' ? [newFood] : [],
          lunch: customMeal.mealType === 'lunch' ? [newFood] : [],
          dinner: customMeal.mealType === 'dinner' ? [newFood] : [],
          snacks: customMeal.mealType === 'snacks' ? [newFood] : []
        }
      };
      onAddMealPlan(newPlan);
    }

    setCustomMeal({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      serving: '',
      mealType: 'breakfast'
    });
    setShowCustomForm(false);
  };

  const getCurrentDayPlan = () => {
    return mealPlans.find(plan => plan.date === selectedDate);
  };

  const calculateMealCalories = (foods: Food[]) => {
    return foods.reduce((total, food) => total + food.calories, 0);
  };

  const currentPlan = getCurrentDayPlan();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Meal Planner</h2>
          <p className="text-muted-foreground">Plan your meals and track your nutrition</p>
        </div>
        <div className="flex items-center space-x-4">
          <Label htmlFor="date">Date:</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="ai-recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai-recommended">AI Recommended</TabsTrigger>
              <TabsTrigger value="custom">Custom Meals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai-recommended" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <span>AI-Powered Meal Plan</span>
                  </CardTitle>
                  <CardDescription>
                    Get personalized meal recommendations based on your {user.goal} goal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={generateAIMealPlan} className="w-full">
                    Generate AI Meal Plan for {selectedDate}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Optimized for your activity level: {user.activityLevel}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(aiRecommendations[user.goal as keyof typeof aiRecommendations]).map(([mealType, foods]) => (
                        <div key={mealType} className="space-y-2">
                          <h4 className="font-semibold capitalize">{mealType}</h4>
                          <div className="space-y-1">
                            {foods.map((foodName, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-2 mb-1">
                                {foodName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-orange-500" />
                    <span>Add Custom Meal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showCustomForm ? (
                    <Button onClick={() => setShowCustomForm(true)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Meal
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="meal-name">Meal Name</Label>
                          <Input
                            id="meal-name"
                            value={customMeal.name}
                            onChange={(e) => setCustomMeal(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Chicken Salad"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meal-type">Meal Type</Label>
                          <Select 
                            value={customMeal.mealType} 
                            onValueChange={(value) => setCustomMeal(prev => ({ ...prev, mealType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breakfast">Breakfast</SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                              <SelectItem value="snacks">Snacks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={customMeal.calories}
                            onChange={(e) => setCustomMeal(prev => ({ ...prev, calories: e.target.value }))}
                            placeholder="250"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serving">Serving Size</Label>
                          <Input
                            id="serving"
                            value={customMeal.serving}
                            onChange={(e) => setCustomMeal(prev => ({ ...prev, serving: e.target.value }))}
                            placeholder="1 cup"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            value={customMeal.protein}
                            onChange={(e) => setCustomMeal(prev => ({ ...prev, protein: e.target.value }))}
                            placeholder="20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            value={customMeal.carbs}
                            onChange={(e) => setCustomMeal(prev => ({ ...prev, carbs: e.target.value }))}
                            placeholder="30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            value={customMeal.fat}
                            onChange={(e) => setCustomMeal(prev => ({ ...prev, fat: e.target.value }))}
                            placeholder="5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fiber">Fiber (g)</Label>
                          <Input
                            id="fiber"
                            type="number"
                            value={customMeal.fiber}
                            onChange={(e) => setCustomMeal(prev => ({ ...prev, fiber: e.target.value }))}
                            placeholder="3"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={addCustomMeal}>Add Meal</Button>
                        <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Plan ({selectedDate})</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlan ? (
                <div className="space-y-4">
                  {Object.entries(currentPlan.meals).map(([mealType, foods]) => (
                    <div key={mealType}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">{mealType}</h4>
                        <Badge variant="outline">
                          {calculateMealCalories(foods)} cal
                        </Badge>
                      </div>
                      {foods.length > 0 ? (
                        <div className="space-y-1">
                          {foods.map((food, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{food.name}</span>
                              <span className="text-muted-foreground">{food.calories}cal</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No meals planned</p>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total Calories:</span>
                      <span>
                        {Object.values(currentPlan.meals).flat().reduce((total, food) => total + food.calories, 0)} cal
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Utensils className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No meal plan for this date</p>
                  <p className="text-sm">Generate an AI plan or add custom meals</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Quick Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Plan meals in advance for better nutrition tracking</p>
              <p>• Include protein in every meal for satiety</p>
              <p>• Add variety with different colored vegetables</p>
              <p>• Stay hydrated with 8 glasses of water daily</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}