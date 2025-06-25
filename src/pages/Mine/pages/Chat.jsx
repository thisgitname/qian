import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../pagescss.css/Chat.module.css';
import { io } from 'socket.io-client';

let socket;

// 简单 emoji 列表
const emojiList = ['😀','😂','😍','😢','😡','👍','🙏','🎉','🥰','😎','😭','😅','😉','😜','🤔','😏','😇','😱','😴','🤗'];

// 时间格式化函数
function formatTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

// 完整时间格式化
function formatFullTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

// 日期分组工具
function isSameDay(ts1, ts2) {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}
function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Chat() {
  const location = useLocation();
  const fromUserId = (JSON.parse(localStorage.getItem('token')))._id;
  const toUserId = location.state?.item._id;
  const navigate = useNavigate();
  const item = location.state?.item;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('token')) || {};

  useEffect(() => {
    socket = io('http://localhost:3000');
    socket.emit('login', fromUserId);

    // 请求历史消息
    socket.emit('get_history', { fromUserId, toUserId });

    // 接收历史消息
    const handleHistory = (history) => {
      setMessages(
        history.map(msg => ({
          from: msg.from === fromUserId ? 'me' : 'friend',
          content: msg.content,
          type: msg.type || 'text',
          timestamp: msg.timestamp
        }))
      );
    };
    socket.on('history', handleHistory);

    // 接收新消息
    const handlePrivateMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          from: data.fromUserId === fromUserId ? 'me' : 'friend',
          content: data.message,
          type: data.type || 'text',
          timestamp: data.timestamp || Date.now()
        },
      ]);
    };
    socket.on('private_message', handlePrivateMessage);

    return () => {
      socket.off('history', handleHistory);
      socket.off('private_message', handlePrivateMessage);
      socket.disconnect();
    };
  }, [fromUserId, toUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      socket.emit('private_message', {
        fromUserId,
        toUserId,
        message: input,
        type: 'text',
      });
      setMessages([...messages, { from: 'me', content: input, type: 'text', timestamp: Date.now() }]);
      setInput('');
    }
  };

  // 插入表情到输入框光标处
  const handleEmojiClick = (emoji) => {
    const inputElem = inputRef.current;
    if (!inputElem) return;
    const start = inputElem.selectionStart;
    const end = inputElem.selectionEnd;
    const newValue = input.slice(0, start) + emoji + input.slice(end);
    setInput(newValue);
    setShowEmoji(false);
    // 设置光标到表情后面
    setTimeout(() => {
      inputElem.focus();
      inputElem.selectionStart = inputElem.selectionEnd = start + emoji.length;
    }, 0);
  };

  if (!item) return <div className={styles.empty}>无会话对象</div>;

  return (
    <div className={styles.chatContainer}>
      {/* 顶部栏 */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="返回">
          ←
        </button>
        <div className={styles.friendInfo}>
          <div className={styles.avatar}>{item.name?.[0] || '?'}</div>
          <span className={styles.friendName}>{item.name}</span>
        </div>
      </div>
      {/* 消息区 */}
      <div className={styles.messagesArea}>
        {(() => {
          let lastTs = null;
          return messages.map((msg, idx) => {
            const showDate = !lastTs || !isSameDay(msg.timestamp, lastTs);
            const dateLabel = showDate ? formatDate(msg.timestamp) : null;
            lastTs = msg.timestamp;
            return (
              <React.Fragment key={idx}>
                {dateLabel && (
                  <div className={styles.dateDivider}>{dateLabel}</div>
                )}
                <div
                  className={
                    (msg.from === 'me' ? styles.messageRowMe : styles.messageRowFriend) + ' ' + styles.fadeIn
                  }
                  style={{ alignItems: 'flex-end' }}
                >
                  {/* 好友消息头像 */}
                  {msg.from === 'friend' && (
                    <div className={styles.avatarSmall}>
                      {item?.avatarUrl
                        ? <img src={item.avatarUrl} alt='' />
                        : (item?.name?.[0] || '?')}
                    </div>
                  )}
                  <div className={msg.from === 'me' ? styles.bubbleTimeColMe : styles.bubbleTimeColFriend}>
                    <div
                      className={styles.messageBubble}
                      data-fulltime={formatFullTime(msg.timestamp)}
                    >
                      {msg.content}
                    </div>
                    <div className={msg.from === 'me' ? styles.timeText : styles.timeTextLeft}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  {/* 自己消息头像 */}
                  {msg.from === 'me' && (
                    <div className={styles.avatarSmall}>
                      {user?.avatarUrl
                        ? <img src={user.avatarUrl} alt='' />
                        : (user?.name?.[0] || '我')}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          });
        })()}
        <div ref={messagesEndRef} />
      </div>
      {/* 输入区 */}
      <div className={styles.inputBar}>
        {/* 表情按钮 */}
        <button
          className={styles.emojiButton}
          type="button"
          onClick={() => setShowEmoji(v => !v)}
          aria-label="表情"
        >😀</button>
        {/* 表情面板 */}
        {showEmoji && (
          <div className={styles.emojiPanel}>
            {emojiList.map(emoji => (
              <span
                key={emoji}
                className={styles.emojiItem}
                onClick={() => handleEmojiClick(emoji)}
              >{emoji}</span>
            ))}
          </div>
        )}
        <textarea
          className={styles.input}
          placeholder="请输入消息..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          ref={inputRef}
          rows={1}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!input.trim()}
        >发送</button>
      </div>
    </div>
  );
}
