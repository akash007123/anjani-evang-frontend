import { useEffect, useMemo, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import 'ckeditor5/ckeditor5.css';

if (typeof window !== 'undefined' && !window.CKEDITOR_VERSION) {
  window.CKEDITOR_VERSION = '48.3.1';
}

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  CodeBlock,
  Link,
  List,
  ListProperties,
  TodoList,
  Alignment,
  BlockQuote,
  Highlight,
  HorizontalLine,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  SpecialCharacters,
  SpecialCharactersEssentials,
  RemoveFormat,
  Indent,
  IndentBlock,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageUpload,
  MediaEmbed,
  MediaEmbedToolbar,
  FileRepository,
  Plugin,
} from 'ckeditor5';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  simple?: boolean;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

class AnjaniUploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('file', file);
          const token =
            localStorage.getItem('eveng_admin_token') ||
            sessionStorage.getItem('eveng_token');
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers,
            body: formData,
          })
            .then((res) => res.json().catch(() => ({})))
            .then((json) => {
              if (json && json.data && json.data.url) {
                resolve({ default: json.data.url });
              } else {
                reject(new Error((json && json.message) || 'Upload failed'));
              }
            })
            .catch((err) => reject(err));
        })
    );
  }

  abort() {}
}

class AnjaniUploadAdapterPlugin extends Plugin {
  static get requires() {
    return [FileRepository];
  }

  init() {
    (this.editor as any).plugins
      .get(FileRepository)
      .createUploadAdapter = (loader: any) => new AnjaniUploadAdapter(loader);
  }
}

export default function RichEditor({
  value,
  onChange,
  placeholder,
  minHeight,
  simple,
}: RichEditorProps) {
  const editorRef = useRef<any>(null);

  const config: Record<string, any> = useMemo(() => {
    return {
      plugins: [
        Essentials,
        Paragraph,
        Heading,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        Code,
        CodeBlock,
        Link,
        List,
        ListProperties,
        TodoList,
        Alignment,
        BlockQuote,
        Highlight,
        HorizontalLine,
        Table,
        TableToolbar,
        TableProperties,
        TableCellProperties,
        SpecialCharacters,
        SpecialCharactersEssentials,
        RemoveFormat,
        Indent,
        IndentBlock,
        Image,
        ImageToolbar,
        ImageCaption,
        ImageStyle,
        ImageUpload,
        MediaEmbed,
        MediaEmbedToolbar,
        AnjaniUploadAdapterPlugin,
      ],
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'code',
          '|',
          'link',
          '|',
          'bulletedList',
          'numberedList',
          'todoList',
          '|',
          'indent',
          'outdent',
          '|',
          'blockQuote',
          'highlight',
          'horizontalLine',
          '|',
          'alignment',
          '|',
          'insertTable',
          '|',
          'codeBlock',
          'specialCharacters',
          '|',
          'imageUpload',
          'mediaEmbed',
          '|',
          'removeFormat',
        ],
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
          { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        ],
      },
      list: {
        properties: { styles: true, startIndex: true, reversed: true },
      },
      link: {
        decorators: {
          openInNewTab: {
            mode: 'manual',
            label: 'Open in a new tab',
            attributes: { target: '_blank', rel: 'noopener noreferrer' },
          },
        },
      },
      image: {
        toolbar: [
          'imageStyle:alignLeft',
          'imageStyle:full',
          'imageStyle:alignRight',
          '|',
          'imageTextAlternative',
        ],
        styles: ['alignLeft', 'full', 'alignRight'],
      },
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableProperties',
          'tableCellProperties',
        ],
      },
      mediaEmbed: {
        toolbar: ['mediaEmbed'],
      },
      placeholder: placeholder || 'Write something...',
      licenseKey: 'GPL',
    };
  }, [placeholder]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const current = editor.getData();
      if (current !== value) {
        editor.setData(value);
      }
    }
  }, [value]);

  return (
    <div className="rich-editor-wrapper" style={{ minHeight: minHeight || '200px' }}>
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        disableWatchdog
        onReady={(editor: any) => {
          editorRef.current = editor;
        }}
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
