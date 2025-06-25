import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaRobot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import styles from './AI.module.css';

const AIChat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '你好！我是AI学习助手，有什么可以帮你的吗？' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiMode, setApiMode] = useState('normal'); // 'normal' 或 'stream'
    const messagesEndRef = useRef(null);

    // 滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 处理普通API请求
    const handleNormalRequest = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:3000/deepseek/chat', {
                messages: [...messages, { role: 'user', content: inputText }]
            });

            setMessages(prev => [
                ...prev,
                { role: 'user', content: inputText },
                { role: 'assistant', content: response.data.reply }
            ]);

            setInputText('');
        } catch (error) {
            console.error('请求出错:', error);
            setMessages(prev => [
                ...prev,
                { role: 'user', content: inputText },
                { role: 'assistant', content: '抱歉，请求出错，请稍后再试。' }
            ]);
            setInputText('');
        } finally {
            setIsLoading(false);
        }
    };

    // 处理流式API请求
    const handleStreamRequest = async () => {
        setIsLoading(true);
        const userMessage = inputText;

        // 添加用户消息
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInputText('');

        // 添加一个空的AI消息作为占位符
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const eventSource = new EventSource(`http://127.0.0.1:3000/deepseek/stream?message=${encodeURIComponent(userMessage)}`);
            let aiResponse = '';

            eventSource.onmessage = (event) => {
                if (event.data === '[DONE]') {
                    eventSource.close();
                    setIsLoading(false);
                    return;
                }

                try {
                    const data = JSON.parse(event.data);
                    if (data.content) {
                        aiResponse += data.content;
                        // 更新最后一条消息（AI回复）
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = {
                                role: 'assistant',
                                content: aiResponse
                            };
                            return newMessages;
                        });
                    }
                } catch (e) {
                    console.error('解析错误:', e);
                }
            };

            eventSource.onerror = (error) => {
                // console.error('SSE错误:', error);
                eventSource.close();
                setIsLoading(false);
            };
        } catch (error) {
            console.error('请求错误:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: '抱歉，请求出错，请稍后再试。'
                };
                return newMessages;
            });
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        if (apiMode === 'normal') {
            handleNormalRequest();
        } else {
            handleStreamRequest();
        }
    };

    // 添加代码高亮处理函数
    const processCode = (code, language) => {
        if (language && hljs.getLanguage(language)) {
            try {
                return hljs.highlight(code, { language }).value;
            } catch (error) {
                console.error('代码高亮错误:', error);
            }
        }
        return code;
    };

    return (
        <div className={styles.aiChatContainer}>
            <div className={styles.chatHeader}>
                <h2>AI 学习助手</h2>
                <div className={styles.modeSelector}>
                    <button
                        className={apiMode === 'normal' ? styles.active : ''}
                        onClick={() => setApiMode('normal')}
                    >
                        普通模式
                    </button>
                    <button
                        className={apiMode === 'stream' ? styles.active : ''}
                        onClick={() => setApiMode('stream')}
                    >
                        流式模式
                    </button>
                </div>
            </div>

            <div className={styles.chatMessages}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.user : ''}`}>
                        <div className={styles.avatar}>
                            {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                        </div>
                        <div className={styles.content}>
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                    components={{
                                        code: ({ node, inline, className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <div className={styles.codeBlock}>
                                                    <div className={styles.codeHeader}>
                                                        <span>{match[1]}</span>
                                                    </div>
                                                    <pre className={styles.codeContent}>
                                                        <code
                                                            className={className}
                                                            {...props}
                                                            dangerouslySetInnerHTML={{
                                                                __html: processCode(String(children), match[1])
                                                            }}
                                                        />
                                                    </pre>
                                                </div>
                                            ) : (
                                                <code className={styles.inlineCode} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
                                        ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
                                        ol: ({ children }) => <ol className={styles.list}>{children}</ol>,
                                        li: ({ children }) => <li className={styles.listItem}>{children}</li>,
                                        h1: ({ children }) => <h1 className={styles.heading}>{children}</h1>,
                                        h2: ({ children }) => <h2 className={styles.heading}>{children}</h2>,
                                        h3: ({ children }) => <h3 className={styles.heading}>{children}</h3>,
                                        blockquote: ({ children }) => (
                                            <blockquote className={styles.blockquote}>{children}</blockquote>
                                        ),
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                {isLoading && apiMode === 'normal' && (
                    <div className={`${styles.message} ${styles.assistant}`}>
                        <div className={styles.avatar}>
                            <FaRobot />
                        </div>
                        <div className={styles.content}>
                            <div className={styles.loadingDots}>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.chatInput}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="输入消息..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={!inputText.trim() || isLoading}>
                    {/* <FiSend /> */}
                </button>
            </form>
        </div>
    );
};

export default AIChat;

