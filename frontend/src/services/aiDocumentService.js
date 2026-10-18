const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("medikiosk-auth-token");
}

export async function analyzeMedicalDocument(file, context = {}) {
  if (!file) throw new Error("No document selected.");

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read the selected document."));
    reader.readAsDataURL(file);
  });

  const response = await fetch(`${API_BASE}/ai/analyze-document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      fileData: base64,
      context,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `AI analysis failed (${response.status}).`);
  return data;
}
