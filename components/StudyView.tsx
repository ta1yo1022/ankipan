'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import AnswerSpan from './AnswerSpan';
import { parseAnswerSyntax, isAnswerSpan } from '@/lib/markdown';

interface StudyViewProps {
  content: string;
}

/**
 * Markdownコンテンツを表示するコンポーネント
 * {{...}} 記法と <span style="color: #E8740C"> の両方に対応
 */
export default function StudyView({ content }: StudyViewProps) {
  // Markdown解析結果をメモ化
  const processedContent = useMemo(() => {
    // {{...}} 記法を処理: {{text}} → <answer>text</answer> に変換
    return content.replace(/\{\{(.+?)\}\}/g, '<answer>$1</answer>');
  }, [content]);

  return (
    <div
      className="study-view"
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 32px 100px',
        backgroundColor: 'white',
        minHeight: '100vh',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: '"Noto Serif JP", serif',
        fontSize: '16px',
        lineHeight: '1.8',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
            // カスタムタグ <answer> を AnswerSpan に変換
            answer: ({ node, ...props }: any) => (
              <AnswerSpan>{props.children}</AnswerSpan>
            ),
            // HTML <span> タグを処理
            span: ({ node, style, ...props }: any) => {
              // node.properties.style から color を確認
              const styleStr = node?.properties?.style || '';

              if (isAnswerSpan(styleStr)) {
                // #E8740C を含む span は AnswerSpan に変換
                return <AnswerSpan>{props.children}</AnswerSpan>;
              }

              // 通常の span はそのまま表示
              return <span style={style} {...props} />;
            },
          // テキストノードで {{...}} を処理
          p: ({ node, ...props }: any) => {
            return <p style={{ marginBottom: '1em' }} {...props} />;
          },
          h1: ({ node, ...props }: any) => (
            <h1
              style={{
                fontSize: '2em',
                fontWeight: 'bold',
                marginTop: '1.5em',
                marginBottom: '0.75em',
                borderBottom: '2px solid #e60033',
                paddingBottom: '0.3em',
              }}
              {...props}
            />
          ),
          h2: ({ node, ...props }: any) => (
            <h2
              style={{
                fontSize: '1.5em',
                fontWeight: 'bold',
                marginTop: '1.2em',
                marginBottom: '0.6em',
                borderLeft: '4px solid #e60033',
                paddingLeft: '0.5em',
              }}
              {...props}
            />
          ),
          h3: ({ node, ...props }: any) => (
            <h3
              style={{
                fontSize: '1.25em',
                fontWeight: 'bold',
                marginTop: '1em',
                marginBottom: '0.5em',
              }}
              {...props}
            />
          ),
          table: ({ node, ...props }: any) => (
            <div style={{ overflowX: 'auto', marginBottom: '1.5em' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #ddd',
                }}
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }: any) => (
            <th
              style={{
                backgroundColor: '#f5f5f5',
                padding: '8px 12px',
                border: '1px solid #ddd',
                fontWeight: 'bold',
                textAlign: 'left',
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }: any) => (
            <td
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
              }}
              {...props}
            />
          ),
          ul: ({ node, ...props }: any) => (
            <ul style={{ paddingLeft: '1.5em', marginBottom: '1em' }} {...props} />
          ),
          ol: ({ node, ...props }: any) => (
            <ol style={{ paddingLeft: '1.5em', marginBottom: '1em' }} {...props} />
          ),
          li: ({ node, ...props }: any) => (
            <li style={{ marginBottom: '0.5em' }} {...props} />
          ),
        } as any}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
