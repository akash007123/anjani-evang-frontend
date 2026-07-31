import DOMPurify from 'dompurify';

export function stripHtml(s: string): string {
  if (!s) return '';
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

interface RichTextProps {
  html?: string;
  className?: string;
}

const DEFAULT_CLASSES =
  'prose prose-sm sm:prose-base max-w-none prose-headings:font-serif prose-headings:text-secondary ' +
  'prose-a:text-primary prose-a:no-underline hover:prose-a:underline ' +
  'prose-blockquote:border-l-primary prose-blockquote:bg-linen/40 prose-blockquote:rounded-r-xl ' +
  'prose-code:font-mono prose-img:rounded-xl prose-img:shadow-sm prose-figure:mx-0';

export default function RichText({ html, className }: RichTextProps) {
  const content = html || '';
  if (!content.trim()) return null;

  const classes = `${DEFAULT_CLASSES} ${className || ''}`.trim();
  const hasHtmlTags = /<\/?[a-zA-Z]/.test(content);

  if (!hasHtmlTags) {
    const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim());
    return (
      <div className={classes}>
        {paragraphs.length > 0
          ? paragraphs.map((para, idx) => <p key={idx}>{para}</p>)
          : content}
      </div>
    );
  }

  const sanitized = DOMPurify.sanitize(content);

  return <div className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
