import { useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import 'ckeditor5/ckeditor5.css';

// CKEditor 5 npm installations don't set window.CKEDITOR_VERSION automatically.
// Without it, @ckeditor/ckeditor5-integrations-common defaults to legacy behavior,
// causing elementConfigAttachment=false and isCKEditorFreeLicense('GPL')=false.
// Setting it explicitly enables the correct v48+ code path.
if (typeof window !== 'undefined' && !window.CKEDITOR_VERSION) {
  window.CKEDITOR_VERSION = '48.3.1';
}

import {
  ClassicEditor, Essentials, Paragraph, Heading,
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  RemoveFormat, List, ListProperties, TodoList,
  Alignment, BlockQuote, CodeBlock, HorizontalLine,
  Table, TableToolbar, TableProperties, TableCellProperties,
  Link, LinkImage, Image, ImageInsert, ImageUpload,
  ImageResize, ImageCaption, ImageStyle, ImageToolbar, ImageInsertViaUrl,
  Font, FontSize, FontFamily, FontColor, FontBackgroundColor,
  Highlight, Undo, Indent, IndentBlock, Autoformat,
  Clipboard, Enter, ShiftEnter, FileRepository, Plugin
} from 'ckeditor5';

const UPLOAD_URL = (import.meta as any).env?.VITE_API_URL || '/api';

class UploadAdapter {
  loader: any;
  constructor(loader: any) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then((file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${UPLOAD_URL}/upload/public`, { method: 'POST', body: formData })
        .then(r => r.json())
        .then(json => {
          const url = json.data?.url || json.url || '';
          if (!url) throw new Error('Upload failed');
          return { default: url };
        });
    });
  }
  abort() {}
}

class UploadAdapterPlugin extends Plugin {
  static get pluginName() { return 'UploadAdapterPlugin'; }
  init() {
    const repo = this.editor.plugins.get('FileRepository');
    if (repo) {
      repo.createUploadAdapter = (loader: any) => new UploadAdapter(loader);
    }
  }
}

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  simple?: boolean;
}

export default function RichEditor({ value, onChange, placeholder, minHeight, simple }: RichEditorProps) {

  const config: Record<string, any> = useMemo(() => simple ? {
    extraPlugins: [UploadAdapterPlugin],
    plugins: [
      Essentials, Paragraph, Heading, Bold, Italic, Underline,
      List, ListProperties, TodoList, FileRepository,
      BlockQuote, Link, Undo, Clipboard, Enter, ShiftEnter,
      Table, TableToolbar
    ],
    toolbar: {
      items: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'underline',
        '|', 'bulletedList', 'numberedList', 'todoList',
        '|', 'blockQuote', 'link', 'insertTable']
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', title: 'Heading 4', class: 'ck-heading_heading4' },
      ]
    },
    placeholder: placeholder || 'Write something...',
    shouldNotGroupWhenFull: false,
    licenseKey: 'GPL',
  } : {
    extraPlugins: [UploadAdapterPlugin],
    plugins: [
      Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough,
      Subscript, Superscript, RemoveFormat, List, ListProperties, TodoList,
      Alignment, BlockQuote, CodeBlock, HorizontalLine, Table, TableToolbar,
      TableProperties, TableCellProperties, Link, LinkImage, Image, ImageInsert,
      ImageUpload, ImageResize, ImageCaption, ImageStyle, ImageToolbar,
      ImageInsertViaUrl, Font, FontSize, FontFamily, FontColor, FontBackgroundColor,
      Highlight, Undo, Indent, IndentBlock, Autoformat, Clipboard, Enter, ShiftEnter,
      FileRepository
    ],
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'removeFormat',
        '|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight',
        '|', 'alignment',
        '|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
        '|', 'blockQuote', 'codeBlock', 'horizontalLine',
        '|', 'link', 'insertTable', 'imageInsert',
        '|', 'imageUpload',
      ]
    },
    image: {
      toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', 'linkImage', 'imageResize'],
      insert: { integrations: ['insertImageViaUrl', 'upload'] }
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
    },
    list: {
      properties: { styles: true, startIndex: true, reversed: true }
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', title: 'Heading 6', class: 'ck-heading_heading6' },
      ]
    },
    placeholder: placeholder || 'Write something...',
    shouldNotGroupWhenFull: false,
    licenseKey: 'GPL',
  }, [simple, placeholder]);

  return (
    <div className="rich-editor-wrapper" style={{ minHeight: minHeight || '200px' }}>
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        disableWatchdog
        onError={(error: any, details: any) => {
          console.error('CKEditor error:', error, details);
        }}
        onChange={(event: any, editor: any) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
