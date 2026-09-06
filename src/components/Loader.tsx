'use client'
import React, { useState, useEffect } from 'react';
import GuineaPigArt, { type ArtKind } from '@/components/GuineaPigArt';

interface LoaderProps {
  width: string;
  height: string;
  size: string;
}

const spriteList: ArtKind[] = ['bowl', 'carrot', 'guinea-pig', 'bowl-full'];


const Loader: React.FC<LoaderProps> = ({ width, height, size }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [randomSprite, setRandomSprite] = useState<ArtKind>('bowl');
  
  useEffect(() => {
    setRandomSprite(spriteList[Math.floor(Math.random() * spriteList.length)]);
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex justify-center items-center">
      <div
        style={{ width, height }}
        className="flex justify-center items-center"
      >
        <span
          className="[&_svg]:block [&_svg]:h-full [&_svg]:w-full"
          style={{
            width: size,
            height: size,
            display: 'inline-block',
          }}
        >
          <GuineaPigArt kind={randomSprite} />
        </span>
      </div>
    </div>
  );
};

export default Loader;
