// ============================================================
// Akwete Luxe — useMessages Hook
// Supabase CRUD + Realtime subscriptions for the messages table
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MessageRow, MessageInsert } from '../lib/database.types';
import { Message, User } from '../types';
import { toast } from '../lib/toast';

function mapRowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    senderId: row.sender_id ?? '',
    senderName: row.sender_name,
    senderRole: row.sender_role ?? 'buyer',
    receiverId: row.receiver_id ?? '',
    receiverName: row.receiver_name,
    clothId: row.cloth_id ?? undefined,
    clothTitle: row.cloth_title ?? undefined,
    text: row.text,
    timestamp: new Date(row.created_at).toLocaleString('en-NG', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    read: row.read,
    actingOnBehalfOfProducerName: row.acting_on_behalf_of ?? undefined,
  };
}

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);

export function useMessages(user: User | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track Realtime subscription so we can clean up
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Fetch messages for current user ───────────────────────
  const fetchMessages = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[useMessages] fetch error:', error);
      setError(error.message);
    } else if (data) {
      setMessages((data as MessageRow[]).map(mapRowToMessage));
    }
    setLoading(false);
  }, [user]);

  // ── Realtime subscription (Phase 5) ───────────────────────
  const subscribeToMessages = useCallback(() => {
    if (!isSupabaseConfigured || !user) return;

    // Clean up old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = mapRowToMessage(payload.new as MessageRow);
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [user]);

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      fetchMessages();
      subscribeToMessages();
    } else {
      setMessages([]);
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchMessages, subscribeToMessages]);

  // ── Send message ───────────────────────────────────────────
  const sendMessage = useCallback(async (
    senderId: string,
    senderName: string,
    senderRole: 'buyer' | 'producer' | 'admin',
    receiverId: string,
    receiverName: string,
    text: string,
    clothId?: string,
    clothTitle?: string,
    actingOnBehalfOf?: string
  ) => {
    const localMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      receiverId,
      receiverName,
      clothId,
      clothTitle,
      text,
      timestamp: 'Just now',
      read: false,
      actingOnBehalfOfProducerName: actingOnBehalfOf,
    };

    // Optimistic update
    setMessages(prev => [...prev, localMsg]);

    if (!isSupabaseConfigured) return;

    const insert: MessageInsert = {
      sender_id: senderId || null,
      sender_name: senderName,
      sender_role: senderRole,
      receiver_id: receiverId || null,
      receiver_name: receiverName,
      cloth_id: clothId || null,
      cloth_title: clothTitle || null,
      text,
      read: false,
      acting_on_behalf_of: actingOnBehalfOf || null,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('[useMessages] insert error:', error);
      toast.error(`Message could not be sent. ${error.message}`);
      // Drop the un-persisted optimistic message
      setMessages(prev => prev.filter(m => m.id !== localMsg.id));
    } else if (data) {
      // Replace local optimistic message with real DB message (has real uuid)
      const realMsg = mapRowToMessage(data as MessageRow);
      setMessages(prev =>
        prev.map(m => (m.id === localMsg.id ? realMsg : m))
      );
    }
  }, []);

  // ── Mark message as read ───────────────────────────────────
  const markAsRead = useCallback(async (messageId: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, read: true } : m))
    );

    if (!isSupabaseConfigured) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
  }, []);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
  };
}
