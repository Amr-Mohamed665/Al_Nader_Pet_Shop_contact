'use client';

import { useState } from 'react';

interface PetVideo {
  id: number;
  title: string;
  url: string;
  category: string;
  description: string;
}

const PET_VIDEOS: PetVideo[] = [
  {
    id: 1,
    title: 'Playful Golden Retriever',
    url: 'https://videos.pexels.com/video-files/5091632/5091632-sd_640_360_25fps.mp4',
    category: 'Dogs',
    description: 'Golden retriever puppy playing outdoors in the grass.'
  },
  {
    id: 2,
    title: 'Adorable Kitten Playing',
    url: 'https://videos.pexels.com/video-files/3040808/3040808-sd_640_360_30fps.mp4',
    category: 'Cats',
    description: 'Playful tabby kitten scratching and rolling in the living room.'
  },
  {
    id: 3,
    title: 'Beautiful Colorful Birds',
    url: 'https://videos.pexels.com/video-files/2818547/2818547-sd_640_360_30fps.mp4',
    category: 'Birds',
    description: 'Colorful parakeets chirping and eating seeds on a perch.'
  }
];

export default function VideoShowcase() {
  const [activeVideo, setActiveVideo] = useState<PetVideo>(PET_VIDEOS[0]);

  return (
    <section className="mb-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Love in Motion: Pet Video Gallery
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Watch our happy pets in action and learn more about our healthy companions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Player */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md">
            <video
              key={activeVideo.id}
              src={activeVideo.url}
              controls
              autoPlay
              muted
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="inline-block bg-teal-50 text-teal-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-teal-100 uppercase tracking-wider mb-2">
              {activeVideo.category}
            </span>
            <h3 className="text-base font-bold text-slate-950">
              {activeVideo.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {activeVideo.description}
            </p>
          </div>
        </div>

        {/* Playlists */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Up Next
          </h4>
          <div className="flex flex-col gap-3">
            {PET_VIDEOS.map((video) => (
              <button
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className={`flex gap-3 p-2.5 rounded-xl border text-left transition-all duration-200 ${
                  activeVideo.id === video.id
                    ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                }`}
              >
                {/* Video thumbnail simulation */}
                <div className="relative h-16 w-24 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                  <video src={video.url} muted className="h-full w-full object-cover opacity-80 pointer-events-none" />
                  <span className="absolute text-lg drop-shadow-sm select-none">▶️</span>
                </div>
                
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mb-0.5">
                    {video.category}
                  </span>
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                    {video.title}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    Click to play clip
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
