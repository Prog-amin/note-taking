<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch, setToken, clearToken } from "../lib/api";
import { useToast } from "../hooks/use-toast";

// Types aligned with server models
type Note = { id: string; content: string; createdAt?: string };
type User = {
  id: string;
  email: string;
  name: string | null;
  dateOfBirth: string | null;
  createdAt?: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    
    if (token) {
      // Store access token; refresh token not used by client currently
      setToken(token);
      // Clear the URL parameters and stay on /welcome
      window.history.replaceState({}, document.title, '/welcome');
    }
  }, [searchParams]);

  // Load user data and notes
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Ensure we have a token
        const stored = localStorage.getItem('accessToken');
        if (!stored) {
          navigate('/signin');
          return;
        }

        // Fetch current user from API
        const me = await apiFetch<{ ok: boolean; user: User }>("/me");
        setUser(me.user);

        // Load notes
        const notesResponse = await apiFetch<{ ok: boolean; notes: Note[] }>("/notes");
        setNotes(notesResponse.notes);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast({
          title: "Loading Failed",
          description: "Failed to load your notes. Please try again.",
          variant: "destructive",
        });
        
        // If authentication failed, redirect to sign in
        if (error instanceof Error && (error.message.includes('401') || error.message.includes('expired') || error.message.includes('Unauthorized'))) {
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate, toast]);

  const handleSignOut = () => {
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name?: string | null;
  dateOfBirth?: string | null;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function Welcome() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      const res = await apiFetch<{ ok: boolean; user: User }>("/me");
      setUser(res.user);
    } catch (e: any) {
      setError(e.message || "Failed to load user");
    }
  };

  const loadNotes = async () => {
    try {
      const res = await apiFetch<{ ok: boolean; notes: Note[] }>("/notes");
      setNotes(res.notes);
    } catch (e: any) {
      setError(e.message || "Failed to load notes");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadUser();
      await loadNotes();
      setLoading(false);
    })();
  }, []);

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
      setError(e.message || "Failed to add note");
    }
  };

  const deleteNote = async (id: string) => {
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>(`/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete note");
    }
  };

  const logout = () => {
>>>>>>> e9294f5022d25a32f4c9eefc5b69860131ce563f
    clearToken();
    navigate("/signin");
  };

<<<<<<< HEAD
  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const noteNumber = notes.length + 1;
      const content = `Note ${noteNumber}`;
      const response = await apiFetch<{ ok: boolean; note: Note }>("/notes", {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      setNotes([response.note, ...notes]);
      
      toast({
        title: "Note Created",
        description: "Your note has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Create Failed",
        description: error instanceof Error ? error.message : "Failed to create note.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await apiFetch<{ ok: boolean }>(`/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter(note => note.id !== id));
      
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hd-blue mx-auto mb-4"></div>
          <p className="font-inter text-lg text-hd-gray">Loading your dashboard...</p>
        </div>
      </div>
=======
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-hd-dark">Loading...</div>
>>>>>>> e9294f5022d25a32f4c9eefc5b69860131ce563f
    );
  }

  return (
    <div className="min-h-screen bg-white">
<<<<<<< HEAD
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Status Bar */}
        <div className="flex h-11 w-full items-center justify-between px-[30px] pr-[21.75px] gap-[220px]">
          <div className="font-inter text-base font-medium text-hd-dark">
            9:41
          </div>
          <div className="flex items-center gap-[5px]">
            {/* Signal strength bars */}
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
              <path d="M2 7.5C2.55228 7.5 3 7.94772 3 8.5V10.5C3 11.0523 2.55228 11.5 2 11.5H1C0.447715 11.5 0 11.0523 0 10.5V8.5C0 7.94772 0.447715 7.5 1 7.5H2ZM7 5.5C7.55228 5.5 8 5.94772 8 6.5V10.5C8 11.0523 7.55228 11.5 7 11.5H6C5.44772 11.5 5 11.0523 5 10.5V6.5C5 5.94772 5.44772 5.5 6 5.5H7ZM12 3.5C12.5523 3.5 13 3.92979 13 4.45996V10.54C13 11.0702 12.5523 11.5 12 11.5H11C10.4478 11.4999 10 11.0702 10 10.54V4.45996C10 3.92982 10.4478 3.50006 11 3.5H12ZM17 1.5C17.5523 1.5 18 1.91973 18 2.4375V10.5625C18 11.0803 17.5523 11.5 17 11.5H16C15.4477 11.5 15 11.0803 15 10.5625V2.4375C15 1.91973 15.4477 1.5 16 1.5H17Z" fill="#021433"/>
            </svg>
            {/* WiFi icon */}
            <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
              <path d="M10.4268 9.4179C11.7023 8.33902 13.5711 8.33902 14.8467 9.4179C14.9106 9.47591 14.9475 9.55815 14.9492 9.64446C14.9509 9.7308 14.9171 9.81444 14.8555 9.87493L12.8584 11.8906C12.7999 11.9497 12.7199 11.9823 12.6367 11.9824C12.5536 11.9824 12.4736 11.9496 12.415 11.8906L10.417 9.87493C10.3553 9.81428 10.3214 9.72999 10.3232 9.64349C10.3252 9.55727 10.3628 9.47578 10.4268 9.4179ZM7.7617 6.72845C10.5098 4.17237 14.7656 4.17237 17.5137 6.72845C17.5756 6.78832 17.6114 6.87081 17.6123 6.95696C17.6132 7.04315 17.5793 7.12625 17.5186 7.18743L16.3643 8.35442C16.2453 8.4735 16.0527 8.4761 15.9307 8.36028C15.0282 7.54312 13.8541 7.09072 12.6367 7.09075C11.42 7.09126 10.2466 7.54361 9.3447 8.36028C9.2227 8.47609 9.0301 8.4735 8.9111 8.35442L7.7568 7.18743C7.6961 7.12636 7.6623 7.0431 7.6631 6.95696C7.664 6.8708 7.6997 6.78831 7.7617 6.72845ZM5.0967 4.04681C9.3118 0.00763607 15.9618 0.00738418 20.1768 4.04681C20.2377 4.10675 20.2719 4.18889 20.2725 4.27434C20.273 4.35991 20.239 4.44214 20.1787 4.50286L19.0225 5.66985C18.9033 5.78933 18.7107 5.79058 18.5899 5.67278C16.9839 4.14605 14.8525 3.29498 12.6367 3.29485C10.4206 3.29485 8.2888 4.1459 6.6826 5.67278C6.5618 5.79077 6.3691 5.78955 6.25 5.66985L5.0938 4.50286C5.0335 4.44209 4.9994 4.35993 5 4.27434C5.0006 4.18884 5.0357 4.10673 5.0967 4.04681Z" fill="#021433"/>
            </svg>
            {/* Battery icon */}
            <svg width="25" height="13" viewBox="0 0 25 13" fill="none">
              <path opacity="0.2" d="M2.1393 0.5H21.8053C23.002 0.5 23.9723 1.47038 23.9723 2.66699V10.333C23.9723 11.5296 23.002 12.5 21.8053 12.5H2.1393C0.942734 12.5 -0.0276947 11.5296 -0.0276947 10.333V2.66699L-0.0168579 2.44531C0.0939087 1.35265 1.01742 0.5 2.1393 0.5Z" stroke="#021433"/>
              <path opacity="0.2" d="M25.1224 4V8C25.9271 7.66122 26.4504 6.87313 26.4504 6C26.4504 5.12687 25.9271 4.33878 25.1224 4Z" fill="#021433"/>
              <path d="M1.7723 3.66634C1.7723 2.92996 2.36925 2.33301 3.10563 2.33301H20.6389C21.3753 2.33301 21.9722 2.92996 21.9722 3.66634V9.32967C21.9722 10.0661 21.3753 10.663 20.6389 10.663H3.10563C2.36925 10.663 1.7723 10.0661 1.7723 9.32967V3.66634Z" fill="#021433"/>
            </svg>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4">
          {/* Header */}
          <div className="flex items-center justify-between pt-4 mb-[48px]">
            {/* Logo and Dashboard Title */}
            <div className="flex items-center">
              <div className="mr-3">
                <svg
                  width="33"
                  height="32"
                  viewBox="0 0 33 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M20.6424 0.843087L17.4853 0L14.8248 9.89565L12.4228 0.961791L9.26555 1.80488L11.8608 11.4573L5.3967 5.01518L3.08549 7.31854L10.1758 14.3848L1.34596 12.0269L0.5 15.1733L10.1477 17.7496C10.0372 17.2748 9.97877 16.7801 9.97877 16.2717C9.97877 12.6737 12.9055 9.75685 16.5159 9.75685C20.1262 9.75685 23.0529 12.6737 23.0529 16.2717C23.0529 16.7768 22.9952 17.2685 22.8861 17.7405L31.6541 20.0818L32.5 16.9354L22.814 14.3489L31.6444 11.9908L30.7984 8.84437L21.1128 11.4308L27.5768 4.98873L25.2656 2.68538L18.2737 9.65357L20.6424 0.843087Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M22.8776 17.7771C22.6069 18.9176 22.0354 19.9421 21.2513 20.763L27.6033 27.0935L29.9145 24.7901L22.8776 17.7771Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M21.1872 20.8292C20.3936 21.637 19.3907 22.2398 18.2661 22.5504L20.5775 31.1472L23.7346 30.3041L21.1872 20.8292Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M18.1482 22.5818C17.6264 22.7155 17.0795 22.7866 16.5159 22.7866C15.9121 22.7866 15.3274 22.705 14.7723 22.5522L12.4589 31.1569L15.616 31.9999L18.1482 22.5818Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M14.6607 22.5206C13.5532 22.1945 12.5682 21.584 11.7908 20.7739L5.42322 27.1199L7.73442 29.4233L14.6607 22.5206Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M11.7377 20.7178C10.9737 19.9026 10.4172 18.8917 10.1523 17.7688L1.35571 20.1178L2.20167 23.2642L11.7377 20.7178Z"
                    fill="#367AFF"
                  />
                </svg>
              </div>
              <h1 className="font-inter text-[20px] font-medium leading-[110%] tracking-[-0.8px] text-hd-dark">
                Dashboard
              </h1>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="font-inter text-[14px] font-semibold leading-[150%] text-hd-blue underline hover:text-blue-600 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Welcome Card */}
          <div className="mb-5 w-full h-[130px] flex items-center justify-center rounded-[10px] border border-hd-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.59)]">
            <div className="flex-1">
              <div className="font-inter text-[22px] font-bold leading-[250%] text-hd-dark">
                Welcome, {user?.name || 'Jonas Kahnwald'} !
              </div>
              <div className="font-inter text-base font-normal leading-[250%] text-hd-dark">
                Email: {user?.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1xxxx$3') : 'xxxxxx@xxxx.com'}
              </div>
            </div>
          </div>

          {/* Create Note Button */}
          <div className="mb-5">
            <button
              onClick={handleCreateNote}
              disabled={creating}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-hd-blue px-2 py-4 font-inter text-base font-semibold leading-[120%] tracking-[-0.16px] text-white transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Note"}
            </button>
          </div>

          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="mb-4 font-inter text-[20px] font-medium leading-[110%] tracking-[-0.8px] text-hd-dark">
              Notes
            </h3>
            
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-inter text-base text-hd-gray mb-4">
                  You don't have any notes yet.
                </p>
                <button
                  onClick={handleCreateNote}
                  disabled={creating}
                  className="font-inter text-hd-blue font-medium hover:underline disabled:opacity-50"
                >
                  Create your first note
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note, index) => (
                  <div
                    key={note.id}
                    className="flex items-center w-full h-[50px] rounded-[10px] border border-hd-border bg-white px-4 shadow-[0_2px_6px_rgba(0,0,0,0.59)]"
                  >
                    <div className="flex-1 font-inter text-base font-normal leading-[250%] text-hd-dark">
                      {note.content}
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex h-6 w-6 items-center justify-center text-[#050400] hover:text-red-600 transition-colors"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.30775 20.5C6.81058 20.5 6.385 20.323 6.031 19.969C5.677 19.615 5.5 19.1894 5.5 18.6922V5.99998H5.25C5.0375 5.99998 4.85942 5.92806 4.71575 5.78423C4.57192 5.6404 4.5 5.46223 4.5 5.24973C4.5 5.03706 4.57192 4.85898 4.71575 4.71548C4.85942 4.57181 5.0375 4.49998 5.25 4.49998H9C9 4.25515 9.08625 4.04648 9.25875 3.87398C9.43108 3.70165 9.63967 3.61548 9.8845 3.61548H14.1155C14.3603 3.61548 14.5689 3.70165 14.7413 3.87398C14.9138 4.04648 15 4.25515 15 4.49998H18.75C18.9625 4.49998 19.1406 4.5719 19.2843 4.71573C19.4281 4.85956 19.5 5.03773 19.5 5.25023C19.5 5.4629 19.4281 5.64098 19.2843 5.78448C19.1406 5.92815 18.9625 5.99998 18.75 5.99998H18.5V18.6922C18.5 19.1894 18.323 19.615 17.969 19.969C17.615 20.323 17.1894 20.5 16.6923 20.5H7.30775ZM17 5.99998H7V18.6922C7 18.7821 7.02883 18.8558 7.0865 18.9135C7.14417 18.9711 7.21792 19 7.30775 19H16.6923C16.7821 19 16.8558 18.9711 16.9135 18.9135C16.9712 18.8558 17 18.7821 17 18.6922V5.99998ZM10.1543 17C10.3668 17 10.5448 16.9281 10.6885 16.7845C10.832 16.6406 10.9037 16.4625 10.9037 16.25V8.74998C10.9037 8.53748 10.8318 8.35931 10.688 8.21548C10.5443 8.07181 10.3662 7.99998 10.1535 7.99998C9.941 7.99998 9.76292 8.07181 9.61925 8.21548C9.47575 8.35931 9.404 8.53748 9.404 8.74998V16.25C9.404 16.4625 9.47583 16.6406 9.6195 16.7845C9.76333 16.9281 9.94158 17 10.1543 17ZM13.8465 17C14.059 17 14.2371 16.9281 14.3807 16.7845C14.5243 16.6406 14.596 16.4625 14.596 16.25V8.74998C14.596 8.53748 14.5242 8.35931 14.3805 8.21548C14.2367 8.07181 14.0584 7.99998 13.8458 7.99998C13.6333 7.99998 13.4552 8.07181 13.3115 8.21548C13.168 8.35931 13.0962 8.53748 13.0962 8.74998V16.25C13.0962 16.4625 13.1682 16.6406 13.312 16.7845C13.4557 16.9281 13.6338 17 13.8465 17Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Home Indicator */}
          <div className="flex h-[34px] w-full items-center justify-center pb-2">
            <div className="h-[5px] w-[148px] rounded-full bg-[#111827]"></div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Column - Dashboard Content */}
        <div className="flex-1 max-w-md mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            {/* Logo and Dashboard Title */}
            <div className="flex items-center">
              <div className="mr-4">
                <svg
                  width="47"
                  height="46"
                  viewBox="0 0 33 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0 scale-[1.4]"
                >
                  <path
                    d="M20.6424 0.843087L17.4853 0L14.8248 9.89565L12.4228 0.961791L9.26555 1.80488L11.8608 11.4573L5.3967 5.01518L3.08549 7.31854L10.1758 14.3848L1.34596 12.0269L0.5 15.1733L10.1477 17.7496C10.0372 17.2748 9.97877 16.7801 9.97877 16.2717C9.97877 12.6737 12.9055 9.75685 16.5159 9.75685C20.1262 9.75685 23.0529 12.6737 23.0529 16.2717C23.0529 16.7768 22.9952 17.2685 22.8861 17.7405L31.6541 20.0818L32.5 16.9354L22.814 14.3489L31.6444 11.9908L30.7984 8.84437L21.1128 11.4308L27.5768 4.98873L25.2656 2.68538L18.2737 9.65357L20.6424 0.843087Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M22.8776 17.7771C22.6069 18.9176 22.0354 19.9421 21.2513 20.763L27.6033 27.0935L29.9145 24.7901L22.8776 17.7771Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M21.1872 20.8292C20.3936 21.637 19.3907 22.2398 18.2661 22.5504L20.5775 31.1472L23.7346 30.3041L21.1872 20.8292Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M18.1482 22.5818C17.6264 22.7155 17.0795 22.7866 16.5159 22.7866C15.9121 22.7866 15.3274 22.705 14.7723 22.5522L12.4589 31.1569L15.616 31.9999L18.1482 22.5818Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M14.6607 22.5206C13.5532 22.1945 12.5682 21.584 11.7908 20.7739L5.42322 27.1199L7.73442 29.4233L14.6607 22.5206Z"
                    fill="#367AFF"
                  />
                  <path
                    d="M11.7377 20.7178C10.9737 19.9026 10.4172 18.8917 10.1523 17.7688L1.35571 20.1178L2.20167 23.2642L11.7377 20.7178Z"
                    fill="#367AFF"
                  />
                </svg>
              </div>
              <h1 className="font-inter text-3xl font-medium leading-[110%] tracking-[-0.8px] text-hd-dark">
                Dashboard
              </h1>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="font-inter text-lg font-semibold leading-[150%] text-hd-blue underline hover:text-blue-600 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Welcome Card */}
          <div className="mb-8 w-full rounded-[15px] border border-hd-border bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <div className="flex-1">
              <div className="font-inter text-3xl font-bold leading-[250%] text-hd-dark mb-2">
                Welcome, {user?.name || 'Jonas Kahnwald'} !
              </div>
              <div className="font-inter text-lg font-normal leading-[250%] text-hd-dark">
                Email: {user?.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1xxxx$3') : 'xxxxxx@xxxx.com'}
              </div>
            </div>
          </div>

          {/* Create Note Button */}
          <div className="mb-8">
            <button
              onClick={handleCreateNote}
              disabled={creating}
              className="flex h-[64px] w-full items-center justify-center gap-2 rounded-[15px] bg-hd-blue px-4 py-4 font-inter text-lg font-semibold leading-[120%] tracking-[-0.16px] text-white transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Note"}
            </button>
          </div>

          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="mb-6 font-inter text-2xl font-medium leading-[110%] tracking-[-0.8px] text-hd-dark">
              Notes
            </h3>
            
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-inter text-lg text-hd-gray mb-6">
                  You don't have any notes yet.
                </p>
                <button
                  onClick={handleCreateNote}
                  disabled={creating}
                  className="font-inter text-lg text-hd-blue font-medium hover:underline disabled:opacity-50"
                >
                  Create your first note
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <div
                    key={note.id}
                    className="flex items-center w-full h-[64px] rounded-[15px] border border-hd-border bg-white px-6 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                  >
                    <div className="flex-1 font-inter text-lg font-normal leading-[250%] text-hd-dark">
                      {note.content}
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex h-8 w-8 items-center justify-center text-[#050400] hover:text-red-600 transition-colors"
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.30775 20.5C6.81058 20.5 6.385 20.323 6.031 19.969C5.677 19.615 5.5 19.1894 5.5 18.6922V5.99998H5.25C5.0375 5.99998 4.85942 5.92806 4.71575 5.78423C4.57192 5.6404 4.5 5.46223 4.5 5.24973C4.5 5.03706 4.57192 4.85898 4.71575 4.71548C4.85942 4.57181 5.0375 4.49998 5.25 4.49998H9C9 4.25515 9.08625 4.04648 9.25875 3.87398C9.43108 3.70165 9.63967 3.61548 9.8845 3.61548H14.1155C14.3603 3.61548 14.5689 3.70165 14.7413 3.87398C14.9138 4.04648 15 4.25515 15 4.49998H18.75C18.9625 4.49998 19.1406 4.5719 19.2843 4.71573C19.4281 4.85956 19.5 5.03773 19.5 5.25023C19.5 5.4629 19.4281 5.64098 19.2843 5.78448C19.1406 5.92815 18.9625 5.99998 18.75 5.99998H18.5V18.6922C18.5 19.1894 18.323 19.615 17.969 19.969C17.615 20.323 17.1894 20.5 16.6923 20.5H7.30775ZM17 5.99998H7V18.6922C7 18.7821 7.02883 18.8558 7.0865 18.9135C7.14417 18.9711 7.21792 19 7.30775 19H16.6923C16.7821 19 16.8558 18.9711 16.9135 18.9135C16.9712 18.8558 17 18.7821 17 18.6922V5.99998ZM10.1543 17C10.3668 17 10.5448 16.9281 10.6885 16.7845C10.832 16.6406 10.9037 16.4625 10.9037 16.25V8.74998C10.9037 8.53748 10.8318 8.35931 10.688 8.21548C10.5443 8.07181 10.3662 7.99998 10.1535 7.99998C9.941 7.99998 9.76292 8.07181 9.61925 8.21548C9.47575 8.35931 9.404 8.53748 9.404 8.74998V16.25C9.404 16.4625 9.47583 16.6406 9.6195 16.7845C9.76333 16.9281 9.94158 17 10.1543 17ZM13.8465 17C14.059 17 14.2371 16.9281 14.3807 16.7845C14.5243 16.6406 14.596 16.4625 14.596 16.25V8.74998C14.596 8.53748 14.5242 8.35931 14.3805 8.21548C14.2367 8.07181 14.0584 7.99998 13.8458 7.99998C13.6333 7.99998 13.4552 8.07181 13.3115 8.21548C13.168 8.35931 13.0962 8.53748 13.0962 8.74998V16.25C13.0962 16.4625 13.1682 16.6406 13.312 16.7845C13.4557 16.9281 13.6338 17 13.8465 17Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Feature showcase or additional content */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                width="80"
                height="80"
                viewBox="0 0 33 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto scale-[2.4] opacity-30"
              >
                <path
                  d="M20.6424 0.843087L17.4853 0L14.8248 9.89565L12.4228 0.961791L9.26555 1.80488L11.8608 11.4573L5.3967 5.01518L3.08549 7.31854L10.1758 14.3848L1.34596 12.0269L0.5 15.1733L10.1477 17.7496C10.0372 17.2748 9.97877 16.7801 9.97877 16.2717C9.97877 12.6737 12.9055 9.75685 16.5159 9.75685C20.1262 9.75685 23.0529 12.6737 23.0529 16.2717C23.0529 16.7768 22.9952 17.2685 22.8861 17.7405L31.6541 20.0818L32.5 16.9354L22.814 14.3489L31.6444 11.9908L30.7984 8.84437L21.1128 11.4308L27.5768 4.98873L25.2656 2.68538L18.2737 9.65357L20.6424 0.843087Z"
                  fill="#367AFF"
                />
                <path
                  d="M22.8776 17.7771C22.6069 18.9176 22.0354 19.9421 21.2513 20.763L27.6033 27.0935L29.9145 24.7901L22.8776 17.7771Z"
                  fill="#367AFF"
                />
                <path
                  d="M21.1872 20.8292C20.3936 21.637 19.3907 22.2398 18.2661 22.5504L20.5775 31.1472L23.7346 30.3041L21.1872 20.8292Z"
                  fill="#367AFF"
                />
                <path
                  d="M18.1482 22.5818C17.6264 22.7155 17.0795 22.7866 16.5159 22.7866C15.9121 22.7866 15.3274 22.705 14.7723 22.5522L12.4589 31.1569L15.616 31.9999L18.1482 22.5818Z"
                  fill="#367AFF"
                />
                <path
                  d="M14.6607 22.5206C13.5532 22.1945 12.5682 21.584 11.7908 20.7739L5.42322 27.1199L7.73442 29.4233L14.6607 22.5206Z"
                  fill="#367AFF"
                />
                <path
                  d="M11.7377 20.7178C10.9737 19.9026 10.4172 18.8917 10.1523 17.7688L1.35571 20.1178L2.20167 23.2642L11.7377 20.7178Z"
                  fill="#367AFF"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-600 mb-4">Welcome to Dashboard</h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Manage your notes efficiently with our intuitive interface. Create, organize, and delete notes with ease.
            </p>
          </div>
=======
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
>>>>>>> e9294f5022d25a32f4c9eefc5b69860131ce563f
        </div>
      </div>
    </div>
  );
}
