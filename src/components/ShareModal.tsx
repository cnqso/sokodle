import React from "react";
import { Button } from "@/components/ui/button";
import { FinalScore } from "@/lib/types";
import { Clipboard, Check } from "lucide-react";

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
    console.log(finalScore);
    const timeStr = Math.floor(finalScore.time / 6000).toString().padStart(2, '0') + ':' + ((Math.floor(finalScore.time / 100)) % 60).toString().padStart(2, '0') + ':' + (finalScore.time % 100).toString().padStart(2, '0');
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
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300 slide-in-from-bottom-4">
        <h2 className="text-xl font-orelo mb-4 text-center">You won!</h2>
        <div className="mb-4 p-4 bg-gray-100 rounded whitespace-pre-line font-jetbrains text-sm">
          {generateShareText()}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="px-3"
            variant="neutral"
            disabled={copied}
          >
            {copied ? <Check size={16} /> : <Clipboard size={16} />}
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1"
            variant="default"
          >
            Share
          </Button>
          <Button onClick={onClose} variant="neutral" className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 