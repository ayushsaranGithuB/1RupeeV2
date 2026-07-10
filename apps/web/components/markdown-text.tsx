import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

export function MarkdownText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-emerald-700"
            />
          ),
          ul: ({ ...props }) => (
            <ul {...props} className="mb-3 list-disc space-y-1 pl-5" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="mb-3 list-decimal space-y-1 pl-5" />
          ),
          p: ({ ...props }) => (
            <p {...props} className="text-sm mb-3 last:mb-0" />
          ),
          h1: ({ ...props }) => (
            <h1
              {...props}
              className="mb-3 text-2xl font-semibold text-slate-800"
            />
          ),
          h2: ({ ...props }) => (
            <h2
              {...props}
              className="mb-3 text-lg font-semibold text-slate-800"
            />
          ),
          strong: ({ ...props }) => (
            <strong {...props} className="font-semibold text-slate-800" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
