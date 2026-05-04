import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Upload service. Cloudinary in prod, local /public/uploads in dev.

export interface UploadService {
  uploadDataUrl(dataUrl: string, folder: string): Promise<{ ok: true; url: string } | { ok: false; reason: string }>;
}

class CloudinaryUploadService implements UploadService {
  async uploadDataUrl(dataUrl: string, folder: string) {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
    const key = process.env.CLOUDINARY_API_KEY!;
    const secret = process.env.CLOUDINARY_API_SECRET!;
    const ts = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&timestamp=${ts}${secret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    const form = new FormData();
    form.append("file", dataUrl);
    form.append("folder", folder);
    form.append("api_key", key);
    form.append("timestamp", String(ts));
    form.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) return { ok: false as const, reason: `cloudinary ${res.status}` };
    const json = (await res.json()) as { secure_url: string };
    return { ok: true as const, url: json.secure_url };
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
  const live = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
  return live ? new CloudinaryUploadService() : new LocalUploadService();
}
