import { useEffect, useState } from "react";
import { googleDetect } from "../api";

export function FoodDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  // Create an object URL for preview and revoke it when file changes/unmount
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await googleDetect(file);
      setResult(data);
    } catch (err: any) {
      console.error("detectFood error:", err);
      // Try to surface useful error info from axios / backend
      const serverData = err?.response?.data ?? err?.message ?? err;
      const msg = typeof serverData === "string" ? serverData : JSON.stringify(serverData);
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Food Detector</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-2"
        aria-label="Upload food image"
      />

      {file && (
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <strong>Preview</strong>
            <span className="text-xs text-muted-foreground">{file.name} • {formatBytes(file.size)}</span>
          </div>
          <div className="mt-2">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 200 }} />
            ) : (
              <div className="text-sm text-muted-foreground">Preview not available</div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`px-4 py-2 rounded ${loading || !file ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-green-600 text-white'}`}
        aria-disabled={!file || loading}
      >
        {loading ? 'Detecting...' : 'Detect Food'}
      </button>

      {error && (
        <div className="mt-4 p-4 border rounded bg-red-50 text-sm text-red-700">
          <h2 className="font-semibold">Error</h2>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="font-semibold">Detection Result</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(JSON.stringify(result, null, 2))}
                className="text-sm px-2 py-1 border rounded bg-white"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Labels */}
          {Array.isArray(result.labels) && result.labels.length > 0 && (
            <div>
              <div className="font-medium">Labels</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.labels.map((l: any, i: number) => (
                  <div key={i} className="px-2 py-1 bg-white rounded shadow text-sm">
                    {l.description} ({Math.round(l.score * 100)}%)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objects */}
          {Array.isArray(result.objects) && result.objects.length > 0 && (
            <div>
              <div className="font-medium">Objects</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.objects.map((o: any, i: number) => (
                  <div key={i} className="px-2 py-1 bg-white rounded shadow text-sm">
                    {o.name} ({Math.round(o.score * 100)}%)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutritionix results if available */}
          {Array.isArray(result.nutritionResults) && result.nutritionResults.length > 0 ? (
            <div>
              <div className="font-medium">Nutrition</div>
              <div className="mt-2 grid gap-2">
                {result.nutritionResults.map((food: any, idx: number) => (
                  <div key={idx} className="p-2 bg-white rounded shadow text-sm">
                    <div className="font-semibold">{food.food_name}</div>
                    <div className="text-xs text-muted-foreground">{food.serving_qty} {food.serving_unit} • {food.nf_calories} kcal</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No nutrition data found for top label.</div>
          )}

          {/* Raw fallback */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Raw response</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
