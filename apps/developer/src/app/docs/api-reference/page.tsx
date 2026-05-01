"use client";

import { RedocStandalone } from "redoc";
import Link from "next/link";

export default function ApiReferencePage() {
  return (
    <div>
      <p className="kicker" style={{ marginBottom: 10 }}>
        <Link className="subtleLink" href="/docs">
          ← Docs
        </Link>
      </p>

      <div
        className="tile"
        style={{
          cursor: "default",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 14, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <h1 className="h2" style={{ margin: 0 }}>
            API Reference
          </h1>
          <p className="lede" style={{ marginTop: 8 }}>
            OpenAPI-powered docs for public read endpoints and operator OAuth write endpoints.
          </p>
        </div>

        <div style={{ background: "#0b0d14" }}>
          <RedocStandalone
            specUrl="/openapi.yaml"
            options={{
              theme: {
                colors: {
                  primary: { main: "#7c3aed" },
                },
                typography: {
                  fontSize: "14px",
                  headings: {
                    fontFamily:
                      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
                  },
                  fontFamily:
                    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

