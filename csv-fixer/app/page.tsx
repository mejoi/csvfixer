"use client";

import React, { useState, ChangeEvent } from "react";

// @ts-ignore
import Papa from "papaparse";

interface CSVRow {
  [key: string]: string;
}

export default function Home() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [previewRows, setPreviewRows] = useState<CSVRow[]>([]);
  const [status, setStatus] = useState<string>("Awaiting file upload...");

  const [mapTitle, setMapTitle] = useState<string>("");
  const [mapPrice, setMapPrice] = useState<string>("");
  const [mapHandle, setMapHandle] = useState<string>("");
  const [isMapped, setIsMapped] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Parsing CSV file...");

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const parsedHeaders = Object.keys(results.data[0]);
          setHeaders(parsedHeaders);
          setRows(results.data);

          const lower = parsedHeaders.map((h) => h.toLowerCase());

          const titleIdx = lower.findIndex(
            (h) => h.includes("title") || h.includes("name")
          );
          if (titleIdx !== -1) setMapTitle(parsedHeaders[titleIdx]);

          const priceIdx = lower.findIndex(
            (h) => h.includes("price") || h.includes("cost")
          );
          if (priceIdx !== -1) setMapPrice(parsedHeaders[priceIdx]);

          const handleIdx = lower.findIndex(
            (h) =>
              h.includes("handle") || h.includes("url") || h.includes("id")
          );
          if (handleIdx !== -1) setMapHandle(parsedHeaders[handleIdx]);

          setIsMapped(true);
          setIsLocked(results.data.length > 5);

          setStatus(
            `✅ Successfully loaded ${results.data.length} rows. Please review the column mapping.`
          );
        } else {
          setStatus("❌ CSV file is empty.");
        }
      },
      error: (err: Error) => {
        setStatus(`❌ Parsing error: ${err.message}`);
      },
    });
  };

  const handleTransform = () => {
    if (!mapTitle || !mapPrice) {
      alert("Please select at least the Title and Price columns.");
      return;
    }

    const transformed = rows.map((row) => {
      const newRow = { ...row };
      const num = parseFloat(row[mapPrice]);
      newRow["Variant Price"] = !isNaN(num)
        ? (num * 1.5).toFixed(2)
        : row[mapPrice];

      const source = mapHandle && row[mapHandle] ? row[mapHandle] : row[mapTitle];
      if (source) {
        newRow["Handle"] = source
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      return newRow;
    });

    setRows(transformed);
    setPreviewRows(transformed.slice(0, 3));
    setStatus("🎉 Transformation completed! Preview your results below.");
  };

  const downloadCSV = () => {
    if (isLocked) return;
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "shopify_ready_import.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          padding: 32,
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 6px 0",
            color: "#1a1a1a",
          }}
        >
          Shopify CSV Converter
        </h1>
        <p style={{ margin: "0 0 20px 0", color: "#888", fontSize: 14 }}>
          {status}
        </p>
        <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: 14 }}>
          Automatically convert supplier CSV files into Shopify-ready product data.
        </p>

        {/* Step 1: Upload */}
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: 15, fontWeight: 600 }}>
            📁 Upload CSV
          </h3>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ cursor: "pointer", fontSize: 14 }}
          />
        </div>

        {/* Step 2: Mapping */}
        {isMapped && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <h3
              style={{ margin: "0 0 14px 0", fontSize: 15, fontWeight: 600 }}
            >
              🔗 Column Mapping
            </h3>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                Product Title *
              </label>
              <select
                value={mapTitle}
                onChange={(e) => setMapTitle(e.target.value)}
                style={selectStyle}
              >
                <option value="">-- Select Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                Original Price *
              </label>
              <select
                value={mapPrice}
                onChange={(e) => setMapPrice(e.target.value)}
                style={selectStyle}
              >
                <option value="">-- Select Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                Product Handle (Optional)
              </label>
              <select
                value={mapHandle}
                onChange={(e) => setMapHandle(e.target.value)}
                style={selectStyle}
              >
                <option value="">-- Optional --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleTransform} style={btnPrimary}>
              Generate Shopify CSV
            </button>
          </div>
        )}

        {/* Step 3: Preview & Download */}
        {previewRows.length > 0 && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
              padding: 20,
            }}
          >
            <h3
              style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 600 }}
            >
              ✅ Preview Results
            </h3>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Handle</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>New Price</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>{r["Handle"] || "—"}</td>
                    <td style={tdStyle}>{r[mapTitle] || "—"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      ${r["Variant Price"] || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={downloadCSV}
              disabled={isLocked}
              style={
                isLocked
                  ? { ...btnSuccess, opacity: 0.45, cursor: "not-allowed" }
                  : btnSuccess
              }
            >
              {isLocked
                ? "🔒 Upgrade to Pro to Download"
                : "⬇ Download Shopify CSV"}
            </button>

            {isLocked && (
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#dc2626",
                  fontSize: 12,
                }}
              >
                ⚠️ Files with more than 5 products can only be previewed in the free version. Upgrade to Pro for unlimited exports.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- inline style presets ---------- */

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

const btnSuccess: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 16,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 4,
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 8px",
  borderBottom: "2px solid #d1d5db",
  fontWeight: 600,
  color: "#555",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 8px",
  color: "#333",
};
