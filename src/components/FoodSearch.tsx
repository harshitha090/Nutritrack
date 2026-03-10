// ...existing code...
import React, { useState } from 'react';
// ...existing code...
import { searchFood, getCalories } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Plus, Filter, Star, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  category?: string;
  brand?: string;
}

interface FoodSearchProps {
  onAddFood: (food: Food) => void;
}


export function FoodSearch({ onAddFood }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [useNutritionix, setUseNutritionix] = useState<boolean>(true);
  const [nutritionixFoods, setNutritionixFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetCalories = async (foodName: string) => {
    try {
      const caloriesInfo = await getCalories(foodName);
      if (caloriesInfo.length > 0) {
        const info = caloriesInfo[0];
        alert(`Food: ${info.name}\nCalories: ${info.calories}\nServing: ${info.serving_qty} ${info.serving_unit}`);
      } else {
        alert('No calorie info found.');
      }
    } catch (err) {
      alert('Failed to fetch calories');
    }
  };

  // Only Nutritionix API results are used
  const foodsToDisplay: Food[] = nutritionixFoods.map((food: any, idx: number) => ({
    id: idx.toString(),
    name: food.food_name || food.name,
    calories: food.nf_calories || food.calories || 0,
    protein: food.nf_protein || 0,
    carbs: food.nf_total_carbohydrate || 0,
    fat: food.nf_total_fat || 0,
    fiber: food.nf_dietary_fiber || 0,
    sugar: food.nf_sugars || 0,
    serving: `${food.serving_qty || ''} ${food.serving_unit || ''}`.trim(),
    category: food.tags?.food_group,
    brand: food.brand_name,
  }));

  const handleNutritionixSearch = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchFood(searchQuery);
      setNutritionixFoods([...(result.common || []), ...(result.branded || [])]);
    } catch (err: any) {
      setError(err.message || 'API error');
    }
    setLoading(false);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'protein', label: 'Protein' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'fast-food', label: 'Fast Food' }
  ];

  const handleAddFood = (food: Food): void => {
    onAddFood({ ...food, id: Date.now().toString() });
  };

  const handleQuickSearch = (query: string): void => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useNutritionix}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUseNutritionix(e.target.checked);
              setNutritionixFoods([]);
              setError(null);
            }}
          />
          Use Nutritionix API
        </label>
        {useNutritionix && (
          <Button
            onClick={handleNutritionixSearch}
            disabled={!searchQuery || loading}
            size="sm"
          >
            {loading ? 'Searching...' : 'Search Nutritionix'}
          </Button>
        )}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2">Food Search</h2>
        <p className="text-muted-foreground">Search our nutritional database and add foods to your daily log</p>
      </div>
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search foods, brands, or ingredients..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="calories">Sort by Calories</SelectItem>
            <SelectItem value="protein">Sort by Protein</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Quick Actions */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Popular Foods</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* No popularFoods; Nutritionix API only */}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Recent Searches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* No recentSearches; Nutritionix API only */}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {searchQuery ? `Search Results (${foodsToDisplay.length})` : `All Foods (${foodsToDisplay.length})`}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodsToDisplay.map((food: Food) => (
            <Card key={food.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{food.name}</CardTitle>
                    {food.brand && (
                      <CardDescription className="text-xs">{food.brand}</CardDescription>
                    )}
                  </div>
                  {food.category && (
                    <Badge variant="outline" className="text-xs">
                      {food.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex flex-col items-center">
                <div className="text-center w-full">
                  <div className="text-3xl font-bold text-primary">{food.calories}</div>
                  <div className="text-sm text-muted-foreground">calories per {food.serving}</div>
                </div>
                {(food.fiber > 0 || food.sugar > 0) && (
                  <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2 w-full">
                    {food.fiber > 0 && (
                      <div className="text-center">
                        <div className="font-semibold">{food.fiber}g</div>
                        <div className="text-muted-foreground">Fiber</div>
                      </div>
                    )}
                    {food.sugar > 0 && (
                      <div className="text-center">
                        <div className="font-semibold">{food.sugar}g</div>
                        <div className="text-muted-foreground">Sugar</div>
                      </div>
                    )}
                  </div>
                )}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <Button
                    onClick={() => handleAddFood(food)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add to Log
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleGetCalories(food.name)}
                  >
                    Get Calories
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {foodsToDisplay.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No foods found</p>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse by category
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}