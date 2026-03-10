import express from "express";
import axios from "axios";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import FormData from "form-data";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Hugging Face Space (fallback) and Inference API configuration
const HF_SPACE_API = "https://huggingface.co/spaces/ankit5566/FoodNutrition-AI/api/predict";
const HF_MODEL = process.env.HF_MODEL || process.env.HF_MODEL_ID || undefined; // e.g. 'username/model-name'
const HF_TOKEN = process.env.HF_TOKEN; // set this in your backend env to use the Inference API

// If HF_TOKEN and HF_MODEL are present we will use the official Inference API
const HF_INFERENCE_BASE = HF_MODEL ? `https://api-inference.huggingface.co/models/${HF_MODEL}` : undefined;

// 🔹 New: Food Detector endpoint
app.post("/api/food-detect", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read file bytes for possible Inference API call
    const fileBuffer = fs.readFileSync(filePath);

    let responseData: any = null;

    if (HF_INFERENCE_BASE && HF_TOKEN) {
      // Use the official Hugging Face Inference API (recommended for production)
      try {
        const hfRes = await axios.post(HF_INFERENCE_BASE, fileBuffer, {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/octet-stream',
          },
          timeout: 120000,
        });
        responseData = hfRes.data;
      } catch (hfErr: any) {
        // Provide detailed error info from HF when available
        console.error('Hugging Face Inference API error:', hfErr?.response?.data ?? hfErr.message ?? hfErr);
        throw hfErr;
      }
    } else {
      // Fallback to the Space endpoint (as before)
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const hfRes = await axios.post(HF_SPACE_API, form, {
        headers: form.getHeaders(),
        timeout: 120000,
      });
      responseData = hfRes.data;
    }

    fs.unlinkSync(filePath); // cleanup temp file
    res.json(responseData);
  } catch (err: any) {
    console.error("Food detection error:", err.message);
    res.status(500).json({ error: "Food detection failed" });
  }
});

// Use Google Cloud Vision API to analyze the image and then lookup calories via Nutritionix
app.post('/api/google-detect', upload.single('file'), async (req, res) => {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Missing GOOGLE_API_KEY in server environment' });
  }

  const filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');

    // Call Google Vision API (images:annotate)
    const visionPayload = {
      requests: [
        {
          image: { content: base64 },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 5 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 5 }
          ]
        }
      ]
    };

    const visionRes = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      visionPayload,
      { headers: { 'Content-Type': 'application/json' }, timeout: 120000 }
    );

    const resp = visionRes.data?.responses?.[0] || {};
    const labels = (resp.labelAnnotations || []).map((l: any) => ({ description: l.description, score: l.score }));
    const objects = (resp.localizedObjectAnnotations || []).map((o: any) => ({ name: o.name, score: o.score, boundingPoly: o.boundingPoly }));

    // Choose top label to lookup calories
    const topLabel = labels[0]?.description;

    let nutritionResults: any[] = [];

    if (topLabel) {
      try {
        const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID || '9f65f6e3';
        const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY || '4e52540f69acf80494d40b515a47a651';
        const nutRes = await axios.post(
          'https://trackapi.nutritionix.com/v2/natural/nutrients',
          { query: topLabel },
          {
            headers: {
              'x-app-id': NUTRITIONIX_APP_ID,
              'x-app-key': NUTRITIONIX_API_KEY,
              'Content-Type': 'application/json'
            },
            timeout: 120000
          }
        );
        nutritionResults = nutRes.data?.foods || [];
      } catch (nutErr: any) {
        console.error('Nutritionix lookup failed:', nutErr?.response?.data ?? nutErr.message ?? nutErr);
        // proceed without failing the entire request
      }
    }

    // Cleanup
    fs.unlinkSync(filePath);

    return res.json({ labels, objects, topLabel, nutritionResults });
  } catch (err: any) {
    console.error('google-detect error:', err?.response?.data ?? err.message ?? err);
    try { fs.unlinkSync(filePath); } catch {};
    return res.status(500).json({ error: 'google detection failed', details: err?.response?.data ?? err?.message });
  }
});

// Temporary debug endpoint to verify uploads reach the server and inspect form-data
app.post('/api/debug-upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file received' });

    // Return basic metadata and first few bytes as base64 (safe small sample)
    const filePath = req.file.path;
    const stat = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    const sample = buffer.slice(0, Math.min(buffer.length, 256)).toString('base64');
    // Clean up temp file
    fs.unlinkSync(filePath);

    return res.json({
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: stat.size,
      sampleBase64Prefix: sample.slice(0, 64),
      receivedFields: req.body || {}
    });
  } catch (err: any) {
    console.error('debug-upload error:', err);
    return res.status(500).json({ error: 'debug upload failed', details: err?.message || err });
  }
});

// Simple healthcheck to verify the server is up
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: HF_INFERENCE_BASE && HF_TOKEN ? 'inference-api' : 'space-fallback' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT} (food-detect: POST /api/food-detect). HF mode: ${HF_INFERENCE_BASE && HF_TOKEN ? 'Inference API' : 'Space fallback'}`));
