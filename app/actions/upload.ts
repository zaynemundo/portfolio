"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

/** Upload a single file to /public/uploads/<subfolder>/ and return its public URL */
export async function uploadFile(
  data: FormData,
  field: string,
  subfolder: string
): Promise<string | null> {
  const file = data.get(field) as File | null;
  if (!file || file.size === 0) return null;

  const dir = join(UPLOAD_DIR, subfolder);
  await ensureDir(dir);

  const ext = file.name.split(".").pop() ?? "bin";
  const safe = `${Date.now()}-${sanitizeFilename(file.name.replace(`.${ext}`, ""))}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(dir, safe), Buffer.from(bytes));

  return `/uploads/${subfolder}/${safe}`;
}
