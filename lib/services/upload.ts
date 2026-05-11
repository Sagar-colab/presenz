import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Upload service. Cloudinary SDK in prod, local /public/uploads in dev.
// Cloudinary uploads are rooted under the "presenz/" folder.

const CLOUDINARY_ROOT = "presenz";

export interface UploadService {
  uploadDataUrl(dataUrl: string, folder: string): Promise<{ ok: true; url: string } | { ok: false; reason: string }>;
}

let cloudinaryConfigured = false;
async function getCloudinary() {
  const { v2: cloudinary } = await import("cloudinary");
  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
    cloudinaryConfigured = true;
  }
  return cloudinary;
}

class CloudinaryUploadService implements UploadService {
  async uploadDataUrl(dataUrl: string, folder: string) {
    try {
      const cloudinary = await getCloudinary();
      const result = await cloudinary.uploader.upload(dataUrl, {
        folder: `${CLOUDINARY_ROOT}/${folder}`,
        resource_type: "image",
      });
      return { ok: true as const, url: result.secure_url };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "cloudinary error";
      return { ok: false as const, reason };
    }
  }
}

class LocalUploadService implements UploadService {
  async uploadDataUrl(dataUrl: string, folder: string) {
    const m = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl);
    if (!m) return { ok: false as const, reason: "invalid data url" };
    const ext = m[1]!.split("/")[1]!.replace("jpeg", "jpg");
    const buf = Buffer.from(m[2]!, "base64");
    const id = crypto.randomBytes(8).toString("hex");
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}-${id}.${ext}`;
    await writeFile(path.join(dir, filename), buf);
    return { ok: true as const, url: `/uploads/${folder}/${filename}` };
  }
}

export function getUploadService(): UploadService {
  const live =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
  return live ? new CloudinaryUploadService() : new LocalUploadService();
}
