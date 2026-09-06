"use client";

import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/utils/cn";
import { isVideo, isDirectVideo, getEmbedInfo } from "@/utils/videoUtils";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  label?: string;
  formErrorMessages?: string[];
  allowVideo?: boolean;
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "lslwlv9d";
const uploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pet-shop";

function getOriginalUrl(val: string): string {
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
}

export default function ImageUploader({
  value,
  onChange,
  error,
  label = "Product Media",
  formErrorMessages,
  allowVideo = true,
}: ImageUploaderProps) {
  // Image state
  const [activeImageTab, setActiveImageTab] = useState<"upload" | "url">("upload");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(() => (isVideo(value) ? "" : getOriginalUrl(value)));

  // Video state
  const [activeVideoTab, setActiveVideoTab] = useState<"upload" | "url">("upload");
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState(() => (isVideo(value) ? value : ""));

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCloudReminder, setShowCloudReminder] = useState(false);
  const [saveErrorMessages, setSaveErrorMessages] = useState<string[] | null>(null);

  useEffect(() => {
    if (formErrorMessages && formErrorMessages.length > 0) {
      setSaveErrorMessages(formErrorMessages);
    }
  }, [formErrorMessages]);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleValueChange = (newUrl: string) => {
    onChange(newUrl);
    if (newUrl) {
      setShowCloudReminder(true);
      setSaveErrorMessages(null);
    } else {
      setShowCloudReminder(false);
    }
  };

  const handleSaveNow = () => {
    setSaveErrorMessages(null);
    const submitBtn = document.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!submitBtn) return;

    submitBtn.click();

    setTimeout(() => {
      const form = submitBtn.closest("form") || document;
      const errorSelectors = [
        "p.text-red-500",
        "p.text-rose-500",
        "p.text-rose-600",
        "span.text-red-500",
        "span.text-rose-500",
        "span.text-rose-600",
        '[role="alert"]',
        ".field-error",
      ];
      const errorEls = form.querySelectorAll(errorSelectors.join(","));
      const messages: string[] = [];

      errorEls.forEach((el) => {
        if (el.closest(".fixed")) return;
        const raw = (el as HTMLElement).innerText || (el as HTMLElement).textContent || "";
        const cleanText = raw.replace(/[\s\u00A0\u200B]+/g, " ").trim();
        if (cleanText.length > 0 && !messages.includes(cleanText)) {
          messages.push(cleanText);
        }
      });

      if (messages.length > 0) {
        setSaveErrorMessages(messages);
      }
    }, 350);
  };

  // Image Upload Handler
  const uploadImageFile = async (file: File) => {
    const isImageFile = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
    if (!isImageFile) {
      const msg = "Only image files (PNG, JPG, JPEG, WEBP) are allowed here.";
      setUploadError(msg);
      setSaveErrorMessages([msg]);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      const msg = "Image size must be less than 10MB.";
      setUploadError(msg);
      setSaveErrorMessages([msg]);
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Failed to upload image to Cloudinary.");
      const data = await response.json();
      handleValueChange(data.secure_url);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      const msg = err.message || "Error uploading image. Please try again.";
      setUploadError(msg);
      setSaveErrorMessages([msg]);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Video Upload Handler
  const uploadVideoFile = async (file: File) => {
    const isVideoFile = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!isVideoFile) {
      const msg = "Only video files (MP4, WEBM, MOV) are allowed here.";
      setUploadError(msg);
      setSaveErrorMessages([msg]);
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      const msg = "Video size must be less than 100MB.";
      setUploadError(msg);
      setSaveErrorMessages([msg]);
      return;
    }

    setIsUploadingVideo(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Failed to upload video to Cloudinary.");
      const data = await response.json();
      handleValueChange(data.secure_url);
    } catch (err: any) {
      console.error("Cloudinary video upload error:", err);
      const msg = err.message || "Error uploading video. Please try again.";
      setUploadError(msg);
      setSaveErrorMessages([msg]);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const isCurrentValueVideo = isVideo(value);
  const isCurrentValueImage = !!value && !isCurrentValueVideo;

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadImageFile(file);
        }}
        className="hidden"
      />
      {allowVideo && (
        <input
          ref={videoFileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadVideoFile(file);
          }}
          className="hidden"
        />
      )}

      {/* Main Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {value && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {isCurrentValueVideo ? "🎥 Video Attached" : "🖼️ Image Attached"}
          </span>
        )}
      </div>

      {/* ────────────────── 1. IMAGE UPLOADER SECTION ────────────────── */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveImageTab("upload")}
            className={cn(
              "text-xs font-extrabold pb-1 border-b-2 transition-all cursor-pointer uppercase tracking-wider",
              activeImageTab === "upload"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <i className="fa-solid fa-cloud-arrow-up mr-1.5" />
            Upload Image File
          </button>
          <button
            type="button"
            onClick={() => setActiveImageTab("url")}
            className={cn(
              "text-xs font-extrabold pb-1 border-b-2 transition-all cursor-pointer uppercase tracking-wider",
              activeImageTab === "url"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <i className="fa-solid fa-link mr-1.5" />
            Image Link / URL
          </button>
        </div>

        {activeImageTab === "upload" ? (
          <div>
            {!isCurrentValueImage ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingImage(true);
                }}
                onDragLeave={() => setIsDraggingImage(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingImage(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) void uploadImageFile(file);
                }}
                onClick={() => imageFileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bg-white",
                  isDraggingImage
                    ? "border-purple-500 bg-purple-50/60"
                    : "border-slate-300 hover:border-purple-400"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                  {isUploadingImage ? (
                    <i className="fa-solid fa-spinner animate-spin" />
                  ) : (
                    <i className="fa-solid fa-image" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {isUploadingImage ? "Uploading image..." : "Click or Drag & Drop image file"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, JPEG, WEBP (up to 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group aspect-video sm:aspect-21/9 flex items-center justify-center">
                <img src={value} alt="Preview" className="w-full h-full object-cover max-h-52" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-extrabold rounded-xl shadow-md transition-all"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleValueChange("")}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste image URL (e.g. https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (imageUrlInput.trim()) {
                    handleValueChange(imageUrlInput.trim());
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all"
              >
                Apply Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── 2. VIDEO UPLOADER SECTION (if allowVideo) ────────────────── */}
      {allowVideo && (
        <>
          {/* OR Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 mx-4 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
              <i className="fa-solid fa-film text-purple-500"></i>
              or add a video
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveVideoTab("upload")}
                className={cn(
                  "text-xs font-extrabold pb-1 border-b-2 transition-all cursor-pointer uppercase tracking-wider",
                  activeVideoTab === "upload"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <i className="fa-solid fa-video mr-1.5" />
                Upload Video File
              </button>
              <button
                type="button"
                onClick={() => setActiveVideoTab("url")}
                className={cn(
                  "text-xs font-extrabold pb-1 border-b-2 transition-all cursor-pointer uppercase tracking-wider",
                  activeVideoTab === "url"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <i className="fa-solid fa-link mr-1.5" />
                Video Link / Embed
              </button>
            </div>

            {activeVideoTab === "upload" ? (
              <div>
                {!isCurrentValueVideo ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(true);
                    }}
                    onDragLeave={() => setIsDraggingVideo(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) void uploadVideoFile(file);
                    }}
                    onClick={() => videoFileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bg-white",
                      isDraggingVideo
                        ? "border-purple-500 bg-purple-50/60"
                        : "border-slate-300 hover:border-purple-400"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                      {isUploadingVideo ? (
                        <i className="fa-solid fa-spinner animate-spin" />
                      ) : (
                        <i className="fa-solid fa-film" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {isUploadingVideo ? "Uploading video..." : "Click or Drag & Drop video file"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">MP4, WEBM, MOV (up to 100MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group aspect-video sm:aspect-21/9 flex items-center justify-center">
                    {isDirectVideo(value) ? (
                      <video src={value} controls muted loop className="w-full h-full object-cover max-h-52" />
                    ) : getEmbedInfo(value) ? (
                      <iframe
                        src={getEmbedInfo(value)?.embedUrl}
                        className="w-full h-full aspect-video"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <video src={value} controls className="w-full h-full object-cover max-h-52" />
                    )}

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-extrabold rounded-xl shadow-md transition-all"
                      >
                        Change Video
                      </button>
                      <button
                        type="button"
                        onClick={() => handleValueChange("")}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste video link (YouTube, Vimeo, Streamable, MP4)..."
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (videoUrlInput.trim()) {
                        handleValueChange(videoUrlInput.trim());
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all"
                  >
                    Apply Video Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {(error || uploadError) && (
        <span className="text-xs text-rose-500 font-bold mt-0.5 block">
          ⚠️ {error || uploadError}
        </span>
      )}

      {/* ── Reminder / Error Toast (top-right) ── */}
      {(showCloudReminder || (saveErrorMessages && saveErrorMessages.length > 0)) && (
        <div className="fixed top-20 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto transition-all duration-300">
          <div className="bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600 rounded-2xl p-3 sm:p-3.5 text-white shadow-2xl shadow-sky-500/30 border border-white/20 backdrop-blur-xl flex items-center gap-2.5">
            <i
              className={cn(
                "text-sm shrink-0",
                saveErrorMessages && saveErrorMessages.length > 0
                  ? "fa-solid fa-triangle-exclamation text-amber-300"
                  : "fa-solid fa-bell text-white"
              )}
            />

            <div className="flex-1 min-w-0">
              {saveErrorMessages && saveErrorMessages.length > 0 ? (
                <ul className="space-y-1">
                  {saveErrorMessages.map((msg, idx) => (
                    <li key={idx} className="text-xs font-bold text-white leading-snug flex items-start gap-1.5">
                      <span className="text-amber-300 font-extrabold shrink-0">•</span>
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-bold text-white leading-tight">
                  Media updated! Remember to click button to save changes
                </p>
              )}
            </div>

            {(!saveErrorMessages || saveErrorMessages.length === 0) && (
              <button
                type="button"
                onClick={handleSaveNow}
                className="px-3 py-1.5 bg-white text-teal-800 hover:bg-sky-50 text-[11px] font-black rounded-xl shadow-md transition-all active:scale-95 shrink-0"
              >
                Save Now 💾
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowCloudReminder(false);
                setSaveErrorMessages(null);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-all shrink-0"
              title="Close"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
