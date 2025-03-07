import React from "react";
import { Button } from "@/components/ui/button";
import { FinalScore } from "@/lib/types";

export default function ShareModal({ 
  finalScore, 
  onClose,
  levelNumber
}: { 
  finalScore: FinalScore;
  onClose: () => void;
  levelNumber?: number;
}) {
  const [copied, setCopied] = React.useState(false);

  const generateShareText = () => {
    const timeStr = `${Math.floor(finalScore.time / 60)}:${(finalScore.time % 60).toString().padStart(2, '0')}`;
    const header = levelNumber ? `Sokodle #${levelNumber}` : 'Sokoban';
    return `${header} 📦\nTime: ${timeStr}\nMoves: ${finalScore.steps}\n\n📦 Play at: https://sokoban.vercel.app`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: text,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h2 className="text-xl font-orelo mb-4">You won! 🎉</h2>
        <div className="mb-4 p-4 bg-gray-100 rounded whitespace-pre-line font-mono text-sm">
          {generateShareText()}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleShare} 
            className="flex-1"
            variant={copied ? "reverse" : "default"}
            disabled={copied}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={onClose} variant="neutral" className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 