"use client";

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/utils/cn";
import { isVideo, getEmbedInfo, isDirectVideo } from "@/utils/videoUtils";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  label?: string;
}

export default function ImageUploader({
  value,
  onChange,
  error,
  label = "Product Image",
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoInput, setVideoInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "lslwlv9d";
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pet-shop";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!response.ok)
        throw new Error("Failed to upload image to Cloudinary.");
      const data = await response.json();

      onChange(data.secure_url);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      setUploadError(err.message || "Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleApplyVideo = () => {
    const trimmed = videoInput.trim();
    if (!trimmed) return;
    if (!isVideo(trimmed)) {
      setUploadError(
        "Please enter a valid video URL (YouTube, Vimeo, Dailymotion, Streamable, or a direct .mp4/.webm link).",
      );
      return;
    }
    setUploadError(null);
    onChange(trimmed);
  };

  const tabClass = (tab: "upload" | "url") =>
    cn(
      "px-4 py-1.5 text-xs font-extrabold transition-all border-b-2 -mb-2 cursor-pointer uppercase tracking-wider",
      activeTab === tab
        ? "border-teal-500 text-teal-600"
        : "border-transparent text-slate-400 hover:text-slate-600",
    );

  const currentIsVideo = isVideo(value);
  const embedInfo = value ? getEmbedInfo(value) : null;
  const isDirect = value ? isDirectVideo(value) : false;

  const getOriginalUrl = (val: string) => {
    const prefix = `https://res.cloudinary.com/${cloudName}/image/fetch/`;
    if (val && val.startsWith(prefix)) {
      const remaining = val.slice(prefix.length);
      const slashIdx = remaining.indexOf("/");
      if (slashIdx !== -1) {
        try {
          return decodeURIComponent(remaining.slice(slashIdx + 1));
        } catch (e) {
          return remaining.slice(slashIdx + 1);
        }
      }
    }
    return val || "";
  };

  // Sync inputs when value updates from external source
  useEffect(() => {
    if (value && !currentIsVideo) {
      setImageUrlInput(getOriginalUrl(value));
    } else if (!value) {
      setImageUrlInput("");
    }

    if (value && currentIsVideo) {
      setVideoInput(value);
    } else if (!value) {
      setVideoInput("");
    }
  }, [value, currentIsVideo]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <span className="text-xs font-bold text-slate-700 tracking-wide">
          {label}
        </span>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* ── Image Uploader (2 tabs) ── */}
      <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 shadow-sm space-y-4">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200/80 -mx-4 px-4 pb-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={tabClass("upload")}
          >
            <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i>
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={tabClass("url")}
          >
            <i className="fa-solid fa-link mr-1.5"></i>
            Image Link
          </button>
        </div>

        {/* Tab 1: Upload */}
        {activeTab === "upload" && (
          <div>
            {value && !currentIsVideo ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-100/50 flex flex-col items-center justify-center p-3 min-h-[180px] cursor-pointer transition-all duration-200",
                  isDragging
                    ? "border-2 border-dashed border-teal-500 bg-teal-50/60"
                    : "hover:border-teal-400/80 hover:shadow-inner",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Upload preview"
                  className="max-h-48 object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                />

                {isDragging && (
                  <div className="absolute inset-0 bg-teal-500/10 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 text-teal-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                      Drop to replace image
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-medium">
                      Replacing image...
                    </span>
                  </div>
                )}

                {!isDragging && !isUploading && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white">
                    <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                    <span className="text-[11px] font-bold tracking-wide">
                      Drag & drop or click to replace
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 min-h-[150px]",
                  isDragging
                    ? "border-teal-500 bg-teal-50/50"
                    : "border-slate-300 hover:border-teal-500 bg-white hover:bg-slate-50",
                  error || uploadError ? "border-red-500 bg-red-50/30" : "",
                )}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-medium">
                      Uploading to Cloudinary...
                    </span>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400"></i>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700">
                        Drag & drop your image, or{" "}
                        <span className="text-teal-600">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Supports PNG, JPG, JPEG, WEBP up to 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "url" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste image link here (e.g. https://example.com/image.jpg)"
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setUploadError(null);
                }}
                className={cn(
                  "flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-150",
                  (error || uploadError) &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500",
                )}
              />

              <button
                type="button"
                onClick={() => {
                  const externalUrl = imageUrlInput.trim();

                  if (!externalUrl) {
                    setUploadError("Please enter an image URL.");
                    return;
                  }

                  // If it's already a Cloudinary URL, use it directly
                  if (externalUrl.includes("res.cloudinary.com")) {
                    onChange(externalUrl);
                    setUploadError(null);
                    return;
                  }

                  const cloudinaryUrl =
                    `https://res.cloudinary.com/${cloudName}/image/fetch/` +
                    `w_800,q_auto,f_auto/${encodeURIComponent(externalUrl)}`;

                  console.log("Original external URL:", externalUrl);
                  console.log("Cloudinary Fetch URL:", cloudinaryUrl);

                  onChange(cloudinaryUrl);
                  setUploadError(null);
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 active:scale-95 text-white text-xs font-extrabold rounded-lg transition-all shrink-0"
              >
                Apply
              </button>
            </div>

            {value && !currentIsVideo && (
              <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col items-center justify-center p-3 min-h-[150px] transition-all duration-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Url preview"
                  className="max-h-48 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setImageUrlInput("");
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 shadow-sm"
                  title="Clear image"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── OR divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          or add a video
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── Separate Video Link section ── */}
      <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-video text-slate-400 text-sm"></i>
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            Video Link
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="YouTube, Vimeo, Streamable, or .mp4 URL…"
            value={videoInput}
            onChange={(e) => {
              setVideoInput(e.target.value);
              setUploadError(null);
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleApplyVideo())
            }
            className={cn(
              "flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-150",
              uploadError && "border-red-500",
            )}
          />
          <button
            type="button"
            onClick={handleApplyVideo}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 active:scale-95 text-white text-xs font-extrabold rounded-lg transition-all shrink-0"
          >
            Apply
          </button>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          Supported:{" "}
          <span className="font-semibold text-slate-500">
            YouTube · Vimeo · Dailymotion · Streamable · .mp4 / .webm
          </span>
        </p>

        {/* Live preview when a video URL is active */}
        {currentIsVideo && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video w-full">
            {embedInfo ? (
              <iframe
                src={embedInfo.embedUrl}
                title="Video preview"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isDirect ? (
              <video
                src={value}
                controls
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <span className="text-xs text-red-500 font-medium mt-0.5">
          {error || uploadError}
        </span>
      )}
    </div>
  );
}
