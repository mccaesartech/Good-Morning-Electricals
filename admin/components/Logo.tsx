import type { CSSProperties } from 'react';
import { assetUrl } from '@/lib/constants';

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  style?: CSSProperties;
};

export default function Logo({
  width = 40,
  height = 40,
  className = '',
  alt = 'Good Morning Electrical Engineering Academy',
  style
}: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetUrl('/assets/logo.png')}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}
