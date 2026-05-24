import React, { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

export const CreateRepoModal = ({ isOpen, onClose, onCreate, isCreating }) => {
  const [reponame, setReponame] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReponame("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = reponame.trim().toLowerCase();

    if (name.length < 3) {
      setError("Use at least 3 characters.");
      return;
    }

    await onCreate(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/20 bg-black p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-mono text-lg font-bold">New Folder</h2>
            <p className="mt-1 text-sm text-white/60">This creates a repository in your backend.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-white/60 hover:bg-white hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="font-mono text-sm text-white/70">Folder name</label>
        <input
          value={reponame}
          onChange={(event) => setReponame(event.target.value)}
          placeholder="my-first-code"
          autoFocus
          className="mt-2 w-full rounded-md border border-white/20 bg-zinc-950 px-3 py-3 font-mono text-base text-white outline-none focus:border-cyan-300"
        />
        {error && <p className="mt-2 font-mono text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-white/20 px-3 py-2 font-mono text-sm text-white hover:bg-white hover:text-black">
            Cancel
          </button>
          <button disabled={isCreating} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-mono text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-60">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </button>
        </div>
      </form>
    </div>
  );
};
