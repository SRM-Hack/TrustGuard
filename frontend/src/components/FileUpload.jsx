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

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return "🖼️";
    if (type.startsWith('audio/')) return "🎵";
    if (type.startsWith('video/')) return "🎬";
    return "📄";
  };

  return (
    <section className="space-y-3 animate-fade-in-up">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 pl-1">{label}</p>
      
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 group overflow-hidden ${
          inlineError
            ? "border-red-400 bg-red-50/30"
            : selectedFile
            ? "border-green-400/60 bg-green-50/30"
            : isDragActive
            ? "border-blue-400 bg-blue-50/50 scale-[1.01] shadow-lg shadow-blue-100/50"
            : "border-gray-300/70 bg-white/40 backdrop-blur-sm hover:border-blue-400/50 hover:bg-white/60"
        }`}
      >
        <input {...getInputProps()} />
        
        {!selectedFile ? (
          <div className="space-y-4">
            {/* Icon Container */}
            <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl filter drop-shadow-sm">{icon}</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700">
                Drag & drop or <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">click to select</span>
              </p>
              
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {acceptedFormatsText.split(", ").map((fmt) => (
                  <span key={fmt} className="badge-blue !text-[10px] !px-2 !py-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    {fmt}
                  </span>
                ))}
              </div>
              
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1">
                Max size: {maxSizeMB} MB
              </p>
            </div>
          </div>
        ) : (
          /* File Selected State */
          <div className="animate-fade-in-up flex flex-col items-center gap-4">
            <div className="flex w-full items-center gap-4 glass-blue !bg-white/80 p-4 border-green-200/50 shadow-sm transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                {getFileIcon(selectedFile.type)}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <p className="truncate text-sm font-bold text-gray-800">
                  {selectedFile.name}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-200 animate-glow-pulse">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="btn-secondary !text-red-500 !border-red-100 hover:!bg-red-50 !py-1.5 !px-4 !text-xs font-bold"
            >
              Remove File
            </button>
          </div>
        )}

        {inlineError && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600 animate-shake">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-tight">{inlineError}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default FileUpload;
