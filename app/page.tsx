"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult("");
    };
    reader.readAsDataURL(file);
  }

  async function analyzeImage() {

    if (!image) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();
      setResult(data.result || "No result");
    } catch (err) {
      setResult("Error analyzing image");
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Body Fat Visualizer</h1>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {image && (
        <div style={{ marginTop: 20 }}>
          <img src={image} style={{ width: "100%", maxWidth: 300 }} />

          <button onClick={analyzeImage} style={{ marginTop: 10 }}>
            {loading ? "Analyzing..." : "Analyze body fat"}
          </button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Result:</h3>
          <p>{result}</p>
        </div>
      )}
    </main>
  );
}
