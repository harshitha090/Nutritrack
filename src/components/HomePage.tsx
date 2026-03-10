import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Calculator, Target, TrendingUp, Activity, Heart, Scale } from 'lucide-react';

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

interface HomePageProps {
  user: UserData;
  setUser: (user: UserData) => void;
}

export function HomePage({ user, setUser }: HomePageProps) {
  const [editingBMI, setEditingBMI] = useState(false);
  const [tempHeight, setTempHeight] = useState(user.height.toString());
  const [tempWeight, setTempWeight] = useState(user.weight.toString());

  const calculateBMI = () => {
    const heightInMeters = user.height / 100;
    return user.weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const calculateCalories = () => {
    // BMR calculation using Mifflin-St Jeor Equation
    const bmr = user.gender === 'male' 
      ? 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age)
      : 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9
    };

    const tdee = bmr * (activityMultipliers[user.activityLevel as keyof typeof activityMultipliers] || 1.55);
    
    // Adjust based on goal
    if (user.goal === 'lose') return Math.round(tdee - 500);
    if (user.goal === 'gain') return Math.round(tdee + 500);
    return Math.round(tdee);
  };

  const handleUpdateBMI = () => {
    const updatedUser = {
      ...user,
      height: parseInt(tempHeight),
      weight: parseInt(tempWeight)
    };
    setUser(updatedUser);
    localStorage.setItem('bmi_app_user', JSON.stringify(updatedUser));
    setEditingBMI(false);
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(bmi);
  const dailyCalories = calculateCalories();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BMI Calculator Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">BMI Calculator</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!editingBMI ? (
              <div className="space-y-4">
                <div className="text-2xl font-bold">{bmi.toFixed(1)}</div>
                <div className={`text-sm ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </div>
                <div className="text-xs text-muted-foreground">
                  Height: {user.height}cm | Weight: {user.weight}kg
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingBMI(true)}
                  className="w-full"
                >
                  Update BMI
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={tempHeight}
                    onChange={(e) => setTempHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleUpdateBMI}>Save</Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingBMI(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Calorie Goal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Daily Calorie Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyCalories}</div>
            <p className="text-xs text-muted-foreground">
              Based on your {user.goal} goal
            </p>
            <div className="mt-4">
              <Progress value={65} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                65% of daily goal reached
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Activity Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.activityLevel}</div>
            <p className="text-xs text-muted-foreground">
              Current activity setting
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Weekly Goal</span>
                <span>4/5 days</span>
              </div>
              <Progress value={80} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p className="text-lg font-semibold">82/100</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Weight Trend</p>
              <p className="text-lg font-semibold">-2.3kg</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Scale className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Target Weight</p>
              <p className="text-lg font-semibold">68kg</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Days to Goal</p>
              <p className="text-lg font-semibold">42 days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
          <CardDescription>
            Your nutrition and activity overview for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Calories</span>
                <span className="text-sm">1,420 / {dailyCalories}</span>
              </div>
              <Progress value={(1420 / dailyCalories) * 100} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Protein</span>
                <span className="text-sm">85g / 120g</span>
              </div>
              <Progress value={71} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Water</span>
                <span className="text-sm">6 / 8 glasses</span>
              </div>
              <Progress value={75} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BMI Information */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Your BMI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">BMI Categories:</h4>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>Underweight:</span>
                  <span className="text-blue-600">Below 18.5</span>
                </li>
                <li className="flex justify-between">
                  <span>Normal weight:</span>
                  <span className="text-green-600">18.5 - 24.9</span>
                </li>
                <li className="flex justify-between">
                  <span>Overweight:</span>
                  <span className="text-yellow-600">25.0 - 29.9</span>
                </li>
                <li className="flex justify-between">
                  <span>Obese:</span>
                  <span className="text-red-600">30.0 and above</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Your Current Status:</h4>
              <p className={`text-lg ${bmiInfo.color}`}>
                {bmiInfo.category} (BMI: {bmi.toFixed(1)})
              </p>
              <p className="mt-2 text-muted-foreground">
                {bmi < 18.5 && "Consider consulting a healthcare provider about healthy weight gain strategies."}
                {bmi >= 18.5 && bmi < 25 && "Great! You're in the healthy weight range. Keep up the good work!"}
                {bmi >= 25 && bmi < 30 && "Consider focusing on a balanced diet and regular exercise."}
                {bmi >= 30 && "Consider consulting a healthcare provider about weight management strategies."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}