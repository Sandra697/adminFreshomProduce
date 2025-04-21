// lib/upload.ts

export const uploadImage = async (file: File): Promise<string> => {
  const bytes = await file.arrayBuffer();
  const base64String = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64String}`;

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: dataUrl }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Upload failed");

  return data.url;
};
