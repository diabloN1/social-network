"use client";

import { useParams, useSearchParams } from "next/navigation";
import "@/components/post-share-modal.css";
import Link from "next/link";

export default function ErrorPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const code = params?.code ?? "Unknown";
  const cause = searchParams.get("cause") || "An unexpected error occurred.";

  return (
    <div className="modal-overlay">
      <div className="post-share-modal" style={{ padding: 24 }}>
        <div className="modal-header">
          <h2>Error {code}</h2>
        </div>

        <div className="modal-content" style={{ paddingTop: 12 }}>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary, #b0b3b8)",
              lineHeight: 1.6,
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            {cause}
          </p>

          <div style={{ textAlign: "center" }}>
            <Link href="/" className="add-btn" style={{ textDecoration: "none" }}>
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
