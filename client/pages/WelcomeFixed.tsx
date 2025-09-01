import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch, setToken, clearToken, getToken } from "@/lib/api";

type User = {
  id: string;
  email: string;
  name?: string | null;
  dateOfBirth?: string | null;
};

type Note = {
  id: string;
  content: string;
  createdAt: string;
};

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback token from /welcome?token=...
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      // clean URL
      window.history.replaceState({}, "", "/welcome");
    }
  }, [searchParams]);

  // Load current user and notes
  useEffect(() => {
    const run = async () => {
      try {
        const tok = getToken();
        if (!tok) {
          navigate("/signin");
          return;
        }
        const me = await apiFetch<{ ok: boolean; user: User }>("/me");
        setUser(me.user);
        const res = await apiFetch<{ ok: boolean; notes: Note[] }>("/notes");
        setNotes(res.notes);
      } catch (e: any) {
        const message = e?.message || "Failed to load data";
        setError(message);
        if (String(message).includes("401")) {
          navigate("/signin");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [navigate]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setError(null);
    try {
      const res = await apiFetch<{ ok: boolean; note: Note }>("/notes", {
        method: "POST",
        body: JSON.stringify({ content: newNote.trim() }),
      });
      setNotes((prev) => [res.note, ...prev]);
      setNewNote("");
    } catch (e: any) {
      setError(e?.message || "Failed to add note");
    }
  };

  const deleteNote = async (id: string) => {
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>(`/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to delete note");
    }
  };

  const logout = () => {
    clearToken();
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-hd-dark">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-hd-border">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-hd-blue" />
          <div className="font-semibold">Welcome</div>
        </div>
        <button onClick={logout} className="text-hd-blue underline">Logout</button>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* User info */}
        {user && (
          <div className="mb-6">
            <div className="text-2xl font-bold text-hd-dark">Hi, {user.name || user.email}</div>
            <div className="text-hd-text">{user.email}</div>
            {user.dateOfBirth && (
              <div className="text-hd-text">DOB: {user.dateOfBirth}</div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-600">{error}</div>
        )}

        {/* Add note */}
        <div className="flex gap-2 mb-4">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 rounded-[10px] border border-hd-border px-4 py-3 outline-none"
            placeholder="Write a new note..."
          />
          <button
            onClick={addNote}
            className="rounded-[10px] bg-hd-blue text-white px-4 py-3 font-semibold hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        {/* Notes list */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-hd-border p-4 flex items-start justify-between">
              <div>
                <div className="text-hd-dark whitespace-pre-wrap">{note.content}</div>
                <div className="text-xs text-hd-gray mt-1">{new Date(note.createdAt).toLocaleString()}</div>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-600 hover:underline ml-4"
              >
                Delete
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-hd-text">No notes yet. Add your first note!</div>
          )}
        </div>
      </div>
    </div>
  );
}
