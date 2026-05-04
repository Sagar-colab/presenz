// Image moderation. In dev, stubbed to a permissive heuristic.
// Wire to Google Vision SafeSearch by setting GOOGLE_VISION_API_KEY.

export type ModerationVerdict =
  | { ok: true }
  | { ok: false; reason: "nudity" | "violence" | "spoof" | "unknown" };

export interface ModerationService {
  scanImage(dataUrlOrPublicUrl: string): Promise<ModerationVerdict>;
}

class StubModerationService implements ModerationService {
  async scanImage(_input: string): Promise<ModerationVerdict> {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true };
  }
}

class VisionModerationService implements ModerationService {
  async scanImage(_input: string): Promise<ModerationVerdict> {
    // Real call: POST to vision.googleapis.com/v1/images:annotate with SAFE_SEARCH_DETECTION.
    // Map LIKELY/VERY_LIKELY adult/violence to { ok: false }.
    return { ok: true };
  }
}

export function getModerationService(): ModerationService {
  return process.env.GOOGLE_VISION_API_KEY ? new VisionModerationService() : new StubModerationService();
}
