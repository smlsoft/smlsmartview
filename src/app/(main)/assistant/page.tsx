"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  Maximize2,
  RotateCcw,
  Laptop,
  Tablet,
  Smartphone,
  Download,
  Database,
  Search,
  Terminal,
  CheckCircle2,
  Sparkles,
  FileCode,
  GripVertical,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";
import type {
  ChatStreamEvent,
  Message,
  ToolCall,
  ApprovalRequiredPayload,
  AskUserPayload,
} from "@/types/chat-stream";

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "ยินดีต้อนรับสู่ระบบผู้ช่วยพนักงานอัจฉริยะ (SML AI Chat) ที่จะช่วยค้นหาข้อมูลสินค้าในระบบ KMS RAG และตรวจสอบสต๊อกของคงเหลือล่าสุดจาก ERP Database ผ่านช่องทาง MCP Real-time DB ครับ",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeHtml, setActiveHtml] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [askDrafts, setAskDrafts] = useState<Record<string, string>>({});
  
  // Resizing state
  const [chatWidth, setChatWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(true);
  const chatWidthRef = useRef(450);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatWidthRef.current = chatWidth; }, [chatWidth]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = chatWidthRef.current;
    const maxContainerWidth = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const delta = mouseMoveEvent.clientX - startX;
      const newWidth = startWidth + delta;
      
      if (maxContainerWidth - newWidth < 150) {
        setIsCanvasOpen(false);
      } else {
        setIsCanvasOpen(true);
        setChatWidth(Math.max(300, newWidth));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSuggestion = (text: string) => {
    setInput(text);
    submitMessage(text);
  };

  type StreamState = {
    text: string;
    thinking: string;
    toolCalls: ToolCall[];
    approval?: ApprovalRequiredPayload;
    askUser?: AskUserPayload;
  };

  const applyStreamEvent = (state: StreamState, event: ChatStreamEvent): StreamState => {
    switch (event.type) {
      case "thinking":
        return {
          ...state,
          thinking: state.thinking ? `${state.thinking}\n\n${event.text}` : event.text,
        };
      case "text":
        return { ...state, text: state.text + event.text };
      case "tool_call":
        return {
          ...state,
          toolCalls: [
            ...state.toolCalls,
            {
              id: event.id,
              name: event.name,
              query: event.argsText || JSON.stringify(event.args),
              result: "",
              isError: false,
              status: "loading",
            },
          ],
        };
      case "tool_result": {
        let matched = false;
        const toolCalls = state.toolCalls.map((toolCall) => {
          if (toolCall.id !== event.id) {
            return toolCall;
          }
          matched = true;
          return {
            ...toolCall,
            result: event.result,
            isError: !event.ok,
            status: "done" as const,
          };
        });
        if (!matched) {
          toolCalls.push({
            id: event.id,
            name: event.name,
            query: "",
            result: event.result,
            isError: !event.ok,
            status: "done",
          });
        }
        return { ...state, toolCalls };
      }
      case "approval_required":
        return { ...state, approval: event.approval };
      case "ask_user":
        return { ...state, askUser: event.ask };
      case "html":
        setActiveHtml(event.html);
        return state;
      case "error":
        return {
          ...state,
          text: state.text ? `${state.text}\n${event.message}` : event.message,
        };
      case "done":
        return state;
      default:
        return state;
    }
  };

  const consumeChatStream = async (response: Response, assistantIndex: number) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("ReadableStream not supported");

    let buffer = "";
    let streamState: StreamState = { text: "", thinking: "", toolCalls: [] };

    const publish = () => {
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndex] = {
          role: "assistant",
          content: streamState.text,
          thinking: streamState.thinking,
          toolCalls: streamState.toolCalls,
          approval: streamState.approval,
          askUser: streamState.askUser,
        };
        return next;
      });
    };

    const processFrame = (frame: string) => {
      const dataLines = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart());
      if (dataLines.length === 0) {
        return;
      }

      try {
        const event = JSON.parse(dataLines.join("\n")) as ChatStreamEvent;
        streamState = applyStreamEvent(streamState, event);
        publish();
      } catch (err) {
        console.error("Invalid chat stream event", err);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          processFrame(frame);
          boundary = buffer.indexOf("\n\n");
        }
      }
      if (done) {
        buffer += decoder.decode();
        if (buffer.trim()) {
          processFrame(buffer);
        }
        break;
      }
    }
  };

  const submitMessage = async (overrideInput?: string) => {
    const textToSend = (overrideInput || input).trim();
    if (!textToSend || isLoading) return;

    setInput("");
    setIsLoading(true);

    const userMsg: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    const assistantIndex = updatedMessages.length;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/aichat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.filter((m) => m.role !== "system"),
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      await consumeChatStream(response, assistantIndex);
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndex] = {
          role: "assistant",
          content: "เกิดข้อผิดพลาดในการติดต่อระบบ AI กรุณาลองใหม่อีกครั้งครับ",
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitApproval = async (approval: ApprovalRequiredPayload, action: "approve" | "cancel") => {
    if (isLoading) return;

    setIsLoading(true);
    const userMsg: Message = {
      role: "user",
      content: action === "approve" ? `ยืนยันการเรียก ${approval.tool}` : `ยกเลิกการเรียก ${approval.tool}`,
    };
    const updatedMessages = [...messages, userMsg];
    const assistantIndex = updatedMessages.length;
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/aichat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.filter((m) => m.role !== "system"),
          approval: {
            id: approval.id,
            action,
            call: {
              id: approval.id,
              name: approval.tool,
              args: approval.args,
            },
          },
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      await consumeChatStream(response, assistantIndex);
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndex] = {
          role: "assistant",
          content: "เกิดข้อผิดพลาดในการส่งผลการยืนยัน กรุณาลองใหม่อีกครั้งครับ",
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitAskAnswer = async (askUser: AskUserPayload, answer: string) => {
    const finalAnswer = answer.trim();
    if (!finalAnswer || isLoading) return;

    setIsLoading(true);
    const userMsg: Message = { role: "user", content: finalAnswer };
    const updatedMessages = [...messages, userMsg];
    const assistantIndex = updatedMessages.length;
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/aichat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.filter((m) => m.role !== "system"),
          askAnswer: {
            id: askUser.id,
            answer: finalAnswer,
            call: {
              id: askUser.id,
              name: "ask_user",
              args: {
                question: askUser.question,
                options: askUser.options,
              },
            },
          },
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      await consumeChatStream(response, assistantIndex);
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndex] = {
          role: "assistant",
          content: "เกิดข้อผิดพลาดในการส่งคำตอบเพิ่มเติม กรุณาลองใหม่อีกครั้งครับ",
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHtml = () => {
    if (!activeHtml) return;
    const blob = new Blob([activeHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-inventory-card.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatText = (txt: string) => {
    if (!txt) return "";
    return txt.split("\n").map((line, idx) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="bg-surface-muted text-accent px-1 py-0.5 rounded text-xs font-mono">$1</code>');

      if (line.startsWith("* ")) {
        return <li key={idx} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
      }
      return <p key={idx} className="mb-2 min-h-[1.2em]" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-surface rounded-2xl shadow-sm border border-border">
      {/* Header section */}
      <div className="flex-none p-4 md:px-6 md:py-5 border-b border-border bg-surface z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Bot className="h-6 w-6" />
              <h1 className="font-display text-[24px] leading-[32px] text-text-primary">ผู้ช่วย AI</h1>
            </div>
            <p className="mt-1 text-sm text-text-secondary">ระบบถามตอบค้นหาข้อมูลและแสดงผลเป็น Canvas</p>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative flex flex-col md:flex-row"
      >
        
        {/* Left Chat Panel */}
        <div 
          className={`flex flex-col h-full bg-surface flex-shrink-0 ${!isCanvasOpen ? 'w-full flex-1' : 'border-b md:border-b-0 md:border-r border-border'}`}
          style={isCanvasOpen ? { width: chatWidth } : undefined}
        >
          <div className="flex items-center justify-between p-3 border-b border-border bg-surface-muted h-[56px]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="font-medium text-sm text-text-primary">SML AI Chat - Staff</span>
            </div>
            {!isCanvasOpen && (
              <button 
                onClick={() => {
                  setIsCanvasOpen(true);
                  if (containerRef.current) {
                    setChatWidth(Math.floor(containerRef.current.offsetWidth / 2));
                  }
                }}
                className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                title="เปิดหน้าต่าง Canvas"
              >
                <PanelRightOpen size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((m, i) => {
              if (m.role === "system") {
                return (
                  <div key={i} className="flex gap-2 p-3 rounded-lg text-xs bg-bg border border-border text-text-secondary">
                    <Database size={14} className="shrink-0 text-accent mt-[1px]" />
                    <div>{m.content}</div>
                  </div>
                );
              }

              const isUser = m.role === "user";

              return (
                <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-1 max-w-[90%] ${isUser ? "self-end" : "self-start"}`}>
                  <span className="text-[10px] text-text-tertiary px-1">
                    {isUser ? "พนักงาน" : "ผู้ช่วย AI"}
                  </span>

                  {isUser ? (
                    <div className="px-4 py-2 rounded-2xl rounded-tr-sm bg-accent text-white text-sm whitespace-pre-wrap shadow-sm">
                      {m.content}
                    </div>
                  ) : (
                    <div className="flex flex-col w-full gap-3">
                      {m.thinking && (
                        <div className="border border-border bg-bg rounded-lg p-3">
                          <span className="text-xs font-medium text-text-secondary mb-2 block">AI Thinking Process</span>
                          <div className="text-xs text-text-tertiary whitespace-pre-wrap font-mono">{m.thinking}</div>
                        </div>
                      )}

                      {m.toolCalls && m.toolCalls.map((tc, idx) => (
                        <div key={idx} className="border border-border bg-bg rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            {tc.name === "search_catalog" ? (
                              <Search size={12} className="text-accent" />
                            ) : (
                              <Terminal size={12} className="text-success" />
                            )}
                            <span className="text-xs font-medium text-text-primary">Tool Call: {tc.name}</span>
                            <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono ${tc.status === "done" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"}`}>
                              {tc.status === "done" ? "success" : "loading..."}
                            </span>
                          </div>
                          <div className="text-[10px] text-text-tertiary font-mono break-all mb-2">
                            args: {tc.query}
                          </div>
                          {tc.result && (
                            <div className="text-[10px] bg-surface-muted p-2 rounded border border-border text-text-secondary font-mono max-h-32 overflow-y-auto">
                              {tc.result}
                            </div>
                          )}
                        </div>
                      ))}

                      {m.approval && (
                        <div className="border border-warning/40 bg-warning/5 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Terminal size={12} className="text-warning" />
                            <span className="text-xs font-medium text-warning-strong">ต้องยืนยันก่อนทำรายการ</span>
                          </div>
                          <div className="text-[10px] text-text-tertiary font-mono break-all mb-3">
                            {m.approval.tool}({JSON.stringify(m.approval.args)})
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1.5 bg-success text-white hover:bg-success-hover transition-colors"
                              disabled={isLoading}
                              onClick={() => submitApproval(m.approval!, "approve")}
                            >
                              <CheckCircle2 size={14} />
                              ยืนยัน
                            </button>
                            <button
                              type="button"
                              className="text-xs px-3 py-1.5 rounded font-medium bg-surface border border-border text-text-secondary hover:bg-surface-muted transition-colors"
                              disabled={isLoading}
                              onClick={() => submitApproval(m.approval!, "cancel")}
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      )}

                      {m.askUser && (
                        <div className="border border-accent/40 bg-accent/5 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Terminal size={12} className="text-accent" />
                            <span className="text-xs font-medium text-accent">ต้องการข้อมูลเพิ่มเติม</span>
                          </div>
                          <div className="text-sm text-text-primary mb-3">
                            {m.askUser.question}
                          </div>
                          {m.askUser.options.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {m.askUser.options.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  className="text-xs px-3 py-1.5 rounded font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                                  disabled={isLoading}
                                  onClick={() => submitAskAnswer(m.askUser!, option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                          <form
                            className="flex gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              submitAskAnswer(m.askUser!, askDrafts[m.askUser!.id] || "");
                            }}
                          >
                            <input
                              className="flex-1 text-sm bg-surface border border-border rounded px-3 py-1.5 text-text-primary focus:outline-none focus:border-accent"
                              value={askDrafts[m.askUser.id] || ""}
                              onChange={(e) => setAskDrafts((prev) => ({ ...prev, [m.askUser!.id]: e.target.value }))}
                              placeholder="พิมพ์คำตอบเพิ่มเติม..."
                              disabled={isLoading}
                            />
                            <button
                              type="submit"
                              className="bg-accent text-white px-3 py-1.5 rounded disabled:opacity-50"
                              disabled={isLoading || !(askDrafts[m.askUser.id] || "").trim()}
                            >
                              <Send size={14} />
                            </button>
                          </form>
                        </div>
                      )}

                      {m.content && (
                        <div className="px-4 py-2 rounded-2xl rounded-tl-sm bg-surface-muted border border-border text-sm text-text-primary shadow-sm">
                          {formatText(m.content)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
               <div className="flex flex-col items-start gap-1 max-w-[90%] self-start">
                  <span className="text-[10px] text-text-tertiary px-1">ผู้ช่วย AI กำลังวิเคราะห์...</span>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-muted border border-border text-sm shadow-sm flex items-center gap-2">
                     <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                     </span>
                     <span className="text-xs text-text-secondary">กำลังรวบรวมข้อมูลผ่าน KMS & MCP...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-surface">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMessage();
              }}
              className="flex gap-2"
            >
              <textarea
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none min-h-[44px] max-h-[120px]"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ถามข้อมูลสินค้า หรือ เช็คสต๊อกคงคลังเรียลไทม์..."
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitMessage();
                  }
                }}
              />
              <button
                type="submit"
                className="w-[44px] h-[44px] flex items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors flex-shrink-0"
                disabled={!input.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Resizer Handle (Hidden on Mobile) */}
        {isCanvasOpen && (
          <div 
            className="hidden md:flex flex-col items-center justify-center w-3 z-10 cursor-col-resize group select-none -ml-1.5"
            onMouseDown={startResizing}
          >
            <div className="w-1 h-12 bg-border group-hover:bg-accent rounded-full transition-colors flex items-center justify-center" />
          </div>
        )}

        {/* Right Canvas Panel */}
        {isCanvasOpen && (
          <div className="flex-1 flex flex-col h-full bg-surface-muted/30 overflow-hidden relative">
            <div className="flex items-center justify-between p-3 border-b border-border bg-surface h-[56px]">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsCanvasOpen(false)}
                  className="p-1 mr-1 text-text-tertiary hover:text-text-primary transition-colors"
                  title="ซ่อนหน้าต่าง Canvas"
                >
                  <PanelRightClose size={16} />
                </button>
                <FileCode className="h-4 w-4 text-accent" />
                <span className="font-medium text-sm text-text-primary">Interactive Sales Canvas</span>
                {activeHtml && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium animate-pulse bg-success/10 text-success ml-2">
                    Live rendering
                  </span>
                )}
              </div>
            
            <div className="flex items-center gap-2">
              {/* Viewport Toggles */}
              <div className="flex items-center border border-border rounded-md p-0.5 bg-bg">
                <button
                  className={`p-1 rounded ${viewport === "desktop" ? "bg-surface shadow-sm text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}
                  onClick={() => setViewport("desktop")}
                  title="Desktop View"
                >
                  <Laptop size={14} />
                </button>
                <button
                  className={`p-1 rounded ${viewport === "tablet" ? "bg-surface shadow-sm text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}
                  onClick={() => setViewport("tablet")}
                  title="Tablet View"
                >
                  <Tablet size={14} />
                </button>
                <button
                  className={`p-1 rounded ${viewport === "mobile" ? "bg-surface shadow-sm text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}
                  onClick={() => setViewport("mobile")}
                  title="Mobile View"
                >
                  <Smartphone size={14} />
                </button>
              </div>

              <button
                className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-50"
                onClick={() => setIframeKey((k) => k + 1)}
                disabled={!activeHtml}
                title="รีเฟรช Iframe"
              >
                <RotateCcw size={16} />
              </button>

              <button
                className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-50"
                onClick={handleDownloadHtml}
                disabled={!activeHtml}
                title="ดาวน์โหลดไฟล์ HTML"
              >
                <Download size={16} />
              </button>

              {activeHtml && (
                <button
                  className="p-1.5 text-danger hover:bg-danger/10 rounded ml-1 text-xs font-medium"
                  onClick={() => setActiveHtml(null)}
                  title="ล้างหน้าแคนวาส"
                >
                  ลบแคนวาส
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
            {activeHtml ? (
              <div 
                className={`h-full border border-border shadow-sm rounded-lg bg-white overflow-hidden transition-all duration-300 ${getViewportWidth()}`}
                style={{ pointerEvents: isResizing ? "none" : "auto" }}
              >
                <iframe
                  key={iframeKey}
                  srcDoc={activeHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-popups"
                  title="HTML Preview Canvas"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center max-w-md p-6">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-border shadow-sm">
                  <Maximize2 className="h-8 w-8 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">หน้าต่างพรีเซนต์ลูกค้า (Sales Canvas)</h3>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                  เมื่อบอตค้นหาข้อมูลสินค้าในระบบ KMS และดึงข้อมูลสต๊อกคงเหลือจริงสำเร็จ บอตจะสร้างเอกสาร HTML สำหรับนำเสนอสเปกและการขายให้แบบสด ๆ ตรงนี้ทันทีครับ
                </p>
                <div className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-mono">
                  ทดลองพิมพ์คุยกับบอตทางด้านซ้ายเพื่อทดสอบ
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
