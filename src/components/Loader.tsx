'use client'
import React, { useState, useEffect } from 'react';
import TileSprite, { TileKind } from '@/components/TileSprite';

interface LoaderProps {
  width: string;
  height: string;
  size: string;
}

const spriteList: TileKind[] = ['dock', 'cell', 'keeper', 'cell-docked'];


const Loader: React.FC<LoaderProps> = ({ width, height, size }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [randomSprite, setRandomSprite] = useState<TileKind>('dock');
  
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
          style={{
            width: size,
            height: size,
            display: 'inline-block',
          }}
        >
          <TileSprite kind={randomSprite} />
        </span>
      </div>
    </div>
  );
};

export default Loader;
