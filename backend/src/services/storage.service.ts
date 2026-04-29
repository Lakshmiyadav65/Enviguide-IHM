// -- File Storage (S3-compatible: Supabase, R2, AWS S3, MinIO, etc.) --
// If S3_* env vars are configured, uploads go to that bucket and we
// return a public URL. Otherwise uploads stay on local disk (dev
// fallback; ephemeral on Render free tier).

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';

const s3Configured = Boolean(
  env.S3_ENDPOINT && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_BUCKET,
);

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      // Supabase + MinIO need path-style. R2 + AWS S3 are fine either way.
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function isCloudStorageConfigured(): boolean {
  return s3Configured;
}

function randomSuffix(): string {
  return crypto.randomBytes(8).toString('hex');
}

export interface StoredFile {
  /** URL the frontend/supplier can fetch the file at. */
  url: string;
  /** Original filename the user uploaded. */
  name: string;
  /** Object key inside the bucket (for later deletion). */
  key?: string;
}

/**
 * Persist an uploaded file. If S3 is configured, streams the file to the
 * bucket and deletes the local temp file. Otherwise leaves the file on disk
 * and returns a /uploads/<...> URL for the local express static handler.
 */
export async function persistUploadedFile(
  localPath: string,
  originalName: string,
  folder: string,
): Promise<StoredFile> {
  if (!s3Configured) {
    const idx = localPath.replace(/\\/g, '/').lastIndexOf('/uploads/');
    const relUrl = idx >= 0
      ? localPath.replace(/\\/g, '/').substring(idx)
      : `/uploads/${folder}/${path.basename(localPath)}`;
    return { url: relUrl, name: originalName };
  }

  const ext = path.extname(originalName) || '';
  const key = `${folder}/${Date.now()}-${randomSuffix()}${ext}`;
  const body = fs.readFileSync(localPath);

  await getClient().send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentDisposition: `inline; filename="${originalName.replace(/"/g, '')}"`,
    }),
  );

  try { fs.unlinkSync(localPath); } catch { /* ignore */ }

  // If a public base URL is configured, use it; otherwise fall back to the
  // endpoint + bucket (works when the bucket is public and path-style).
  const base = env.S3_PUBLIC_BASE_URL
    ?? `${env.S3_ENDPOINT!.replace(/\/$/, '')}/${env.S3_BUCKET}`;
  return {
    url: `${base.replace(/\/$/, '')}/${key}`,
    name: originalName,
    key,
  };
}

/**
 * Generate a short-lived URL the browser can fetch with
 * Content-Disposition: inline — so PDFs / images render inside an
 * iframe instead of triggering a download. Supabase (and most S3-
 * compatible buckets) honour ResponseContentDisposition on signed
 * URL requests regardless of the object's stored disposition.
 *
 * @param filePathOrUrl  Either a full URL we returned from
 *                       persistUploadedFile() OR the bare S3 key.
 *                       We strip the public base prefix when present.
 * @returns The signed URL, or null when storage isn't S3-backed
 *          (local-disk dev mode — caller should serve the file via
 *          the express static handler instead).
 */
export async function getInlinePreviewUrl(
  filePathOrUrl: string,
  expiresInSeconds = 300,
): Promise<string | null> {
  if (!s3Configured) return null;

  // If the caller passed a full URL we built earlier, strip the base
  // prefix to get back to the S3 key.
  let key = filePathOrUrl;
  const base = (env.S3_PUBLIC_BASE_URL
    ?? `${env.S3_ENDPOINT!.replace(/\/$/, '')}/${env.S3_BUCKET}`
  ).replace(/\/$/, '');
  if (key.startsWith(`${base}/`)) {
    key = key.substring(base.length + 1);
  }
  // If we still have a full URL (different domain), bail out and let
  // the caller fall back to serving it directly.
  if (/^https?:\/\//i.test(key)) return null;

  const cmd = new GetObjectCommand({
    Bucket: env.S3_BUCKET!,
    Key: key,
    ResponseContentDisposition: 'inline',
  });
  return getSignedUrl(getClient(), cmd, { expiresIn: expiresInSeconds });
}

/** Delete a stored file by its S3 key. No-op for local files. */
export async function deleteStoredFile(key: string | null | undefined): Promise<void> {
  if (!key || !s3Configured) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET!, Key: key }));
  } catch { /* best-effort */ }
}
