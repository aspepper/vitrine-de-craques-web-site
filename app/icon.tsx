import { ImageResponse } from 'next/og';

type ImageResponseConstructor =
  typeof import('next/dist/server/og/image-response').ImageResponse;

const OgImageResponse = ImageResponse as unknown as ImageResponseConstructor;

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new OgImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        color: '#FACC15',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '-0.02em',
      }}
    >
      VC
    </div>,
  );
}
