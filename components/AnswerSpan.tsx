'use client';

interface AnswerSpanProps {
  children: React.ReactNode;
}

/**
 * {{...}} または <span style="color: #E8740C"> で囲まれた解答部分を表示するコンポーネント
 */
export default function AnswerSpan({ children }: AnswerSpanProps) {
  return (
    <span className="answer">
      {children}
    </span>
  );
}
