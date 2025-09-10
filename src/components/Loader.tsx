import React, { useMemo } from 'react';

interface LoaderProps {
  /** Total width of the loader (includes emoji and its horizontal margins), e.g., "200px" or "50%" */
  width: string;
  /** Total height of the loader (includes emoji and its vertical margins), e.g., "200px" or "50%" */
  height: string;
  /** Size of the emoji (controls the font-size), e.g., "3rem" or "48px" */
  size: string;
}

// List of emojis to randomly choose from
const emojiList = ['🍒', '📦', '🧍', '✨', '🕺'];


const Loader: React.FC<LoaderProps> = ({ width, height, size }) => {
  // Pick a random emoji once per mount.
  const randomEmoji = useMemo(
    () => emojiList[Math.floor(Math.random() * emojiList.length)],
    []
  );

  return (
    <div className="flex justify-center items-center">
      <div
        style={{ width, height }}
        className="flex justify-center items-center"
      >
        <span
          style={{
            fontSize: size,
            // The animation applies our custom spin keyframes defined in CSS.
            animation: 'spin3d 1s linear infinite',
            display: 'inline-block', // Ensures the element is animatable.
          }}
        >
          {randomEmoji}
        </span>
      </div>
    </div>
  );
};

export default Loader;
