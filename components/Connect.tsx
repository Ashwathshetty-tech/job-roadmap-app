"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Expert = {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise_tags: string[];
  linkedin_url: string;
};

export default function Connect() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sentFor, setSentFor] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("experts")
      .select("*")
      .then(({ data }) => {
        if (data) setExperts(data);
        setLoading(false);
      });
  }, []);

  const sendRequest = async (expertId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("session_requests").insert({
      expert_id: expertId,
      user_id: userData.user?.id,
      message,
    });
    if (!error) {
      setSentFor(expertId);
      setRequestingId(null);
      setMessage("");
    }
  };

  if (loading) return <p className="text-textDim text-sm">Loading experts...</p>;

  if (experts.length === 0) {
    return (
      <div className="max-w-4xl">
        <h1 className="font-serif text-3xl font-medium text-text mb-2">Connect</h1>
        <p className="text-textDim text-sm mb-8 max-w-md">
          Real people who've been through this — reach out for a 1:1 conversation.
        </p>
        <div className="bg-surface border border-border rounded-md px-6 py-10 text-center">
          <div className="font-serif text-lg text-text mb-1.5">Coming soon</div>
          <p className="text-sm text-textDim max-w-sm mx-auto">
            We're lining up people who've navigated this exact situation to talk
            1:1 with. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl font-medium text-text mb-2">Connect</h1>
      <p className="text-textDim text-sm mb-8 max-w-md">
        Real people who've been through this — reach out for a 1:1 conversation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {experts.map((e) => (
          <div key={e.id} className="bg-surface border border-border rounded-md p-5">
            <div className="text-sm text-text font-medium">{e.name}</div>
            <div className="text-xs text-textDim mb-2">{e.title}</div>
            <p className="text-sm text-textDim mb-3">{e.bio}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {e.expertise_tags?.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-accentStrong bg-accent/10 border border-accent rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>

            {sentFor === e.id ? (
              <p className="text-accent text-xs">Request sent — they'll reach out soon.</p>
            ) : requestingId === e.id ? (
              <div>
                <textarea
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  placeholder="Briefly, what would you like to talk about?"
                  className="w-full bg-surface2 border border-border rounded px-3 py-2 text-text text-sm outline-none mb-2"
                  rows={3}
                />
                <button
                  onClick={() => sendRequest(e.id)}
                  className="bg-accent text-bg text-xs font-semibold rounded px-3 py-1.5 mr-2"
                >
                  Send request
                </button>
                <button onClick={() => setRequestingId(null)} className="text-xs text-textDim">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRequestingId(e.id)}
                className="text-xs text-accent underline"
              >
                Request a session
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
