import handler from '../api/process-image';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock Request/Response
const mockRes = {
    statusCode: 200,
    setHeader: (k, v) => console.log(`[Header] ${k}: ${v}`),
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log("--- RESPONSE JSON ---");
        console.log(JSON.stringify(data, null, 2));
        console.log("---------------------");
        return this;
    },
    end: () => console.log("Response ended")
} as unknown as VercelResponse;

const ToyotaCorollaImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000";

const mockReq = {
    method: 'POST',
    body: {
        imageUrl: ToyotaCorollaImage,
        prompt: "Verify this is a Toyota Corolla."
    }
} as unknown as VercelRequest;

console.log("🚀 Starting Visual Cortex Verification...");
handler(mockReq, mockRes).then(() => {
    console.log("✅ Verification Complete");
}).catch(err => {
    console.error("❌ Verification Failed:", err);
});
