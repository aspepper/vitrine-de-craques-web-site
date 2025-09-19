import { ImageResponse } from "next/og"

type ImageResponseConstructor =
  typeof import("next/dist/server/og/image-response").ImageResponse

const OgImageResponse = ImageResponse as unknown as ImageResponseConstructor

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default function Icon() {
  return new OgImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
        fill="none"
        style={{ width: "80%", height: "80%" }}
      >
        <rect width="128" height="128" fill="#ffffff" rx="16" />
        <path
          d="M66.2 22c-9.6 0-17.4 7.8-17.4 17.4 0 5.6 2.5 10.7 6.8 14.1L45.3 63c-3.1 3.7-4.3 8.6-3.2 13.2 1.4 6 6 11 11.9 12.9l13 4.4-12 16.3c-1.8 2.4-1.3 5.8 1.1 7.6 2.4 1.8 5.8 1.3 7.6-1.1l15.4-21 12.6 4.5c2.8 1 5.8-0.4 6.8-3.2 1-2.8-0.4-5.8-3.2-6.8l-12.2-4.3 10.3-13.8c2.7-3.7 4.1-8.1 4.1-12.6 0-11.9-9.6-21.5-21.5-21.5h-4.8l5-6.7c1.8-2.4 1.3-5.8-1.1-7.6s-5.8-1.3-7.6 1.1L66.2 22Z"
          fill="#111111"
        />
        <circle cx="34" cy="96" r="9" fill="#111111" />
      </svg>
    </div>,
  )
}
