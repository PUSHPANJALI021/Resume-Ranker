import { useState } from "react";

export default function ResumeUploader({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one resume.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    files.forEach((file) => formData.append("resumes", file));

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUploadComplete(data.resumeIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Upload Resumes</h2>
      <p className="text-gray-400 mb-4">Supports PDF, DOC, DOCX — upload multiple at once</p>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput").click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
          dragging ? "border-blue-400 bg-blue-900/20" : "border-gray-600 hover:border-gray-400"
        }`}
      >
        <p className="text-gray-400">Drag & drop resumes here</p>
        <p className="text-gray-500 text-sm mt-1">or click to browse files</p>
        <input
          id="fileInput"
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <span className="text-sm text-gray-200">{file.name}</span>
              <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-400 ml-4">✕</button>
            </div>
          ))}
          <p className="text-green-400 text-sm text-center">✓ {files.length} file{files.length > 1 ? "s" : ""} ready to upload</p>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="mt-6 w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 disabled:opacity-50 transition"
      >
        {uploading ? "Uploading..." : `Upload ${files.length} Resume${files.length !== 1 ? "s" : ""} →`}
      </button>
    </div>
  );
}