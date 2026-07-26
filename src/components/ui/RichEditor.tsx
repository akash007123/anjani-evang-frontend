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

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic, Underline, Strikethrough, Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { List, ListProperties, TodoList } from '@ckeditor/ckeditor5-list';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { Table, TableToolbar, TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { Image, ImageInsert, ImageUpload, ImageResize, ImageCaption, ImageStyle, ImageToolbar, ImageInsertViaUrl } from '@ckeditor/ckeditor5-image';
import { Font, FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { FileRepository } from '@ckeditor/ckeditor5-upload';

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
    plugins: [
      Essentials, Paragraph, Heading, Bold, Italic, Underline,
      List, ListProperties, TodoList, FileRepository, UploadAdapterPlugin,
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
    plugins: [
      Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough,
      Subscript, Superscript, RemoveFormat, List, ListProperties, TodoList,
      Alignment, BlockQuote, CodeBlock, HorizontalLine, Table, TableToolbar,
      TableProperties, TableCellProperties, Link, LinkImage, Image, ImageInsert,
      ImageUpload, ImageResize, ImageCaption, ImageStyle, ImageToolbar,
      ImageInsertViaUrl, Font, FontSize, FontFamily, FontColor, FontBackgroundColor,
      Highlight, Undo, Indent, IndentBlock, Autoformat, Clipboard, Enter, ShiftEnter,
      FileRepository, UploadAdapterPlugin
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
