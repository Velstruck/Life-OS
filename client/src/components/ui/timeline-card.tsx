import { useState } from 'react';
import { Trash2, Quote, Brain, Camera } from 'lucide-react';
import { Memory } from '../../types';
import { Lightbox } from './lightbox';

interface TimelineCardProps {
  memory: Memory;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const categoryConfig = {
  memory: { icon: Camera, label: 'Memory', color: 'text-blue-500' },
  thought: { icon: Brain, label: 'Thought', color: 'text-purple-500' },
  quote: { icon: Quote, label: 'Quote', color: 'text-amber-500' },
};

function ImageGrid({ images, onImageClick }: { images: string[]; onImageClick: (index: number) => void }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <button onClick={() => onImageClick(0)} className="w-full rounded-xl overflow-hidden">
        <img
          src={images[0]}
          alt=""
          className="w-full max-h-72 object-cover hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />
      </button>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden">
        {images.map((img, i) => (
          <button key={i} onClick={() => onImageClick(i)} className="overflow-hidden">
            <img
              src={img}
              alt=""
              className="w-full h-44 object-cover hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    );
  }

  // 3+ images: 2x2 grid, last cell shows +N overlay if > 4
  const visible = images.slice(0, 4);
  const overflow = images.length - 4;

  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden">
      {visible.map((img, i) => (
        <button
          key={i}
          onClick={() => onImageClick(i)}
          className="relative overflow-hidden"
        >
          <img
            src={img}
            alt=""
            className="w-full h-32 object-cover hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
          {/* +N overlay on 4th image */}
          {i === 3 && overflow > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xl font-bold">+{overflow}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function TimelineCard({ memory, onDelete, isDeleting }: TimelineCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { icon: CategoryIcon, label: categoryLabel, color: categoryColor } = categoryConfig[memory.category] || categoryConfig.memory;

  const formattedDate = new Date(memory.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(memory.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isOptimistic = memory.id.startsWith('temp-');

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* Timeline dot + line */}
      <div className="flex gap-4">
        {/* Timeline track */}
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
            memory.category === 'memory'
              ? 'bg-blue-500'
              : memory.category === 'thought'
              ? 'bg-purple-500'
              : 'bg-amber-500'
          } ${isOptimistic ? 'animate-pulse' : ''}`} />
          <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Card */}
        <div className={`flex-1 mb-6 card transition-all ${isOptimistic ? 'opacity-60' : ''}`}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CategoryIcon size={14} className={categoryColor} />
              <span className={`text-xs font-medium ${categoryColor}`}>{categoryLabel}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{formattedTime}</span>
            </div>

            {onDelete && !isOptimistic && (
              <div className="relative">
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-0.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onDelete(memory.id)}
                      disabled={isDeleting}
                      className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-0.5"
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          {memory.title && (
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{memory.title}</h3>
          )}

          {/* Content */}
          {memory.category === 'quote' ? (
            <blockquote className="border-l-2 border-amber-400 pl-3 italic text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {memory.content}
            </blockquote>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {memory.content}
            </p>
          )}

          {/* Images */}
          {memory.images.length > 0 && (
            <div className="mt-3">
              <ImageGrid images={memory.images} onImageClick={openLightbox} />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={memory.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
