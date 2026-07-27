import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxTagLength?: number;
  disabled?: boolean;
}

function sanitizeTag(tag: string): string {
  const div = document.createElement('div');
  div.textContent = tag;
  return div.textContent || '';
}

function normalizeTag(tag: string): string {
  return sanitizeTag(tag).trim().replace(/\s+/g, ' ');
}

export default function TagInput({
  tags,
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags = 20,
  maxTagLength = 50,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag) return;
    if (tag.length > maxTagLength) return;
    if (tags.length >= maxTags) return;
    if (tags.some(t => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...tags, tag]);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Tab') {
      if (inputValue.trim()) {
        e.preventDefault();
        addTag(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1));
      setInputValue('');
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue('');
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-primary bg-white transition-colors min-h-[42px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg max-w-full"
        >
          <span className="truncate max-w-[150px]">{tag}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(index); }}
            className="text-primary hover:text-primary-hover shrink-0 cursor-pointer"
            disabled={disabled}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={disabled || tags.length >= maxTags}
        className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-700 placeholder:text-slate-400 py-0.5"
      />
      {tags.length >= maxTags && (
        <span className="text-[10px] text-amber-500 font-semibold whitespace-nowrap">Max {maxTags} tags</span>
      )}
    </div>
  );
}