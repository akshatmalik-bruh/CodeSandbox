import React, { useEffect, useState } from "react";
import { FilePlus2, Loader2, X } from "lucide-react";

const starterCode = {
  javascript: "console.log('Hello');\n",
  python: "print('Hello')\n",
};

export const CreateFileModal = ({ isOpen, onClose, onCreate, isCreating }) => {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setLanguage("javascript");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const filename = name.trim();

    if (!filename) {
      setError("Add a file name first.");
      return;
    }

    await onCreate({ name: filename, language, code: starterCode[language] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/20 bg-black p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-mono text-lg font-bold">New File</h2>
            <p className="mt-1 text-sm text-white/60">Choose a simple file name and language.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-white/60 hover:bg-white hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="font-mono text-sm text-white/70">File name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="main.js"
          autoFocus
          className="mt-2 w-full rounded-md border border-white/20 bg-zinc-950 px-3 py-3 font-mono text-base text-white outline-none focus:border-cyan-300"
        />

        <label className="mt-4 block font-mono text-sm text-white/70">Language</label>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="mt-2 w-full rounded-md border border-white/20 bg-zinc-950 px-3 py-3 font-mono text-base text-white outline-none focus:border-cyan-300"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        {error && <p className="mt-2 font-mono text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-white/20 px-3 py-2 font-mono text-sm text-white hover:bg-white hover:text-black">
            Cancel
          </button>
          <button disabled={isCreating} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-mono text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-60">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
            Create
          </button>
        </div>
      </form>
    </div>
  );
};
