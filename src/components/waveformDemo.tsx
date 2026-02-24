"use client"

import { ScrollingWaveform } from "@/components/ui/waveform"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

interface WaveformDemoProps {
  audioUrl: string;
}

export function WaveformDemo({ audioUrl }: WaveformDemoProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {
        // Auto-play might be blocked by browser
        console.log("Auto-play blocked");
      });
      setIsPlaying(true);
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card w-full rounded-lg border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Audio Output</h3>
      </div>
      
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />
      
      <ScrollingWaveform
        height={80}
        barWidth={3}
        barGap={2}
        speed={30}
        fadeEdges={true}
        barColor="gray"
      />

      <div className="flex items-center gap-4">
        <Button 
          onClick={handlePlayPause}
          size={'lg'}
          className="px-5"
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
        
        <div className="text-sm text-muted-foreground flex-1">
          <span>{formatTime(currentTime)}</span>
          <span className="mx-2">/</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="w-48 h-1 bg-input rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground transition-all"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}
