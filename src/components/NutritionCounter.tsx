import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Trash2, Target, TrendingUp, Award, Calendar, Zap } from 'lucide-react';

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

interface NutritionCounterProps {
  dailyFoods: Food[];
  onRemoveFood: (foodId: string) => void;
  user: UserData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function NutritionCounter({ dailyFoods, onRemoveFood, user }: NutritionCounterProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const calculateDailyGoals = () => {
    // BMR calculation
    const bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9
    };

    const tdee = bmr * (activityMultipliers[user.activityLevel as keyof typeof activityMultipliers] || 1.55);
    
    let calories = Math.round(tdee);
    if (user.goal === 'lose') calories -= 500;
    if (user.goal === 'gain') calories += 500;

    const protein = Math.round(user.weight * 1.6); // 1.6g per kg body weight
    const fat = Math.round((calories * 0.25) / 9); // 25% of calories from fat
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4); // Remaining from carbs

    return { calories, protein, carbs, fat, fiber: 25, sugar: 50 };
  };

  const dailyTotals = useMemo(() => {
    return dailyFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fat: totals.fat + food.fat,
        fiber: totals.fiber + food.fiber,
        sugar: totals.sugar + food.sugar,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
    );
  }, [dailyFoods]);

  const goals = calculateDailyGoals();

  const macroData = [
    { name: 'Protein', value: dailyTotals.protein, goal: goals.protein, color: '#0088FE' },
    { name: 'Carbs', value: dailyTotals.carbs, goal: goals.carbs, color: '#00C49F' },
    { name: 'Fat', value: dailyTotals.fat, goal: goals.fat, color: '#FFBB28' },
  ];

  const pieData = [
    { name: 'Protein', value: dailyTotals.protein * 4, color: '#0088FE' },
    { name: 'Carbs', value: dailyTotals.carbs * 4, color: '#00C49F' },
    { name: 'Fat', value: dailyTotals.fat * 9, color: '#FFBB28' },
  ];

  // Mock weekly data for trends
  const weeklyData = [
    { day: 'Mon', calories: 1850, protein: 120, carbs: 180, fat: 65 },
    { day: 'Tue', calories: 1920, protein: 115, carbs: 195, fat: 70 },
    { day: 'Wed', calories: 1780, protein: 125, carbs: 170, fat: 62 },
    { day: 'Thu', calories: 2050, protein: 130, carbs: 210, fat: 75 },
    { day: 'Fri', calories: 1950, protein: 118, carbs: 185, fat: 68 },
    { day: 'Sat', calories: dailyTotals.calories, protein: dailyTotals.protein, carbs: dailyTotals.carbs, fat: dailyTotals.fat },
    { day: 'Sun', calories: 0, protein: 0, carbs: 0, fat: 0 },
  ];

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 70) return 'bg-red-500';
    if (percentage < 90) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Nutrition Counter</h2>
          <p className="text-muted-foreground">Track your daily nutrition and macronutrients</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="foods">Food Log</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-xl font-bold">{dailyTotals.calories}</p>
                    <p className="text-xs text-muted-foreground">of {goals.calories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-xl font-bold">{Math.round(dailyTotals.protein)}g</p>
                    <p className="text-xs text-muted-foreground">of {goals.protein}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-xl font-bold">{Math.round(dailyTotals.carbs)}g</p>
                    <p className="text-xs text-muted-foreground">of {goals.carbs}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="text-xl font-bold">{Math.round(dailyTotals.fat)}g</p>
                    <p className="text-xs text-muted-foreground">of {goals.fat}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bars */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Goals Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Calories</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyTotals.calories} / {goals.calories} 
                    <Badge variant="outline" className="ml-2">
                      {Math.round((dailyTotals.calories / goals.calories) * 100)}%
                    </Badge>
                  </span>
                </div>
                <Progress 
                  value={(dailyTotals.calories / goals.calories) * 100} 
                  className="h-3"
                />
              </div>

              {macroData.map((macro) => (
                <div key={macro.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{macro.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(macro.value)}g / {macro.goal}g
                      <Badge variant="outline" className="ml-2">
                        {Math.round((macro.value / macro.goal) * 100)}%
                      </Badge>
                    </span>
                  </div>
                  <Progress 
                    value={(macro.value / macro.goal) * 100} 
                    className="h-3"
                  />
                </div>
              ))}

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Fiber</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(dailyTotals.fiber)}g / {goals.fiber}g
                  </span>
                </div>
                <Progress 
                  value={(dailyTotals.fiber / goals.fiber) * 100} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macros" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Macro Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Calorie Distribution</CardTitle>
                <CardDescription>Breakdown of calories by macronutrient</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cal`, 'Calories']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Macro Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Macro Goals vs Actual</CardTitle>
                <CardDescription>Compare your intake to recommended goals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={macroData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE" name="Actual" />
                    <Bar dataKey="goal" fill="#00C49F" name="Goal" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Macro Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {macroData.map((macro) => (
                  <div key={macro.name} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold mb-2" style={{ color: macro.color }}>
                      {Math.round(macro.value)}g
                    </div>
                    <div className="text-lg font-semibold mb-1">{macro.name}</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Goal: {macro.goal}g
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        macro.value >= macro.goal * 0.9 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {macro.value >= macro.goal * 0.9 ? 'On Track' : 'Below Goal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="foods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Food Log</CardTitle>
              <CardDescription>
                {dailyFoods.length} items • {dailyTotals.calories} total calories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyFoods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">No foods logged today</p>
                  <p>Add foods using the Food Search or Barcode Scanner</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyFoods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{food.name}</h4>
                        <p className="text-sm text-muted-foreground">{food.serving}</p>
                        <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{food.calories} cal</span>
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fat}g</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFood(food.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Add Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {dailyTotals.protein < goals.protein * 0.7 && (
                <p className="text-amber-600">
                  • Consider adding more protein-rich foods like chicken, fish, or legumes
                </p>
              )}
              {dailyTotals.fiber < goals.fiber * 0.5 && (
                <p className="text-amber-600">
                  • Increase fiber intake with fruits, vegetables, and whole grains
                </p>
              )}
              {dailyTotals.calories < goals.calories * 0.8 && (
                <p className="text-amber-600">
                  • You may need more calories to meet your daily energy needs
                </p>
              )}
              {dailyTotals.calories > goals.calories * 1.2 && (
                <p className="text-amber-600">
                  • Consider portion control or lighter meal options
                </p>
              )}
              <p className="text-green-600">• Stay hydrated with 8+ glasses of water daily</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Nutrition Trends</CardTitle>
              <CardDescription>Track your progress over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calories" stroke="#8884d8" name="Calories" />
                  <Line type="monotone" dataKey="protein" stroke="#82ca9d" name="Protein (x10)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Week Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Average Daily Calories:</span>
                  <span className="font-semibold">1,890</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Protein:</span>
                  <span className="font-semibold">121g</span>
                </div>
                <div className="flex justify-between">
                  <span>Days On Track:</span>
                  <span className="font-semibold">5/7</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal Achievement:</span>
                  <Badge variant="secondary">Good</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="default">🎯</Badge>
                  <span className="text-sm">5-day tracking streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">💪</Badge>
                  <span className="text-sm">Hit protein goal 4 times</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">🥗</Badge>
                  <span className="text-sm">Balanced macro distribution</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}