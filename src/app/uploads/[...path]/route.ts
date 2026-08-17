import { readUpload } from "@/server/content/uploads";

/**
 * Serves admin-uploaded images.
 *
 * Uploads live outside `public/` (see src/server/content/uploads.ts for why),
 * so they need a handler. Path traversal is blocked in `readUpload`, which
 * confirms the resolved path is still inside the uploads directory before
 * reading anything.
 *
 * `nosniff` matters here: the bytes are user-supplied, and without it a
 * browser could be talked into interpreting a crafted file as something other
 * than the image type we declare.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const file = readUpload(path);

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "X-Content-Type-Options": "nosniff",
      // Filenames are content-addressed UUIDs, so a stored file never changes
      // identity — safe to cache hard. Replacing a photo produces a new name.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
