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
    if (!image) {
      setResult("No image selected");
      return;
    }

    setLoading(true);
    setResult("Sending request...");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(`HTTP ${res.status}: ${data.error || "Unknown error"}`);
      } else {
        setResult(String(data.result || "No result"));
      }
    } catch (err: any) {
      setResult(`Fetch error: ${err?.message || "Unknown fetch error"}`);
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Body Fat Visualizer</h1>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {image && (
        <div style={{ marginTop: 20 }}>
          <img
            src={image}
            alt="Preview"
            style={{ width: "100%", maxWidth: 300, display: "block", marginBottom: 12 }}
          />

          <button onClick={analyzeImage}>
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
