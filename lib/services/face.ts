// AWS Rekognition face liveness + Aadhaar-photo match.
// Stubbed in dev — returns a high-confidence match after a short delay.

export interface FaceService {
  livenessAndMatch(selfieDataUrl: string, referencePhotoUrl?: string): Promise<
    | { ok: true; livenessScore: number; matchScore: number }
    | { ok: false; reason: string }
  >;
}

class StubFaceService implements FaceService {
  async livenessAndMatch(selfieDataUrl: string) {
    await new Promise((r) => setTimeout(r, 1600));
    if (!selfieDataUrl.startsWith("data:image/")) {
      return { ok: false as const, reason: "invalid selfie payload" };
    }
    return { ok: true as const, livenessScore: 0.97, matchScore: 0.93 };
  }
}

class RekognitionFaceService implements FaceService {
  async livenessAndMatch(_selfieDataUrl: string, _referencePhotoUrl?: string) {
    // Real Rekognition CompareFaces + Liveness session goes here.
    return { ok: false as const, reason: "live face provider not configured" };
  }
}

export function getFaceService(): FaceService {
  const live = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  return live ? new RekognitionFaceService() : new StubFaceService();
}
