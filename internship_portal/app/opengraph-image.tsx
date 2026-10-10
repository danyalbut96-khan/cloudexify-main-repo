/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0D1B2A 0%, #102948 50%, #0D1B2A 100%)",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "48px" }}>
          <img
            src="https://internship.cloudexify.site/icon.png"
            width="120"
            height="120"
            alt="CloudExify logo"
            style={{ borderRadius: "24px", background: "rgba(255,255,255,0.05)" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "28px", fontWeight: 700, color: "#A8D8FF" }}>
              CloudExify
            </span>
            <span style={{ fontSize: "20px", color: "#B8D9FF" }}>
              Summer Internship 2026
            </span>
          </div>
        </div>
        <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1.05, maxWidth: "1040px" }}>
          CloudExify Summer Internship 2026
        </div>
        <div style={{ marginTop: "30px", fontSize: "32px", color: "#9FBFF8" }}>
          Full Stack · Remote · Certificate · LOR
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
