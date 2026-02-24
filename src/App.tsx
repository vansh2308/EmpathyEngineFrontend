import React, { useState } from "react";
import axios from "axios";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import "./index.css";
import { WaveformDemo } from "./components/waveFormDemo";

export default function App() {
  const [text, setText] = useState("GET OUT!!!");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotion, setEmotion] = useState("unknown");
  const [intensity, setIntensity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSynthesizeAudio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:8000/synthesize", {
        text,
        return_debug: true,
      });

      // Extract emotion and intensity from debug field
      if (response.data.debug) {
        setEmotion(response.data.debug.primary_emotion || "unknown");
        setIntensity(response.data.debug.intensity || 0);
      }

      // Convert base64 to blob and create object URL
      const binaryString = atob(response.data.audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to synthesize audio",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center text-foreground">
      <div className="w-[45vw]">
        <div className="rounded-lg shadow-xl mb-10">
          <h1 className="text-5xl font-bold mb-2">EmpathyEngine</h1>
          <p className="text-accent-foreground/50">
            Emotion-aware Text-to-Speech
          </p>
        </div>

        <div className="flex gap-3 min-h-fit items-stretch">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="GET OUT!!!"
            className="p-5 py-6"
          />
          <Button
            onClick={handleSynthesizeAudio}
            disabled={loading}
            variant="default"
            className="h-full! p-3 px-5"
          >
            {loading ? "Generating..." : "Send"}
          </Button>
        </div>

        {error && (
          <div className="mt-2 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {audioUrl && (
          <div className="flex flex-col gap-5 mt-10">
            <div className="flex justify-between gap-5">
                <div className="bg-card rounded-lg border p-6 w-1/2 h-32 flex flex-col justify-between"> 
                <span className="text-foreground/50 font-semibold text-3xl">
                    {emotion}
                </span>
                    <span className="text-accent-foreground font-bold text-sm">Emotion</span>
                </div>

                <div className="bg-card rounded-lg border p-6 w-1/2 h-32 flex flex-col justify-between"> 
                <span className="text-foreground/50 font-semibold text-3xl">
                    {intensity.toFixed(2)}
                </span>
                    <span className="text-accent-foreground font-bold text-sm">Intensity</span>
                </div>
            </div>
            <WaveformDemo audioUrl={audioUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
