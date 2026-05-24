import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, FileCode2, FilePlus2, Loader2, LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CreateFileModal } from "../components/CreateFileModal";

const API_BASE_URL = "http://localhost:3000/api";

const normalizeFile = (file) => ({
  ...file,
  id: file._id || file.id,
  name: file.filename || file.name || "untitled",
  code: file.content ?? file.code ?? "",
});

const saveFileCache = (file) => {
  if (file?.id) {
    localStorage.setItem(`codesandbox_file_${file.id}`, JSON.stringify(file));
  }
};

export const RepoView = () => {
  const { repoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, authFetch } = useAuth();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const repo = useMemo(
    () => ({
      id: repoId,
      name: location.state?.repo?.name || location.state?.repo?.reponame || "folder",
    }),
    [location.state?.repo, repoId]
  );

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await authFetch(`${API_BASE_URL}/sandbox/files/${repoId}`);
      const data = await response.json().catch(() => ({}));

      if (response.status === 404) {
        setFiles([]);
        setMessage("The file list API is not created yet: GET /api/sandbox/files/:repoId");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not load files");
      }

      const nextFiles = (data.files || data.codes || data.data || []).map(normalizeFile);
      nextFiles.forEach(saveFileCache);
      setFiles(nextFiles);
    } catch (err) {
      setMessage(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, repoId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const createFile = async ({ name, language, code }) => {
    setIsCreating(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/sandbox/save`, {
        method: "POST",
        body: JSON.stringify({ repoId, name, language, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create file");
      }

      const file = normalizeFile(data.data || data.code || data);
      saveFileCache(file);
      setFiles((current) => [file, ...current]);
      setIsModalOpen(false);
      toast.success("File created");
      navigate(`/editor/${file.id}`, { state: { file, repo } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/15 bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link to="/home" className="mb-1 inline-flex items-center gap-2 font-mono text-sm text-white/60 hover:text-cyan-300">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <h1 className="font-mono text-xl font-bold tracking-normal">{repo.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden font-mono text-sm text-white/60 sm:block">{user?.username}</p>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 font-mono text-sm text-white hover:bg-white hover:text-black">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-sm text-white/60">Files in this folder.</p>
          <div className="flex gap-2">
            <button onClick={loadFiles} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 font-mono text-sm text-white hover:bg-white hover:text-black">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-mono text-sm font-semibold text-black hover:bg-emerald-300">
              <FilePlus2 className="h-4 w-4" />
              New File
            </button>
          </div>
        </div>

        <section className="rounded-lg border border-white/15 bg-zinc-950">
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center font-mono text-white/60">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-cyan-300" />
              Loading files...
            </div>
          ) : message ? (
            <div className="p-6">
              <p className="font-mono text-amber-300">{message}</p>
              <p className="mt-3 text-base leading-7 text-white/60">You can still create a new file because the save API already exists.</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-8 text-center">
              <FileCode2 className="mx-auto h-10 w-10 text-white/35" />
              <h2 className="mt-4 font-mono text-lg font-bold">No files yet</h2>
              <p className="mx-auto mt-2 max-w-md text-base leading-7 text-white/60">Create one file and the editor will open.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-mono text-sm font-semibold text-black hover:bg-emerald-300">
                <FilePlus2 className="h-4 w-4" />
                Create File
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {files.map((file) => (
                <Link
                  key={file.id}
                  to={`/editor/${file.id}`}
                  state={{ file, repo }}
                  onClick={() => saveFileCache(file)}
                  className="block p-4 transition hover:bg-white hover:text-black"
                >
                  <p className="font-mono text-base font-semibold">{file.name}</p>
                  <p className="mt-1 font-mono text-sm opacity-60">{file.language || "text file"}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateFileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={createFile} isCreating={isCreating} />
    </div>
  );
};
