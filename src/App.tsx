import React, { useState, useEffect } from "react";
import { AuthPage } from "./components/AuthPage";
import { HomePage } from "./components/HomePage";
import { MealPlanner } from "./components/MealPlanner";
import { FoodSearch } from "./components/FoodSearch";
import { BarcodeScanner } from "./components/BarcodeScanner";
import { WeeklyPlan } from "./components/WeeklyPlan";
import { NutritionCounter } from "./components/NutritionCounter";
import { FoodDetector } from "./components/FoodDetector";

import {
  Home,
  Utensils,
  Search,
  Scan,
  Calendar,
  BarChart3,
  LogOut,
} from "lucide-react";

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Button } from "./components/ui/button";

// ✅ Types
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

// ✅ App Component
export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [dailyFoods, setDailyFoods] = useState<Food[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("bmi_app_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedFoods = localStorage.getItem("bmi_app_daily_foods");
    if (savedFoods) setDailyFoods(JSON.parse(savedFoods));

    const savedMealPlans = localStorage.getItem("bmi_app_meal_plans");
    if (savedMealPlans) setMealPlans(JSON.parse(savedMealPlans));
  }, []);

  // Handlers
  const handleLogin = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem("bmi_app_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("bmi_app_user");
    localStorage.removeItem("bmi_app_daily_foods");
    localStorage.removeItem("bmi_app_meal_plans");
    setDailyFoods([]);
    setMealPlans([]);
  };

  const addFoodToDaily = (food: Food) => {
    const updatedFoods = [...dailyFoods, { ...food, id: Date.now().toString() }];
    setDailyFoods(updatedFoods);
    localStorage.setItem("bmi_app_daily_foods", JSON.stringify(updatedFoods));
  };

  const removeFoodFromDaily = (foodId: string) => {
    const updatedFoods = dailyFoods.filter((food) => food.id !== foodId);
    setDailyFoods(updatedFoods);
    localStorage.setItem("bmi_app_daily_foods", JSON.stringify(updatedFoods));
  };

  const addMealPlan = (mealPlan: MealPlan) => {
    const updatedPlans = [...mealPlans, mealPlan];
    setMealPlans(updatedPlans);
    localStorage.setItem("bmi_app_meal_plans", JSON.stringify(updatedPlans));
  };

  // If not logged in → Auth Page
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* ✅ Top Navbar */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">
                  NutriTrack
                </span>
              </div>

              {/* Nav Links */}
              <div className="flex space-x-2">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-green-600"
                >
                  <Home className="h-4 w-4" /> <span>Home</span>
                </Link>
                <Link
                  to="/meal-planner"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-green-600"
                >
                  <Utensils className="h-4 w-4" /> <span>Meal Plans</span>
                </Link>
                <Link
                  to="/food-search"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-green-600"
                >
                  <Search className="h-4 w-4" /> <span>Food Search</span>
                </Link>
                <Link
                  to="/scanner"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-green-600"
                >
                  <Scan className="h-4 w-4" /> <span>Scanner</span>
                </Link>
                <Link
                  to="/weekly-plan"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-green-600"
                >
                  <Calendar className="h-4 w-4" /> <span>Weekly Plan</span>
                </Link>
                <Link
                  to="/nutrition"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-green-600"
                >
                  <BarChart3 className="h-4 w-4" /> <span>Nutrition</span>
                </Link>
                <Link
                  to="/food-detector"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 hover:text-green-600"
                >
                  <Utensils className="h-4 w-4" /> <span>Food Detector</span>
                </Link>
              </div>

              {/* User + Logout */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* ✅ Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route
              path="/"
              element={<HomePage user={user} setUser={setUser} />}
            />
            <Route
              path="/meal-planner"
              element={
                <MealPlanner
                  user={user}
                  mealPlans={mealPlans}
                  onAddMealPlan={addMealPlan}
                />
              }
            />
            <Route
              path="/food-search"
              element={<FoodSearch onAddFood={addFoodToDaily} />}
            />
            <Route
              path="/scanner"
              element={<BarcodeScanner onAddFood={addFoodToDaily} />}
            />
            <Route
              path="/weekly-plan"
              element={
                <WeeklyPlan
                  mealPlans={mealPlans}
                  onAddMealPlan={addMealPlan}
                  user={user}
                />
              }
            />
            <Route
              path="/nutrition"
              element={
                <NutritionCounter
                  dailyFoods={dailyFoods}
                  onRemoveFood={removeFoodFromDaily}
                  user={user}
                />
              }
            />
            <Route path="/food-detector" element={<FoodDetector />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
