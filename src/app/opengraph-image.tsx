import { ImageResponse } from "next/og";
import { business } from "@/config/business";

/**
 * The picture that appears when this site's link is pasted into Facebook,
 * Nextdoor, LinkedIn, WhatsApp or iMessage.
 *
 * Placed at the root of the app directory, so Next serves it for every route
 * and writes both `og:image` and `twitter:image` into each page's head. The
 * site already declared `twitter: { card: "summary_large_image" }` with no
 * image behind it — a large card with nothing to show is downgraded to a bare
 * text row, which is how the link had been rendering everywhere.
 *
 * Generated rather than a static file. It reads the phone number, the name and
 * the service line from the same config the site does, so the card cannot
 * drift from the website the way an exported PNG quietly would.
 *
 * Deliberately not the logo on its own: a share card is read at thumbnail size
 * in a feed, so it carries the one thing a neighbour needs — who this is, what
 * they do, and the number to ring.
 */

export const alt = `${business.name} — heating and cooling in ${business.address.city}, ${business.address.state}`;

// The size every platform crops from. Anything smaller gets upscaled and looks
// soft; 1200x630 is the ratio Facebook, LinkedIn and X all crop toward.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens, matching src/app/globals.css.
const NAVY = "#001c41";
const ORANGE = "#ee600c";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NAVY,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Orange rule, echoing the accent the site uses on headings. */}
        <div style={{ display: "flex", width: 120, height: 10, background: ORANGE }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {business.name}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 34,
              color: "#bdc4ce",
              letterSpacing: "0.01em",
            }}
          >
            {business.serviceLine}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 26, color: "#94a0af" }}>
              {business.address.city}, {business.address.state}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 44,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {business.phone.display}
            </div>
          </div>

          {/*
            Only claimed when the config says it is true, the same rule the
            rest of the site follows — a share card is the last place to start
            asserting something the pages themselves will not.
          */}
          {business.emergency.available247 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: ORANGE,
                color: "#ffffff",
                fontSize: 28,
                fontWeight: 700,
                padding: "16px 28px",
                borderRadius: 12,
              }}
            >
              24/7 Emergency Service
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
