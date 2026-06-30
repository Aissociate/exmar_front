import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-4 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-slate-900 mt-5 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold text-slate-900 mt-3 mb-2">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="text-slate-700 leading-relaxed mb-3">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-slate-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-700">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="ml-4">
            {children}
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-700">
            {children}
          </em>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-slate-700 italic">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block p-3 bg-slate-900 text-slate-100 rounded-lg text-sm font-mono overflow-x-auto my-3">
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-slate-300 border border-slate-300">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-100">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-slate-200 bg-white">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr>
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm text-slate-700">
            {children}
          </td>
        ),
        hr: () => (
          <hr className="my-6 border-slate-300" />
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 hover:text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ''}
            className="max-w-full h-auto rounded-lg shadow-md my-4"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
