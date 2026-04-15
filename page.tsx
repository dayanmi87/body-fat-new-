"use client";

import { ChangeEvent, useMemo, useState } from "react";
import type { AnalysisResult, GenerationResult } from "@/lib/types";

const DELTA_OPTIONS = [-8, -6, -4, -2, 0, 2, 4, 6];

type Status = "idle" | "analyzing" | "generating";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file."));
        return;
      }

      const [meta, data] = result.split(",");
      const mimeTypeMatch = meta.match(/data:(.*);base64/);
      const mimeType = mimeTypeMatch?.[1] ?? file.type ?? "image/jpeg";

      resolve({
        base64: data,
        mimeType,
        previewUrl: result,
      });
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export default function Page() {
  const [status, setStatus] = useState<Status>("idle");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [delta, setDelta] = useState<number>(-4);
  const [generation, setGeneration] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string>("");

  const canAnalyze = Boolean(imageBase64) && status !== "analyzing" && status !== "generating";
  const canGenerate =
    Boolean(imageBase64) &&
    Boolean(analysis) &&
    status !== "analyzing" &&
    status !== "generating";

  const outputUrl = useMemo(() => {
    if (!generation?.outputImageBase64) return "";
    return `data:image/png;base64,${generation.outputImageBase64}`;
  }, [generation]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setAnalysis(null);
    setGeneration(null);

    const file = event.target.files?.[0];
    if (!file) return;

    const { base64, mimeType, previewUrl } = await fileToBase64(file);
    setImageBase64(base64);
    setMimeType(mimeType);
    setPreviewUrl(previewUrl);
  }

  async function handleAnalyze() {
    try {
      setStatus("analyzing");
      setError("");
      setGeneration(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setStatus("idle");
    }
  }

  async function handleGenerate() {
    if (!analysis) return;

    try {
      setStatus("generating");
      setError("");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          currentBodyFat: analysis.estimatedBodyFat,
          delta,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setGeneration(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.headerCard}>
          <div style={styles.badge}>MVP • Mobile First</div>
          <h1 style={styles.title}>הדמיית שינוי אחוז שומן מתמונה</h1>
          <p style={styles.subtitle}>
            העלה תמונה, קבל הערכת אחוז שומן חזותית עם טווח אמינות, ואז צור הדמיה חדשה לפי שינוי של
            אחוזי שומן.
          </p>
        </section>

        <section style={styles.card}>
          <label style={styles.uploadBox}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <span style={styles.uploadTitle}>העלאת תמונה</span>
            <span style={styles.uploadHint}>JPG / PNG / WEBP • עדיף גוף מלא • מתאים במיוחד למובייל</span>
          </label>

          {previewUrl ? (
            <div style={styles.previewWrap}>
              <img src={previewUrl} alt="Preview" style={styles.previewImage} />
            </div>
          ) : null}

          <button onClick={handleAnalyze} disabled={!canAnalyze} style={buttonStyle(canAnalyze)}>
            {status === "analyzing" ? "מנתח תמונה..." : "נתח תמונה"}
          </button>

          <p style={styles.disclaimer}>
            ההערכה היא חזותית בלבד ואינה מדידה רפואית. התוצאה מיועדת להמחשה ולהכוונה בלבד.
          </p>
        </section>

        {analysis ? (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>תוצאת הניתוח</h2>
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>אחוז שומן משוער</span>
                <strong style={styles.metricValue}>{analysis.estimatedBodyFat}%</strong>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>טווח סביר</span>
                <strong style={styles.metricValue}>
                  {analysis.minBodyFat}%–{analysis.maxBodyFat}%
                </strong>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>רמת ביטחון</span>
                <strong style={styles.metricValue}>{analysis.confidence}</strong>
              </div>
            </div>

            <div style={styles.notesSection}>
              <div>
                <h3 style={styles.listTitle}>הסברים</h3>
                <ul style={styles.list}>
                  {analysis.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={styles.listTitle}>אזהרות איכות קלט</h3>
                <ul style={styles.list}>
                  {analysis.inputQualityWarnings.length > 0 ? (
                    analysis.inputQualityWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))
                  ) : (
                    <li>לא זוהו בעיות איכות משמעותיות.</li>
                  )}
                </ul>
              </div>
            </div>

            <div style={styles.deltaPanel}>
              <label style={styles.deltaLabel}>בחר שינוי יחסי באחוזי שומן</label>
              <div style={styles.deltaOptions}>
                {DELTA_OPTIONS.map((value) => {
                  const selected = delta === value;
                  const target = analysis.estimatedBodyFat + value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDelta(value)}
                      style={chipStyle(selected)}
                    >
                      {value > 0 ? `+${value}%` : `${value}%`}
                      <span style={styles.chipSub}>יעד: {target}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!canGenerate} style={buttonStyle(canGenerate)}>
              {status === "generating" ? "יוצר הדמיה..." : "צור הדמיה"}
            </button>
          </section>
        ) : null}

        {generation && outputUrl ? (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>לפני / אחרי</h2>
            <div style={styles.compareGrid}>
              <div style={styles.compareCard}>
                <span style={styles.compareLabel}>לפני</span>
                <img src={previewUrl} alt="Before" style={styles.compareImage} />
              </div>
              <div style={styles.compareCard}>
                <span style={styles.compareLabel}>
                  אחרי • יעד {generation.targetBodyFat}%
                </span>
                <img src={outputUrl} alt="After" style={styles.compareImage} />
              </div>
            </div>

            <a href={outputUrl} download="body-fat-simulation.png" style={styles.downloadButton}>
              הורד את ההדמיה
            </a>
          </section>
        ) : null}

        {error ? <section style={styles.errorBox}>{error}</section> : null}

        <section style={styles.footerNote}>
          <strong>מה צריך כדי שזה יעבוד בפועל:</strong> להגדיר מפתח API בשרת של Next.js ואז להעלות
          את הפרויקט ל-GitHub ול-Vercel.
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "20px 14px 40px",
  },
  shell: {
    width: "100%",
    maxWidth: 520,
    margin: "0 auto",
    display: "grid",
    gap: 16,
  },
  headerCard: {
    background: "rgba(17, 24, 45, 0.88)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 14px 34px rgba(0,0,0,0.26)",
  },
  badge: {
    display: "inline-block",
    marginBottom: 10,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(27, 201, 177, 0.14)",
    color: "#87f5e4",
    fontSize: 12,
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.15,
  },
  subtitle: {
    margin: "10px 0 0",
    color: "#d0d7ea",
    lineHeight: 1.6,
    fontSize: 15,
  },
  card: {
    background: "rgba(17, 24, 45, 0.88)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 16,
    boxShadow: "0 14px 34px rgba(0,0,0,0.22)",
    display: "grid",
    gap: 14,
  },
  uploadBox: {
    display: "grid",
    gap: 8,
    padding: 18,
    borderRadius: 18,
    border: "1.5px dashed rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.03)",
    cursor: "pointer",
  },
  uploadTitle: {
    fontWeight: 700,
    fontSize: 18,
  },
  uploadHint: {
    color: "#b8c2dc",
    fontSize: 13,
    lineHeight: 1.5,
  },
  previewWrap: {
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  previewImage: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
  },
  disclaimer: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: "#b8c2dc",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 21,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  metricCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 12,
    display: "grid",
    gap: 8,
  },
  metricLabel: {
    color: "#b8c2dc",
    fontSize: 12,
    lineHeight: 1.3,
  },
  metricValue: {
    fontSize: 21,
    lineHeight: 1.1,
  },
  notesSection: {
    display: "grid",
    gap: 12,
  },
  listTitle: {
    margin: "0 0 8px",
    fontSize: 15,
  },
  list: {
    margin: 0,
    paddingInlineStart: 18,
    color: "#d0d7ea",
    lineHeight: 1.6,
    fontSize: 14,
  },
  deltaPanel: {
    display: "grid",
    gap: 10,
  },
  deltaLabel: {
    fontWeight: 700,
    fontSize: 15,
  },
  deltaOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  chipSub: {
    display: "block",
    fontSize: 11,
    opacity: 0.85,
    marginTop: 4,
  },
  compareGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  compareCard: {
    display: "grid",
    gap: 8,
  },
  compareLabel: {
    fontWeight: 700,
    fontSize: 14,
  },
  compareImage: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  downloadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    borderRadius: 16,
    fontWeight: 700,
    background: "#14d4b4",
    color: "#041017",
  },
  errorBox: {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(255, 107, 107, 0.4)",
    background: "rgba(255, 107, 107, 0.10)",
    color: "#ffd8d8",
    fontWeight: 700,
  },
  footerNote: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "#d0d7ea",
    padding: 4,
  },
};

function buttonStyle(enabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    minHeight: 52,
    borderRadius: 16,
    border: "none",
    fontWeight: 700,
    fontSize: 16,
    background: enabled ? "linear-gradient(135deg, #6fa8ff 0%, #42e3c5 100%)" : "#44506c",
    color: "#041017",
    cursor: enabled ? "pointer" : "not-allowed",
  };
}

function chipStyle(selected: boolean): React.CSSProperties {
  return {
    minHeight: 62,
    borderRadius: 16,
    border: selected ? "1.5px solid #7ce7d8" : "1px solid rgba(255,255,255,0.08)",
    background: selected ? "rgba(124,231,216,0.12)" : "rgba(255,255,255,0.03)",
    color: "#f3f7ff",
    fontWeight: 700,
    cursor: "pointer",
    padding: "10px 8px",
  };
}