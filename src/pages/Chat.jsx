import React, { useEffect, useRef, useState } from "react";
import { api, API_BASE, getToken } from "@/lib/api";
import { Send, Mic, MicOff, Volume2, VolumeX, Plus, MessageCircle, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  const boxRef = useRef(null);
  const recogRef = useRef(null);

  const loadSessions = async () => {
    const r = await api.get("/chat/sessions");
    setSessions(r.data);
    if (!sessionId && r.data.length) selectSession(r.data[0].id);
    else if (!r.data.length) newSession();
  };

  const newSession = async () => {
    const r = await api.post("/chat/session");
    await loadSessions();
    setSessionId(r.data.id);
    setMessages([]);
  };

  const selectSession = async (id) => {
    setSessionId(id);
    const r = await api.get(`/chat/${id}/messages`);
    setMessages(r.data);
  };

  const delSession = async (id) => {
    await api.delete(`/chat/${id}`);
    if (id === sessionId) { setSessionId(null); setMessages([]); }
    await loadSessions();
  };

  useEffect(() => { loadSessions(); }, []); // eslint-disable-line
  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [messages, streaming]);

  const speak = (text) => {
    if (!speakOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02; u.pitch = 1;
    window.speechSynthesis.speak(u);
  };

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input not supported in this browser");
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = "en-US"; r.interimResults = true; r.continuous = false;
    r.onresult = (e) => {
      const t = Array.from(e.results).map(x => x[0].transcript).join(" ");
      setInput(t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || streaming) return;
    setInput("");
    const userMsg = { role: "user", content: text, created_at: new Date().toISOString() };
    const assistantPlaceholder = { role: "assistant", content: "", created_at: new Date().toISOString(), _streaming: true };
    setMessages((m) => [...m, userMsg, assistantPlaceholder]);
    setStreaming(true);

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify({ session_id: sessionId, text }),
      });
      if (!res.ok || !res.body) throw new Error("Chat failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let full = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const events = acc.split("\n\n");
        acc = events.pop() || "";
        for (const chunk of events) {
          const line = chunk.replace(/^data:\s?/, "");
          if (!line) continue;
          if (line === "[DONE]") continue;
          full += line;
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last._streaming) last.content = full;
            return copy;
          });
        }
      }
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last) delete last._streaming;
        return copy;
      });
      speak(full);
      loadSessions();
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-5 h-[calc(100vh-6rem)]">
      {/* Session list */}
      <div className="lg:col-span-3 glass-strong rounded-3xl p-4 overflow-hidden flex flex-col">
        <button data-testid="chat-new-session" onClick={newSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.02] transition">
          <Plus className="w-4 h-4"/> New chat
        </button>
        <div className="mt-3 overflow-y-auto flex-1 space-y-1">
          {sessions.map((s) => (
            <div key={s.id} className={`group flex items-center gap-2 p-2 rounded-2xl cursor-pointer transition ${s.id === sessionId ? "bg-rose-100" : "hover:bg-white/70"}`}
              onClick={() => selectSession(s.id)} data-testid={`session-${s.id}`}>
              <MessageCircle className="w-4 h-4 text-slate-500 shrink-0"/>
              <div className="flex-1 truncate text-sm font-semibold text-slate-700">{s.title || "New chat"}</div>
              <button onClick={(e)=>{e.stopPropagation(); delSession(s.id);}} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white">
                <Trash2 className="w-3.5 h-3.5 text-slate-400"/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="lg:col-span-9 glass-strong rounded-3xl p-4 md:p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 grid place-items-center">
              <MessageCircle className="w-5 h-5 text-purple-700" strokeWidth={2.5}/>
            </div>
            <div>
              <div className="font-display text-2xl leading-none">CareAI</div>
              <div className="text-xs text-slate-500 mt-1">Warm, informed, always here.</div>
            </div>
          </div>
          <button data-testid="chat-toggle-speak" onClick={() => setSpeakOn(!speakOn)}
            className={`p-2 rounded-full ${speakOn ? "bg-rose-200 text-rose-800" : "bg-white/80 text-slate-500"}`}>
            {speakOn ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
          </button>
        </div>

        <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
          <span>This AI assistant provides informational guidance only and is not a substitute for professional medical diagnosis or treatment. Seek emergency medical care for urgent or life-threatening conditions.</span>
        </div>

        <div ref={boxRef} data-testid="chat-messages" className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && !streaming && (
            <div className="text-center text-slate-500 mt-10">
              <div className="font-display text-2xl text-slate-700">How can I help you feel better today?</div>
              <div className="text-sm mt-1">Try: "I have a mild headache and fatigue — what could it be?"</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 whitespace-pre-wrap text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-100 text-slate-900 rounded-3xl rounded-tr-md"
                  : "bg-white/90 border border-white text-slate-800 rounded-3xl rounded-tl-md shadow-sm"
              }`}>
                {m.content || (m._streaming && (
                  <div className="chat-typing flex items-center h-5"><span/><span/><span/></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={(e)=>{e.preventDefault(); send();}} className="mt-4 flex items-center gap-2">
          <button type="button" data-testid="chat-mic" onClick={toggleMic}
            className={`p-3 rounded-full ${listening ? "bg-rose-300 text-white" : "bg-white/80 text-slate-600"}`}>
            {listening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
          </button>
          <input data-testid="chat-input" value={input} onChange={(e)=>setInput(e.target.value)}
            placeholder="Ask about symptoms, medicines, wellness…"
            className="flex-1 px-5 py-3 rounded-full bg-white/90 border border-white outline-none focus:ring-4 focus:ring-rose-200 text-sm"/>
          <button data-testid="chat-send" disabled={streaming || !input.trim()} type="submit"
            className="p-3 rounded-full bg-rose-400 text-white disabled:opacity-50 hover:scale-105 transition">
            <Send className="w-4 h-4"/>
          </button>
        </form>
      </div>
    </div>
  );
}

