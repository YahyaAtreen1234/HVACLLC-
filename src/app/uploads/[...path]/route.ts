import { contentTypeFor, readUpload } from "@/server/content/uploads";
import { env } from "@/server/env";

/**
 * Serves admin-uploaded images.
 *
 * Two sources sit behind one URL shape. A filesystem deployment reads from the
 * uploads directory; a deployment using a *private* Blob store reads the blob
 * back with the token, because a private blob has no publicly fetchable URL of
 * its own. A public Blob store never reaches here at all — those records store
 * the blob's own CDN URL.
 *
 * Path traversal is blocked in `readUpload`, which confirms the resolved path
 * is still inside the uploads directory before reading anything.
 *
 * `nosniff` matters here: the bytes are user-supplied, and without it a
 * browser could be talked into interpreting a crafted file as something other
 * than the image type we declare.
 */

const IMAGE_HEADERS = (contentType: string) => ({
  "Content-Type": contentType,
  "X-Content-Type-Options": "nosniff",
  // Filenames are content-addressed UUIDs, so a stored file never changes
  // identity — safe to cache hard. Replacing a photo produces a new name.
  "Cache-Control": "public, max-age=31536000, immutable",
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  const file = readUpload(path);
  if (file) {
    return new Response(new Uint8Array(file.bytes), {
      headers: IMAGE_HEADERS(file.contentType),
    });
  }

  if (env.blobToken) {
    const pathname = path.join("/");
    const contentType = contentTypeFor(pathname);

    // Only extensions this site accepts as images are served, so a stored blob
    // of another type cannot be handed back through an <img>.
    if (contentType) {
      try {
        const { get } = await import("@vercel/blob");
        const result = await get(pathname, {
          access: "private",
          token: env.blobToken,
        });

        // Null when the blob is absent; the union carries a stream only on a
        // 200, since a 304 answers a conditional request with no body.
        if (result?.statusCode === 200) {
          return new Response(result.stream, {
            headers: IMAGE_HEADERS(contentType),
          });
        }
      } catch {
        // Falls through to 404 — a missing blob and a missing file should look
        // the same from outside.
      }
    }
  }

  return new Response("Not found", { status: 404 });
}
