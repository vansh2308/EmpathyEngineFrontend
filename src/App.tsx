import React, { useState } from "react";
import axios from "axios";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import "./index.css";
import { WaveformDemo } from "./components/waveformDemo";

export default function App() {
  const [text, setText] = useState("GET OUT!!!");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotion, setEmotion] = useState("unknown");
  const [intensity, setIntensity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SAMPLES = [
    "GET OUT!!!",
    "I'm so happy right now! This is wonderful!",
    "I got the job! I actually got the job! I can't stop smiling!",
    "Oh my god oh my god oh my god! We're going to Paris!",
    "I can't believe it! We won! We actually won the championship!",
    "Tomorrow is the big day! I'm so excited I can't sleep!",
    "What?! No way! I never expected this!",
    "Look at that view! I had no idea it would be so beautiful!",
    "I can't believe my eyes! This is absolutely incredible!",
    "How did they build something so magnificent? It's breathtaking!",
    "I love the way you laugh, the way you smile, everything about you.",
    "Look what we accomplished together! I'm so proud of us!",
    "Oh thank goodness. It's finally over.",
    "I was so worried, but everything worked out fine. What a relief.",
    "How dare you speak to me like that! Show some respect!",
    "Get out of my sight before I say something I regret!",
    "I told you a hundred times! Why can't you just listen?",
    "GET AWAY FROM ME! NOW!",
    "YOU LIED TO MY FACE! HOW COULD YOU?!",
    "Please don't leave me alone. I'm really scared right now.",
    "SOMEBODY HELP! PLEASE! ANYONE!",
    "I miss you so much. It hurts to even think about you.",
    "I don't know how to live in a world without them.",
    "What's the point? Nothing ever changes.",
  ];

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

  const generateRandomInput = async (send = false) => {
    const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setText(sample);
    if (send) {
      await handleSynthesizeAudio();
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

        <Button
          onClick={() => generateRandomInput(false)}
          disabled={loading}
          variant="outline"
          className="p-2 px-3 cursor-pointer mb-3 hover:bg-foreground! hover:text-background"
        >
          Generate Random Input
        </Button>

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
          <div className="mt-2 p-3 text-destructive text-sm">{error}</div>
        )}

        {audioUrl && (
          <div className="flex flex-col gap-5 mt-10">
            <div className="flex justify-between gap-5">
              <div className="bg-card rounded-lg border p-6 w-1/2 h-32 flex flex-col justify-between">
                <span className="text-foreground/50 font-semibold text-3xl">
                  {emotion}
                </span>
                <span className="text-accent-foreground font-bold text-sm">
                  Emotion
                </span>
              </div>

              <div className="bg-card rounded-lg border p-6 w-1/2 h-32 flex flex-col justify-between">
                <span className="text-foreground/50 font-semibold text-3xl">
                  {intensity.toFixed(2)}
                </span>
                <span className="text-accent-foreground font-bold text-sm">
                  Intensity
                </span>
              </div>
            </div>
            <WaveformDemo audioUrl={audioUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
