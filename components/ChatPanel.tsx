'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Minus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/lib/ai';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

/**
 * 展開可能なチャットパネル
 */
export default function ChatPanel({ messages, onSendMessage, isLoading }: ChatPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        right: '16px',
        bottom: isExpanded ? '16px' : '80px',
        width: isExpanded ? '400px' : '60px',
        height: isExpanded ? '500px' : '60px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* ヘッダー */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: isExpanded ? '16px' : '18px',
          backgroundColor: '#e60033',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          fontSize: isExpanded ? '16px' : '24px',
        }}
      >
        {isExpanded ? (
          <>
            <span>WithAI</span>
            <Minus size={20} />
          </>
        ) : (
          <MessageCircle size={28} />
        )}
      </div>

      {/* チャットエリア */}
      {isExpanded && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f9f9f9',
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#999',
                  padding: '40px 20px',
                  fontSize: '14px',
                }}
              >
                テキストを選択して「AIに質問」をクリックするか、
                <br />
                下のフォームから質問を入力してください
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: msg.role === 'user' ? '#e60033' : 'white',
                      color: msg.role === 'user' ? 'white' : '#333',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      wordWrap: 'break-word',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    className={msg.role === 'user' ? 'chat-message chat-message-user' : 'chat-message'}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#999',
                    fontSize: '14px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  考え中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div
            style={{
              padding: '12px',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: 'white',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading || !inputValue.trim() ? '#ccc' : '#e60033',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              送信
            </button>
          </div>
        </>
      )}
    </div>
  );
}
