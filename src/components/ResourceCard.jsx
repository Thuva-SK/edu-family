import React from 'react';
import { useData } from '../context/DataContext';

export default function ResourceCard({ resource }) {
  const { isNew, formatDate, showToast, getFile } = useData();

  const shortCategory =
    resource.category === "General Knowledge"
      ? "GK"
      : resource.category
          .split(" ")
          .map((word) => word[0])
          .join("");

  const hasValidLink = resource.link && resource.link !== "#" && !resource.link.startsWith("data:");
  const downloadUrl = resource.fileData || resource.link || "#";
  const downloadName = resource.fileName || `${resource.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  const handleDownload = async (e) => {
    if (resource.fileId && !hasValidLink) {
      e.preventDefault();
      try {
        const file = await getFile(resource.fileId);
        if (!file) {
          showToast("PDF file was not found in this browser");
          return;
        }
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadName || file.name || "resource.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (err) {
        showToast("Error retrieving PDF file");
      }
    }
  };

  return (
    <article className="resource-card">
      <div className="resource-icon" aria-hidden="true">
        {shortCategory}
      </div>
      <div className="meta-row">
        <span className="category-pill">{resource.category}</span>
        {isNew(resource.date) && <span className="badge">New</span>}
      </div>
      <h3>{resource.title}</h3>
      <p>{resource.description}</p>
      <div className="meta-row">
        <span>Uploaded {formatDate(resource.date)}</span>
      </div>
      <a
        className="btn btn-secondary"
        href={downloadUrl}
        download={downloadName}
        target={hasValidLink ? "_blank" : undefined}
        rel={hasValidLink ? "noopener noreferrer" : undefined}
        onClick={handleDownload}
      >
        Download PDF
      </a>
    </article>
  );
}
