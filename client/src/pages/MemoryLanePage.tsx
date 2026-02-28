import { useState, useRef } from 'react';
import { Plus, Camera, Brain, Quote, X, ImagePlus, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMemories, useCreateMemory, useDeleteMemory } from '../hooks/useMemories';
import { TimelineCard } from '@/components/ui/timeline-card';
import { Memory } from '../types';

const categories: { value: Memory['category']; label: string; icon: typeof Camera }[] = [
  { value: 'memory', label: 'Memory', icon: Camera },
  { value: 'thought', label: 'Thought', icon: Brain },
  { value: 'quote', label: 'Quote', icon: Quote },
];

export default function MemoryLanePage() {
  const navigate = useNavigate();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMemories();
  const createMutation = useCreateMemory();
  const deleteMutation = useDeleteMemory();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Memory['category']>('memory');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const memories = data?.pages.flatMap((p) => p.memories) ?? [];

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('memory');
    setSelectedFiles([]);
    setPreviews([]);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Write something for your memory');
      return;
    }

    const formData = new FormData();
    formData.append('content', content.trim());
    if (title.trim()) formData.append('title', title.trim());
    formData.append('category', category);
    selectedFiles.forEach((f) => formData.append('images', f));

    try {
      await createMutation.mutateAsync(formData);
      toast.success('Memory saved ✨');
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save memory');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Memory deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-28 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">MemoryLane</h1>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">MemoryLane</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg transition-colors"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          {/* Category selector */}
          <div className="flex gap-2">
            {categories.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === value
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Title (optional) */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              category === 'quote'
                ? 'Write or paste a quote…'
                : category === 'thought'
                ? "What's on your mind?"
                : 'Describe your memory…'
            }
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />

          {/* Image previews */}
          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ImagePlus size={18} />
              <span className="text-xs">Add photos</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilePick}
            />

            <button
              type="submit"
              disabled={createMutation.isPending || !content.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {createMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Post
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {memories.length === 0 ? (
        <div className="text-center py-16">
          <Camera size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No memories yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tap + to capture your first memory</p>
        </div>
      ) : (
        <div className="pl-1">
          {memories.map((memory) => (
            <TimelineCard
              key={memory.id}
              memory={memory}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))}

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl transition-colors"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load older memories'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
