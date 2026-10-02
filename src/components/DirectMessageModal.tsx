import React, { useState } from 'react';
import { X, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DirectMessageModal: React.FC = () => {
  const {
    isDirectMessageOpen,
    setIsDirectMessageOpen,
    messageTargetProducer,
    messageTargetCloth,
    messages,
    sendMessage,
    user,
    producers,
    formatPrice
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');

  if (!isDirectMessageOpen) return null;

  const currentProducer = messageTargetProducer || producers[0];

  // Filter messages between current user and this producer
  const activeThread = messages.filter(
    m =>
      (m.receiverId === currentProducer.id && (m.senderId === user?.id || m.senderId === 'buyer-demo-1')) ||
      (m.senderId === currentProducer.id && (m.receiverId === user?.id || m.receiverId === 'buyer-demo-1'))
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendMessage(
      currentProducer.id,
      currentProducer.name,
      inputMessage.trim(),
      messageTargetCloth?.id,
      messageTargetCloth?.title
    );
    setInputMessage('');
  };

  const quickPrompts = [
    'Can you weave this with gold and deep navy silk threads?',
    'What is the delivery timeline to Lagos or Abuja for a traditional wedding?',
    'I would love to commission a matching chief stole for this piece.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col h-[650px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentProducer.avatarUrl}
                alt={currentProducer.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-stone-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif-display text-lg font-bold text-stone-900 leading-none">
                  {currentProducer.name}
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                  Weaver
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Direct Loom Dialogue · {currentProducer.village}, Abia State
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDirectMessageOpen(false)}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attached Cloth Context Strip (if any) */}
        {messageTargetCloth && (
          <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <img
                src={messageTargetCloth.imageUrl}
                alt=""
                className="w-7 h-7 rounded object-cover border border-amber-300 shrink-0"
              />
              <div className="truncate">
                <span className="text-amber-900 font-semibold block truncate">
                  Regarding: {messageTargetCloth.title}
                </span>
                <span className="text-stone-500 text-[11px]">
                  {formatPrice(messageTargetCloth)} · {messageTargetCloth.motifName}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-amber-900 font-medium shrink-0 ml-2">
              Loom Reference Attached
            </span>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-100/50">
          
          {/* Trust Banner */}
          <div className="p-3 bg-white rounded-xl border border-stone-200/90 text-xs text-stone-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900">Direct Buyer-Seller Channel: </span>
              You are connected directly with the master weaver's workshop in Akwete. You can negotiate custom colorways, wedding deadlines, or request loom progress photos.
            </div>
          </div>

          {activeThread.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-stone-500">
                No previous messages with {currentProducer.name}. Send your first greeting or inquiry below!
              </p>
            </div>
          ) : (
            activeThread.map(msg => {
              const isMe = msg.senderRole === 'buyer';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1 px-1">
                    <span>{msg.senderName}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-amber-950 text-white rounded-tr-xs'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.clothTitle && (
                      <div className={`text-[11px] font-semibold pb-1 mb-1 border-b ${isMe ? 'border-amber-900/60 text-amber-200' : 'border-stone-100 text-stone-500'}`}>
                        Re: {msg.clothTitle}
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputMessage(prompt)}
              className="text-[11px] bg-white border border-stone-200 hover:border-amber-900 text-stone-700 hover:text-amber-950 px-2.5 py-1 rounded-md transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-stone-200 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={`Message ${currentProducer.name.split(' ')[0]} directly...`}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-900 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
