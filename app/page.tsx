"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);

  function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Body Fat Visualizer</h1>

      <input type="file" onChange={handleUpload} />

      {image && (
        <div>
          <h3>Preview:</h3>
          <img src={image} style={{ width: "100%", maxWidth: 300 }} />
        </div>
      )}
    </main>
  );
