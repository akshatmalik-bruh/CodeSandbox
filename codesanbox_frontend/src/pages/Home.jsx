import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Loader2, LogOut, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CreateRepoModal } from "../components/CreateRepoModal";

const API_BASE_URL = "http://localhost:3000/api";

const normalizeRepo = (repo) => ({
  ...repo,
  id: repo._id || repo.id,
  name: repo.reponame || repo.name || "untitled",
});

export const Home = () => {
  const { user, logout, authFetch } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRepositories = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authFetch(`${API_BASE_URL}/repo`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load repositories");
      }

      setRepositories((data.repos || []).map(normalizeRepo));
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  const createRepository = async (reponame) => {
    setIsCreating(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/repo`, {
        method: "POST",
        body: JSON.stringify({ reponame }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create repository");
      }

      setRepositories((current) => [normalizeRepo(data.repo), ...current]);
      setIsModalOpen(false);
      toast.success("Repository created");
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
            <p className="font-mono text-xs text-emerald-300">CodeSandbox</p>
            <h1 className="font-mono text-xl font-bold tracking-normal text-white">Your Code Files</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right font-mono text-sm sm:block">
              <p className="text-white">{user?.username}</p>
              <p className="text-xs text-white/50">{user?.emailid}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 font-mono text-sm text-white transition hover:bg-white hover:text-black"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-sm text-white/60">Pick a folder to see its files.</p>
            <p className="mt-1 font-mono text-sm text-cyan-300">No fake system panels. Just your work.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadRepositories}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 font-mono text-sm text-white transition hover:bg-white hover:text-black"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-mono text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              <Plus className="h-4 w-4" />
              New Folder
            </button>
          </div>
        </div>

        <section className="rounded-lg border border-white/15 bg-zinc-950">
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center font-mono text-white/60">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-cyan-300" />
              Loading folders...
            </div>
          ) : error ? (
            <div className="p-5 font-mono text-red-300">{error}</div>
          ) : repositories.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-white/35" />
              <h2 className="mt-4 font-mono text-lg font-bold text-white">No folders yet</h2>
              <p className="mx-auto mt-2 max-w-md text-base leading-7 text-white/60">
                Create one folder, then add a file and write code in the editor.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-mono text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                <Plus className="h-4 w-4" />
                Create Folder
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {repositories.map((repo) => (
                <Link
                  key={repo.id}
                  to={`/repo/${repo.id}`}
                  state={{ repo }}
                  className="flex flex-col gap-2 p-4 transition hover:bg-white hover:text-black sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-base font-semibold">{repo.name}</p>
                    <p className="mt-1 font-mono text-xs opacity-60">Click to open files</p>
                  </div>
                  <span className="font-mono text-sm text-cyan-300">Open</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createRepository}
        isCreating={isCreating}
      />
    </div>
  );
};
