import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rooted Right Farms — Premium Indoor Cannabis, Ardmore OK";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(ellipse 120% 80% at 30% 20%, #2D5E3A 0%, #1B3A28 70%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "10px 16px",
            background: "rgba(255, 255, 255, 0.85)",
            color: "#1B3A28",
            borderRadius: 4,
            fontSize: 18,
            letterSpacing: 4,
            fontWeight: 500,
            alignSelf: "flex-start",
          }}
        >
          ARDMORE, OK
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              fontFamily: "serif",
              maxWidth: 900,
            }}
          >
            Premium indoor hydroponic cannabis.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#D6DDD0",
              fontSize: 24,
            }}
          >
            <span>Rooted Right Farms</span>
            <span style={{ color: "#DA724F", fontWeight: 600 }}>
              rootedrightfarms.com
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
