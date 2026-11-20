import React, { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, User } from 'lucide-react';

interface PhotoPickerProps {
  label: string;
  currentUrl?: string | null;
  /** undefined = unchanged, null = removed, Blob = new photo */
  value: Blob | null | undefined;
  onChange: (v: Blob | null | undefined) => void;
  hint?: string;
}

/** Real photograph upload field with preview (stored in the institute's private storage on save). */
export const PhotoPicker: React.FC<PhotoPickerProps> = ({ label, currentUrl, value, onChange, hint }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (value instanceof Blob) {
      const u = URL.createObjectURL(value);
      setPreview(u);
      return () => URL.revokeObjectURL(u);
    }
    setPreview(value === null ? null : currentUrl || null);
    return undefined;
  }, [value, currentUrl]);

  return (
    <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-700 bg-[#0D121F] flex items-center justify-center overflow-hidden shrink-0">
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-slate-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-slate-200 font-semibold">{label}</div>
        <div className="text-[10px] text-slate-500">{error || hint || 'JPG, PNG or WebP, up to 10 MB'}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!f.type.startsWith('image/')) return setError('Please choose an image file');
              if (f.size > 10 * 1024 * 1024) return setError('Photo must be smaller than 10 MB');
              setError('');
              onChange(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1E273A] hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-[11px] font-medium"
          >
            <Upload className="w-3 h-3 text-blue-400" />
            <span>{preview ? 'Change Photo' : 'Upload Photo'}</span>
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = '';
                onChange(currentUrl ? null : undefined);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
