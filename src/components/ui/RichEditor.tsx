import { useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import 'ckeditor5/ckeditor5.css';

if (typeof window !== 'undefined' && !window.CKEDITOR_VERSION) {
  window.CKEDITOR_VERSION = '48.3.1';
}

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  simple?: boolean;
}

const BISECT_STEP = 0;

export default function RichEditor({ value, onChange, placeholder, minHeight, simple }: RichEditorProps) {

  const config: Record<string, any> = useMemo(() => {
    switch (BISECT_STEP) {
      case 0:
        return {
          plugins: [Essentials, Paragraph, Bold, Italic],
          toolbar: { items: ['bold', 'italic'] },
          placeholder: placeholder || 'Write something...',
          licenseKey: 'GPL',
        };
      default:
        return {
          plugins: [Essentials, Paragraph, Bold, Italic],
          toolbar: { items: ['bold', 'italic'] },
          placeholder: placeholder || 'Write something...',
          licenseKey: 'GPL',
        };
    }
  }, [placeholder]);

  return (
    <div className="rich-editor-wrapper" style={{ minHeight: minHeight || '200px' }}>
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        disableWatchdog
        onError={(error: any, details: any) => {
          console.error('CKEditor error:', error, details);
          console.error('CKEditor original error:', error.data?.originalError);
          console.error('CKEditor stack:', error.data?.originalError?.stack || error.stack);
        }}
        onChange={(event: any, editor: any) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
