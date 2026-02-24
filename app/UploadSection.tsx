"use client";

import { useState } from "react";
import { uploadImageAndGenerateCaptions } from "./actions/captions";

export default function UploadSection() {
  const [isUploadingOrGenerating, setIsUploadingOrGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const supportedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
    ];
    if (!supportedTypes.includes(file.type)) {
      setStatusMessage(
        "Unsupported image type. Please use JPEG, PNG, WebP, GIF, or HEIC."
      );
      setUploadStatus("error");
      setTimeout(() => {
        setUploadStatus("idle");
        setStatusMessage(null);
      }, 3000);
      return;
    }

    setUploadStatus("uploading");
    setStatusMessage("Uploading image...");
    setGeneratedCaptions([]);

    try {
      // Convert file to base64 for transmission to server
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64String = btoa(binary);

      // Call server action
      setUploadStatus("processing");
      setStatusMessage("Generating captions...");
      const result = await uploadImageAndGenerateCaptions(
        base64String,
        file.type
      );

      if (result.success) {
        setUploadStatus("success");
        setStatusMessage(
          `Successfully generated ${result.captions?.length || 0} captions!`
        );
        // Extract caption text if it's an array of objects
        const captions = (result.captions || []).map((caption: any) => {
          if (typeof caption === "string") return caption;
          if (caption.content) return caption.content;
          if (caption.text) return caption.text;
          return JSON.stringify(caption);
        });
        setGeneratedCaptions(captions);
        setTimeout(() => {
          setUploadStatus("idle");
          setStatusMessage(null);
        }, 3000);
      } else {
        setUploadStatus("error");
        setStatusMessage(result.error || "Failed to generate captions");
        setTimeout(() => {
          setUploadStatus("idle");
          setStatusMessage(null);
        }, 3000);
      }
    } catch (error) {
      setUploadStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
      setTimeout(() => {
        setUploadStatus("idle");
        setStatusMessage(null);
      }, 3000);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        Upload & Generate Captions
      </h2>
      <p className="text-slate-600 mb-6">
        Upload an image and our AI will generate captions for it.
      </p>

      {/* Upload Input */}
      <div className="mb-6">
        <label className="block">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            onChange={handleFileSelect}
            disabled={isUploadingOrGenerating}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm font-medium ${
            uploadStatus === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : uploadStatus === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Generated Captions */}
      {generatedCaptions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Generated Captions:
          </h3>
          <div className="space-y-3">
            {generatedCaptions.map((caption, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <p className="text-slate-700">{caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
