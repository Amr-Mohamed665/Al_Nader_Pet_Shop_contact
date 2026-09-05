"use client";

import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/utils/cn";
import { isVideo, getEmbedInfo, isDirectVideo } from "@/utils/videoUtils";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  label?: string;
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
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [activeVideoTab, setActiveVideoTab] = useState<"upload" | "url">("upload");

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const [lastMediaType, setLastMediaType] = useState<"image" | "video" | "media">(() =>
    typeof value === "string" && isVideo(value) ? "video" : "image"
  );

  const [videoInput, setVideoInput] = useState(() =>
    typeof value === "string" && isVideo(value) ? value : ""
  );
  const [imageUrlInput, setImageUrlInput] = useState(() =>
    typeof value === "string" && !isVideo(value) ? getOriginalUrl(value) : ""
  );
  const [prevValue, setPrevValue] = useState(value);
  const [showCloudReminder, setShowCloudReminder] = useState(false);
  const [saveErrorMessages, setSaveErrorMessages] = useState<string[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleValueChange = (newUrl: string, type?: "image" | "video") => {
    if (type) {
      setLastMediaType(type);
    } else if (newUrl) {
      setLastMediaType(isVideo(newUrl) ? "video" : "image");
    }

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

    // Click the submit button to trigger form validation
    submitBtn.click();

    // After a short delay, scan form DOM for visible validation error messages
    setTimeout(() => {
      const form = submitBtn.closest('form') || document;
      const errorSelectors = [
        'p.text-red-500',
        'p.text-rose-500',
        'span.text-red-500',
        'span.text-rose-500',
        '[role="alert"]',
        '.field-error',
      ];
      const errorEls = form.querySelectorAll(errorSelectors.join(','));
      const messages: string[] = [];
      let firstErrorEl: HTMLElement | null = null;

      errorEls.forEach((el) => {
        // Skip elements inside the toast notification container itself
        if (el.closest('.fixed')) return;

        const raw = (el as HTMLElement).innerText || (el as HTMLElement).textContent || '';
        const cleanText = raw.replace(/[\s\u00A0\u200B]+/g, ' ').trim();
        if (cleanText.length > 0 && !messages.includes(cleanText)) {
          messages.push(cleanText);
          if (!firstErrorEl) {
            firstErrorEl = el as HTMLElement;
          }
        }
      });

      if (messages.length > 0) {
        setSaveErrorMessages(messages);
      }
    }, 350);
  };

  // When an error is showing, listen for any form changes and revert toast to reminder
  useEffect(() => {
    if (!saveErrorMessages || saveErrorMessages.length === 0) return;

    const revertToReminder = () => {
      setSaveErrorMessages(null);
    };

    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('input', revertToReminder);
    form.addEventListener('change', revertToReminder);

    return () => {
      form.removeEventListener('input', revertToReminder);
      form.removeEventListener('change', revertToReminder);
    };
  }, [saveErrorMessages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadVideoFile(file);
  };

  const uploadFile = async (file: File) => {
    const isImageType = file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!isImageType) {
      setUploadError("Only image files (PNG, JPG, JPEG, WEBP) are allowed.");
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

      handleValueChange(data.secure_url, "image");
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      setUploadError(err.message || "Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVideoFile = async (file: File) => {
    const isVideoType = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    if (!isVideoType) {
      setUploadError("Only video files (MP4, WEBM, MOV, MKV) are allowed.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("Video size must be less than 50MB.");
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
        { method: "POST", body: formData },
      );
      if (!response.ok)
        throw new Error("Failed to upload video to Cloudinary.");
      const data = await response.json();

      handleValueChange(data.secure_url, "video");
    } catch (err: any) {
      console.error("Cloudinary video upload error:", err);
      setUploadError(err.message || "Error uploading video. Please try again.");
    } finally {
      setIsUploadingVideo(false);
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

  const handleVideoDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVideo(true);
  };
  const handleVideoDragLeave = () => setIsDraggingVideo(false);
  const handleVideoDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadVideoFile(file);
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

    // If it's a direct video URL and not already on Cloudinary, route through Cloudinary fetch for CDN optimization
    if (isDirectVideo(trimmed) && !trimmed.includes("res.cloudinary.com")) {
      const cloudinaryVideoUrl = `https://res.cloudinary.com/${cloudName}/video/fetch/q_auto,f_auto/${encodeURIComponent(trimmed)}`;
      handleValueChange(cloudinaryVideoUrl, "video");
      return;
    }

    handleValueChange(trimmed, "video");
  };

  const tabClass = (tab: "upload" | "url") =>
    cn(
      "px-4 py-1.5 text-xs font-extrabold transition-all border-b-2 -mb-2 cursor-pointer uppercase tracking-wider",
      activeTab === tab
        ? "border-teal-500 text-teal-600"
        : "border-transparent text-slate-400 hover:text-slate-600",
    );

  const videoTabClass = (tab: "upload" | "url") =>
    cn(
      "px-4 py-1.5 text-xs font-extrabold transition-all border-b-2 -mb-2 cursor-pointer uppercase tracking-wider",
      activeVideoTab === tab
        ? "border-teal-500 text-teal-600"
        : "border-transparent text-slate-400 hover:text-slate-600",
    );

  const currentIsVideo = isVideo(value);
  const embedInfo = value ? getEmbedInfo(value) : null;
  const isDirect = value ? isDirectVideo(value) : false;

  // Sync inputs when `value` changes from an external source (e.g. parent reset).
  if (value !== prevValue) {
    setPrevValue(value);
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
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <span className="text-xs font-bold text-slate-700 tracking-wide">
          {label}
        </span>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.png,.jpg,.jpeg,.webp"
        className="hidden"
      />
      <input
        type="file"
        ref={videoFileInputRef}
        onChange={handleVideoFileChange}
        accept="video/*,.mp4,.webm,.mov,.mkv"
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

        {/* Tab 1: Upload Image */}
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

        {/* Tab 2: Image Link */}
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

                  if (externalUrl.includes("res.cloudinary.com")) {
                    handleValueChange(externalUrl, "image");
                    setUploadError(null);
                    return;
                  }

                  const cloudinaryUrl =
                    `https://res.cloudinary.com/${cloudName}/image/fetch/` +
                    `w_800,q_auto,f_auto/${encodeURIComponent(externalUrl)}`;

                  handleValueChange(cloudinaryUrl, "image");
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
                    handleValueChange("", "image");
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
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          or add a video
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── Video Uploader (2 tabs: Upload & Link) ── */}
      <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 shadow-sm space-y-4">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200/80 -mx-4 px-4 pb-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveVideoTab("upload")}
            className={videoTabClass("upload")}
          >
            <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i>
            Upload Video
          </button>
          <button
            type="button"
            onClick={() => setActiveVideoTab("url")}
            className={videoTabClass("url")}
          >
            <i className="fa-solid fa-link mr-1.5"></i>
            Video Link
          </button>
        </div>

        {/* Tab 1: Upload Video */}
        {activeVideoTab === "upload" && (
          <div>
            {value && currentIsVideo ? (
              <div
                onDragOver={handleVideoDragOver}
                onDragLeave={handleVideoDragLeave}
                onDrop={handleVideoDrop}
                onClick={() => videoFileInputRef.current?.click()}
                className={cn(
                  "relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-1 min-h-[180px] cursor-pointer transition-all duration-200 aspect-video w-full",
                  isDraggingVideo
                    ? "border-2 border-dashed border-teal-500 bg-teal-950/60"
                    : "hover:border-teal-400/80 hover:shadow-inner",
                )}
              >
                {embedInfo ? (
                  <iframe
                    src={embedInfo.embedUrl}
                    title="Video preview"
                    className="w-full h-full pointer-events-none"
                    frameBorder="0"
                  />
                ) : isDirect ? (
                  <video
                    src={value}
                    controls={false}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : null}

                {/* Clear button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleValueChange("", "video");
                    setVideoInput("");
                  }}
                  className="absolute top-3 right-3 z-20 p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg transition-colors border border-white/20 shadow-md backdrop-blur-sm"
                  title="Clear video"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>

                {isDraggingVideo && (
                  <div className="absolute inset-0 bg-teal-500/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-10">
                    <span className="bg-white/90 text-teal-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                      Drop to replace video
                    </span>
                  </div>
                )}

                {isUploadingVideo && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-10">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-200 font-medium">
                      Replacing video...
                    </span>
                  </div>
                )}

                {!isDraggingVideo && !isUploadingVideo && (
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white z-10">
                    <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                    <span className="text-[11px] font-bold tracking-wide">
                      Drag & drop or click to replace video
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleVideoDragOver}
                onDragLeave={handleVideoDragLeave}
                onDrop={handleVideoDrop}
                onClick={() => videoFileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 min-h-[150px]",
                  isDraggingVideo
                    ? "border-teal-500 bg-teal-50/50"
                    : "border-slate-300 hover:border-teal-500 bg-white hover:bg-slate-50",
                  error || uploadError ? "border-red-500 bg-red-50/30" : "",
                )}
              >
                {isUploadingVideo ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-medium">
                      Uploading video to Cloudinary...
                    </span>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-file-video text-3xl text-slate-400"></i>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700">
                        Drag & drop your video, or{" "}
                        <span className="text-teal-600">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Supports MP4, WEBM, MOV, MKV up to 50MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Video Link */}
        {activeVideoTab === "url" && (
          <div className="space-y-4">
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
                  (error || uploadError) && "border-red-500",
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
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video w-full">
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

                <button
                  type="button"
                  onClick={() => {
                    handleValueChange("", "video");
                    setVideoInput("");
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg transition-colors border border-white/20 shadow-md z-10"
                  title="Clear video"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <span className="text-xs text-red-500 font-medium mt-0.5">
          {error || uploadError}
        </span>
      )}

      {/* ── Unified Reminder / Error Toast (top-right) ── */}
      {(showCloudReminder || (saveErrorMessages && saveErrorMessages.length > 0)) && (
        <div className="fixed top-20 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto transition-all duration-300">
          <div className="bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600 rounded-2xl p-3 sm:p-3.5 text-white shadow-2xl shadow-sky-500/30 border border-white/20 backdrop-blur-xl flex items-center gap-2.5">
            <i className={cn("text-sm shrink-0", saveErrorMessages && saveErrorMessages.length > 0 ? "fa-solid fa-triangle-exclamation text-amber-300" : "fa-solid fa-bell text-white")} />

            <div className="flex-1 min-w-0">
              {saveErrorMessages && saveErrorMessages.length > 0 ? (
                <div className="space-y-1">
                  {saveErrorMessages.map((msg, idx) => (
                    <p key={idx} className="text-xs font-bold text-white leading-snug">
                      {msg}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-white leading-tight">
                  {lastMediaType === "video"
                    ? "Video updated! Remember to click button to save changes"
                    : lastMediaType === "image"
                    ? "Image updated! Remember to click button to save changes"
                    : "Remember to click button to save changes"}
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
              onClick={() => { setShowCloudReminder(false); setSaveErrorMessages(null); }}
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
