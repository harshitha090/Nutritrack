import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Plus, RotateCcw, Target, TrendingUp } from 'lucide-react';

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

interface WeeklyPlanProps {
  mealPlans: MealPlan[];
  onAddMealPlan: (mealPlan: MealPlan) => void;
  user: UserData;
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

const weeklyTemplates = {
  balanced: {
    name: 'Balanced Nutrition',
    description: 'Well-rounded meals with proper macro distribution',
    meals: {
      breakfast: ['Oatmeal with Berries', 'Greek Yogurt'],
      lunch: ['Grilled Chicken Breast', 'Brown Rice', 'Steamed Broccoli'],
      dinner: ['Salmon Fillet', 'Sweet Potato', 'Steamed Broccoli'],
      snacks: ['Almonds']
    }
  },
  highProtein: {
    name: 'High Protein',
    description: 'Protein-focused meals for muscle building',
    meals: {
      breakfast: ['Greek Yogurt', 'Almonds'],
      lunch: ['Grilled Chicken Breast', 'Brown Rice'],
      dinner: ['Salmon Fillet', 'Sweet Potato'],
      snacks: ['Greek Yogurt']
    }
  },
  lowCarb: {
    name: 'Low Carb',
    description: 'Reduced carbohydrate meals for weight loss',
    meals: {
      breakfast: ['Greek Yogurt'],
      lunch: ['Grilled Chicken Breast', 'Steamed Broccoli'],
      dinner: ['Salmon Fillet', 'Steamed Broccoli'],
      snacks: ['Almonds']
    }
  }
};

export function WeeklyPlan({ mealPlans, onAddMealPlan, user }: WeeklyPlanProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof weeklyTemplates>('balanced');

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthDay = (date: Date) => {
    return date.getDate();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getMealPlanForDate = (date: Date) => {
    return mealPlans.find(plan => plan.date === formatDate(date));
  };

  const calculateDayCalories = (plan: MealPlan | undefined) => {
    if (!plan) return 0;
    return Object.values(plan.meals).flat().reduce((total, food) => total + food.calories, 0);
  };

  const calculateWeeklyStats = () => {
    const weekDays = getWeekDays(currentWeek);
    const weekPlans = weekDays.map(day => getMealPlanForDate(day)).filter(Boolean) as MealPlan[];
    
    const totalCalories = weekPlans.reduce((total, plan) => total + calculateDayCalories(plan), 0);
    const avgCalories = weekPlans.length > 0 ? Math.round(totalCalories / weekPlans.length) : 0;
    
    const totalProtein = weekPlans.reduce((total, plan) => 
      total + Object.values(plan.meals).flat().reduce((sum, food) => sum + food.protein, 0), 0
    );
    const avgProtein = weekPlans.length > 0 ? Math.round(totalProtein / weekPlans.length) : 0;

    return { avgCalories, avgProtein, plannedDays: weekPlans.length };
  };

  const generateWeeklyPlan = () => {
    const template = weeklyTemplates[selectedTemplate];
    const weekDays = getWeekDays(currentWeek);

    weekDays.forEach(day => {
      const dateStr = formatDate(day);
      
      // Skip if plan already exists
      if (getMealPlanForDate(day)) return;

      const mealPlan: MealPlan = {
        id: `${dateStr}-${Date.now()}`,
        userId: user.id,
        date: dateStr,
        meals: {
          breakfast: template.meals.breakfast.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean),
          lunch: template.meals.lunch.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean),
          dinner: template.meals.dinner.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean),
          snacks: template.meals.snacks.map(name => sampleFoods.find(f => f.name === name)!).filter(Boolean)
        }
      };
      
      onAddMealPlan(mealPlan);
    });
  };

  const weekDays = getWeekDays(currentWeek);
  const weeklyStats = calculateWeeklyStats();
  const weekRange = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Weekly Meal Plan</h2>
          <p className="text-muted-foreground">Plan and track your entire week's nutrition</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4">{weekRange}</span>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
                <p className="text-xl font-semibold">{weeklyStats.avgCalories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Protein</p>
                <p className="text-xl font-semibold">{weeklyStats.avgProtein}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Days Planned</p>
                <p className="text-xl font-semibold">{weeklyStats.plannedDays}/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Templates</CardTitle>
          <CardDescription>Choose a template to quickly generate meal plans for the entire week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {Object.entries(weeklyTemplates).map(([key, template]) => (
              <div 
                key={key}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === key ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(key as keyof typeof weeklyTemplates)}
              >
                <h4 className="font-semibold mb-1">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>
          
          <Button onClick={generateWeeklyPlan} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Generate {weeklyTemplates[selectedTemplate].name} Week Plan
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayPlan = getMealPlanForDate(day);
          const dayCalories = calculateDayCalories(dayPlan);
          const isToday = formatDate(day) === formatDate(new Date());
          
          return (
            <Card key={index} className={`${isToday ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-2">
                <div className="text-center">
                  <div className="text-lg font-semibold">{getDayName(day)}</div>
                  <div className="text-2xl font-bold text-muted-foreground">{getMonthDay(day)}</div>
                  {isToday && <Badge variant="default" className="text-xs mt-1">Today</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayPlan ? (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{dayCalories}</div>
                      <div className="text-xs text-muted-foreground">calories</div>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(dayPlan.meals).map(([mealType, foods]) => (
                        <div key={mealType}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold capitalize">{mealType}</span>
                            <Badge variant="outline" className="text-xs">
                              {foods.reduce((sum, food) => sum + food.calories, 0)}
                            </Badge>
                          </div>
                          {foods.length > 0 ? (
                            <div className="space-y-1">
                              {foods.slice(0, 2).map((food, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground truncate">
                                  {food.name}
                                </div>
                              ))}
                              {foods.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{foods.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">No items</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs">No plan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Week Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Week Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Nutritional Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Average Daily Calories:</span>
                  <span className="font-semibold">{weeklyStats.avgCalories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Daily Protein:</span>
                  <span className="font-semibold">{weeklyStats.avgProtein}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Days with Meal Plans:</span>
                  <span className="font-semibold">{weeklyStats.plannedDays}/7</span>
                </div>
                <div className="flex justify-between">
                  <span>Planning Completion:</span>
                  <span className="font-semibold">{Math.round((weeklyStats.plannedDays / 7) * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {weeklyStats.plannedDays < 7 && (
                  <p>• Complete meal planning for remaining days</p>
                )}
                {weeklyStats.avgCalories > 0 && weeklyStats.avgCalories < 1200 && (
                  <p>• Consider increasing daily calorie intake</p>
                )}
                {weeklyStats.avgProtein > 0 && weeklyStats.avgProtein < 50 && (
                  <p>• Add more protein-rich foods to your meals</p>
                )}
                <p>• Include variety in your food choices</p>
                <p>• Stay hydrated with adequate water intake</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}