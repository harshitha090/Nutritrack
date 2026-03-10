import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Scan, Camera, Search, Plus, Smartphone, Zap } from 'lucide-react';

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

interface BarcodeScannerProps {
  onAddFood: (food: Food) => void;
}

// Mock barcode database
const barcodeDatabase: { [key: string]: Food } = {
  '012345678901': {
    id: 'bc1',
    name: 'Organic Greek Yogurt',
    calories: 100,
    protein: 18,
    carbs: 6,
    fat: 0,
    fiber: 0,
    sugar: 6,
    serving: '170g container'
  },
  '012345678902': {
    id: 'bc2',
    name: 'Whole Grain Bread',
    calories: 80,
    protein: 4,
    carbs: 14,
    fat: 1,
    fiber: 3,
    sugar: 2,
    serving: '1 slice (28g)'
  },
  '012345678903': {
    id: 'bc3',
    name: 'Almond Butter',
    calories: 190,
    protein: 7,
    carbs: 7,
    fat: 17,
    fiber: 3,
    sugar: 2,
    serving: '2 tbsp (32g)'
  },
  '012345678904': {
    id: 'bc4',
    name: 'Protein Bar - Chocolate',
    calories: 200,
    protein: 20,
    carbs: 22,
    fat: 7,
    fiber: 3,
    sugar: 15,
    serving: '1 bar (60g)'
  },
  '012345678905': {
    id: 'bc5',
    name: 'Organic Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3,
    sugar: 14,
    serving: '1 medium (118g)'
  }
};

const sampleBarcodes = Object.keys(barcodeDatabase);

export function BarcodeScanner({ onAddFood }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedFood, setScannedFood] = useState<Food | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'not-found' | null>(null);

  const simulateScan = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
      const food = barcodeDatabase[randomBarcode];
      
      if (food) {
        setScannedFood(food);
        setScanResult('success');
      } else {
        setScanResult('not-found');
      }
      
      setIsScanning(false);
    }, 2000);
  };

  const handleManualLookup = () => {
    if (!manualBarcode) return;
    
    const food = barcodeDatabase[manualBarcode];
    if (food) {
      setScannedFood(food);
      setScanResult('success');
    } else {
      setScannedFood(null);
      setScanResult('not-found');
    }
  };

  const handleAddFood = () => {
    if (scannedFood) {
      onAddFood({ ...scannedFood, id: Date.now().toString() });
      setScannedFood(null);
      setScanResult(null);
      setManualBarcode('');
    }
  };

  const resetScanner = () => {
    setScannedFood(null);
    setScanResult(null);
    setManualBarcode('');
    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Barcode Scanner</h2>
        <p className="text-muted-foreground">Scan product barcodes to quickly add nutritional information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Interface */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-blue-500" />
                <span>Camera Scanner</span>
              </CardTitle>
              <CardDescription>
                Use your device camera to scan product barcodes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock camera interface */}
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {isScanning ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <Scan className="h-16 w-16 mx-auto text-blue-500" />
                    </div>
                    <p className="text-lg">Scanning...</p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-muted-foreground">Camera viewfinder area</p>
                    <p className="text-sm text-muted-foreground">
                      Position the barcode within the frame to scan
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={isScanning ? () => setIsScanning(false) : simulateScan} 
                className="w-full"
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Start Scanning
                  </>
                )}
              </Button>

              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  This is a demo scanner. In a real app, this would access your device's camera to scan actual barcodes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-green-500" />
                <span>Manual Barcode Entry</span>
              </CardTitle>
              <CardDescription>
                Enter barcode numbers manually if scanning doesn't work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode Number</Label>
                <Input
                  id="barcode"
                  placeholder="Enter 12-digit barcode (e.g., 012345678901)"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  maxLength={13}
                />
              </div>
              
              <Button onClick={handleManualLookup} className="w-full" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Look Up Barcode
              </Button>

              <div className="space-y-2">
                <p className="text-sm font-medium">Sample barcodes to try:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleBarcodes.slice(0, 3).map(barcode => (
                    <Badge 
                      key={barcode}
                      variant="secondary" 
                      className="cursor-pointer text-xs"
                      onClick={() => setManualBarcode(barcode)}
                    >
                      {barcode}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
            </CardHeader>
            <CardContent>
              {scanResult === 'success' && scannedFood ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      ✅ Product found in database!
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{scannedFood.name}</h3>
                      <p className="text-sm text-muted-foreground">Serving: {scannedFood.serving}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-center mb-3">
                        <div className="text-3xl font-bold text-blue-600">{scannedFood.calories}</div>
                        <div className="text-sm text-muted-foreground">calories per serving</div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{scannedFood.protein}g</div>
                          <div className="text-muted-foreground">Protein</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{scannedFood.carbs}g</div>
                          <div className="text-muted-foreground">Carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{scannedFood.fat}g</div>
                          <div className="text-muted-foreground">Fat</div>
                        </div>
                      </div>

                      {(scannedFood.fiber > 0 || scannedFood.sugar > 0) && (
                        <div className="grid grid-cols-2 gap-3 text-sm mt-3 pt-3 border-t border-blue-200">
                          {scannedFood.fiber > 0 && (
                            <div className="text-center">
                              <div className="font-semibold">{scannedFood.fiber}g</div>
                              <div className="text-muted-foreground">Fiber</div>
                            </div>
                          )}
                          {scannedFood.sugar > 0 && (
                            <div className="text-center">
                              <div className="font-semibold">{scannedFood.sugar}g</div>
                              <div className="text-muted-foreground">Sugar</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleAddFood} className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Daily Log
                      </Button>
                      <Button onClick={resetScanner} variant="outline">
                        Scan Another
                      </Button>
                    </div>
                  </div>
                </div>
              ) : scanResult === 'not-found' ? (
                <div className="space-y-4">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                      ❌ Product not found in our database
                    </AlertDescription>
                  </Alert>

                  <div className="text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-2" />
                    <p>We couldn't find nutritional information for this product.</p>
                    <p className="text-sm">Try searching manually or contact support to add this product.</p>
                  </div>

                  <Button onClick={resetScanner} variant="outline" className="w-full">
                    Try Another Barcode
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Scan className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-semibold mb-2">Ready to Scan</p>
                  <p>Scan a barcode or enter manually to get nutritional information</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Organic Greek Yogurt</span>
                  <Badge variant="outline">100 cal</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Protein Bar - Chocolate</span>
                  <Badge variant="outline">200 cal</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Almond Butter</span>
                  <Badge variant="outline">190 cal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scanning Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Ensure good lighting when scanning barcodes</p>
          <p>• Hold your device steady and at the right distance</p>
          <p>• Clean the camera lens for better scanning accuracy</p>
          <p>• If scanning fails, try entering the barcode manually</p>
          <p>• Report missing products to help expand our database</p>
        </CardContent>
      </Card>
    </div>
  );
}