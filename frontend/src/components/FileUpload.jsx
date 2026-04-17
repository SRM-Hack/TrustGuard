import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

function formatBytes(bytes = 0) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function acceptDescription(accept = "") {
  if (!accept) return "Any supported file";
  return accept
    .split(",")
    .map((part) => part.trim().replace("image/", "").replace("audio/", "").replace("video/", "").replace(".", ""))
    .filter(Boolean)
    .join(", ")
    .toUpperCase();
}

function FileUpload({
  accept = "",
  maxSizeMB = 50,
  onFileSelected,
  label = "Upload file",
  icon = "📁",
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [inlineError, setInlineError] = useState("");
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const acceptedFormatsText = useMemo(() => acceptDescription(accept), [accept]);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const tooLarge = rejectedFiles.some((file) =>
        file.errors.some((err) => err.code === "file-too-large")
      );
      const message = tooLarge
        ? `File exceeds ${maxSizeMB}MB limit.`
        : "Unsupported file type.";
      setInlineError(message);
      toast.error(message);
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setInlineError("");
    setSelectedFile(file);
    onFileSelected?.(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setInlineError("");
    onFileSelected?.(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: accept
      ? accept.split(",").reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {})
      : undefined,
    maxSize: maxSizeBytes,
    multiple: false,
    onDrop,
  });

  return (
    <section className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-2 text-4xl">{icon}</div>
        <p className="text-sm font-medium text-gray-700">
          Drag & drop or click to select
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Accepted formats: {acceptedFormatsText}
        </p>
        <p className="text-xs text-gray-500">Max size: {maxSizeMB} MB</p>

        {selectedFile && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-left">
            <p className="text-sm font-semibold text-green-700">
              ✅ {selectedFile.name}
            </p>
            <p className="text-xs text-green-700">{formatBytes(selectedFile.size)}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}

        {inlineError && (
          <p className="mt-3 text-sm font-medium text-red-600">{inlineError}</p>
        )}
      </div>
    </section>
  );
}

export default FileUpload;
