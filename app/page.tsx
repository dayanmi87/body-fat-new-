"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);

  function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
