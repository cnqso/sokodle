'use client'
import React, { useState, useEffect } from 'react';

interface LoaderProps {
  width: string;
  height: string;
  size: string;
}

const emojiList = ['🍒', '📦', '🧍', '✨', '🕺'];


const Loader: React.FC<LoaderProps> = ({ width, height, size }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [randomEmoji, setRandomEmoji] = useState<string>('');
  
  useEffect(() => {
    setRandomEmoji(emojiList[Math.floor(Math.random() * emojiList.length)]);
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
            fontSize: size,
            animation: 'spin3d 1s linear infinite',
            display: 'inline-block',
          }}
        >
          {randomEmoji}
        </span>
      </div>
    </div>
  );
};

export default Loader;
