// Nutritionix API integration
import axios from 'axios';

// Read from Vite environment variables when available. These should be provided
// as VITE_... keys in your .env for frontend builds. Fallbacks keep existing
// behavior for local development.
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000';
const NUTRITIONIX_APP_ID = (import.meta as any).env?.VITE_NUTRITIONIX_APP_ID || '9f65f6e3';
const NUTRITIONIX_API_KEY = (import.meta as any).env?.VITE_NUTRITIONIX_API_KEY || '4e52540f69acf80494d40b515a47a651';
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

export interface CalorieInfo {
  name: string;
  calories: number | null;
  serving_qty: number | null;
  serving_unit: string | null;
}

/**
 * Uploads an image file to the backend food detection endpoint and returns
 * whatever the backend returns (usually detection labels / predictions).
 */
export async function detectFood(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Post to backend route implemented in src/components/backend/server.ts
    const res = await axios.post(`${API_BASE}/api/food-detect`, formData, {
      // Let axios set the multipart boundary header automatically by NOT
      // specifying Content-Type. If you set it manually the boundary is lost.
      headers: {},
    });
    return res.data;
  } catch (err: any) {
    // Surface useful error information when available
    const serverMsg = err?.response?.data || err?.message || 'Unknown error';
    throw new Error(`Food detection failed: ${JSON.stringify(serverMsg)}`);
  }
}

/**
 * Use Google-based detection via the backend endpoint.
 * Backend will call Google Vision and Nutritionix, returning a combined JSON.
 */
export async function googleDetect(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await axios.post(`${API_BASE}/api/google-detect`, formData, {
      headers: {},
    });
    return res.data;
  } catch (err: any) {
    const serverMsg = err?.response?.data || err?.message || 'Unknown error';
    throw new Error(`Google detection failed: ${JSON.stringify(serverMsg)}`);
  }
}

export async function searchFood(query: string) {
  try {
    const response = await axios.get(`${BASE_URL}/search/instant`, {
      params: { query },
      headers: {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const detail = error?.response?.data?.message || error?.message || 'Failed to fetch food data';
    throw new Error(`Failed to fetch food data: ${detail}`);
  }
}

export async function getCalories(foodName: string): Promise<CalorieInfo[]> {
  try {
    const response = await axios.post(
      `${BASE_URL}/natural/nutrients`,
      { query: foodName },
      {
        headers: {
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const data = response.data;
    return (
      data.foods?.map((food: any) => ({
        name: food.food_name,
        calories: typeof food.nf_calories === 'number' ? food.nf_calories : null,
        serving_qty: typeof food.serving_qty === 'number' ? food.serving_qty : null,
        serving_unit: food.serving_unit ?? null,
      })) || []
    );
  } catch (error: any) {
    const detail = error?.response?.data || error?.message || 'Failed to fetch calorie data';
    throw new Error(`Failed to fetch calorie data: ${JSON.stringify(detail)}`);
  }
}
