export function getFileType(file) {
  if (!file) return null;

  let fileName = typeof file === "string" ? file : file.url;
  if (!fileName || typeof fileName !== "string") return null;

  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : null;
}

export const formatBytes = (bytes) =>
  `${(bytes / 1024).toFixed(2)} KB`;

export const formatDate = (timestamp) =>
  new Date(timestamp).toLocaleString();