// -- File Storage (Cloudflare R2 / S3-compatible) --------------------
// If R2 env vars are configured, uploads go to R2 and we return a public
// URL. Otherwise uploads stay on local disk (dev fallback; ephemeral on
// Render free tier, which is why we want R2 in production).

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';

const r2Configured = Boolean(
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET,
);

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function isCloudStorageConfigured(): boolean {
  return r2Configured;
}

function randomSuffix(): string {
  return crypto.randomBytes(8).toString('hex');
}

export interface StoredFile {
  /** URL the frontend/supplier can fetch the file at. Full https:// in prod. */
  url: string;
  /** Original filename the user uploaded. */
  name: string;
  /** Object key inside the bucket (for later deletion). */
  key?: string;
}

/**
 * Persist an uploaded file. If R2 is configured, streams the file to R2
 * and deletes the local temp file. Otherwise leaves the file on disk and
 * returns a /uploads/<localPath> URL for the local express static handler.
 *
 * @param localPath Full filesystem path where multer wrote the file.
 * @param originalName Original uploaded filename (for Content-Disposition).
 * @param folder Sub-folder inside the bucket / inside /uploads. e.g. "mds", "po".
 */
export async function persistUploadedFile(
  localPath: string,
  originalName: string,
  folder: string,
): Promise<StoredFile> {
  if (!r2Configured) {
    // Dev fallback: keep file on local disk and return a /uploads/... URL.
    // Expect localPath under the project's uploads/ directory; compute the
    // relative path for the static handler.
    const idx = localPath.replace(/\\/g, '/').lastIndexOf('/uploads/');
    const relUrl = idx >= 0 ? localPath.replace(/\\/g, '/').substring(idx) : `/uploads/${folder}/${path.basename(localPath)}`;
    return { url: relUrl, name: originalName };
  }

  const ext = path.extname(originalName) || '';
  const key = `${folder}/${Date.now()}-${randomSuffix()}${ext}`;
  const body = fs.readFileSync(localPath);

  await getClient().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET!,
      Key: key,
      Body: body,
      ContentDisposition: `inline; filename="${originalName.replace(/"/g, '')}"`,
    }),
  );

  // Clean up the local temp file — we don't need it once R2 has the object.
  try { fs.unlinkSync(localPath); } catch { /* ignore */ }

  const base = env.R2_PUBLIC_BASE_URL ?? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}`;
  return {
    url: `${base.replace(/\/$/, '')}/${key}`,
    name: originalName,
    key,
  };
}

/** Delete a stored file by its R2 key. No-op for local files. */
export async function deleteStoredFile(key: string | null | undefined): Promise<void> {
  if (!key || !r2Configured) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET!, Key: key }));
  } catch { /* swallow — delete is best-effort */ }
}
