import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MonacoEditor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { ArrowLeft, Check, Loader2, LogOut, Play, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:3000/api";
const AUTOSAVE_DELAY = 900;

const languageMap = {
  javascript: "javascript",
  python: "python",
  java: "java",
  "c++": "cpp",
};

loader.config({ monaco });

const readCachedFile = (codeId) => {
  try {
    const value = localStorage.getItem(`codesandbox_file_${codeId}`);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const normalizeFile = (file, codeId) => ({
  ...file,
  id: file?._id || file?.id || codeId,
  name: file?.filename || file?.name || "untitled",
  language: file?.language || "javascript",
  code: file?.content ?? file?.code ?? "",
});

export const Editor = () => {
  const { codeId } = useParams();
  const location = useLocation();
  const { user, logout, authFetch } = useAuth();
  const repo = location.state?.repo;
  const initialFile = useMemo(() => normalizeFile(location.state?.file || readCachedFile(codeId), codeId), [codeId, location.state?.file]);
  const [file, setFile] = useState(initialFile);
  const [content, setContent] = useState(initialFile.code);
  const [status, setStatus] = useState("Ready");
  const [isSaving, setIsSaving] = useState(false);
  const hasEdited = useRef(false);

  const editorLanguage = languageMap[file.language] || "plaintext";

  useEffect(() => {
    setFile(initialFile);
    setContent(initialFile.code);
  }, [initialFile]);

  useEffect(() => {
    localStorage.setItem(`codesandbox_file_${codeId}`, JSON.stringify({ ...file, content, code: content }));
  }, [codeId, content, file]);

  const saveContent = async (quiet = false) => {
    setIsSaving(true);
    setStatus("Saving...");

    try {
      const response = await authFetch(`${API_BASE_URL}/sandbox/autosave/${codeId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save file");
      }

      setFile(normalizeFile(data.code || { ...file, content }, codeId));
      setStatus("Saved");
      if (!quiet) toast.success("Saved");
    } catch (err) {
      setStatus("Save failed");
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!hasEdited.current) return undefined;

    const timer = window.setTimeout(() => {
      saveContent(true);
    }, AUTOSAVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [content]);

  const handleCodeChange = (value = "") => {
    hasEdited.current = true;
    setContent(value);
    setStatus("Unsaved changes");
  };

  const handleEditorMount = (editor, monaco) => {
    monaco.editor.defineTheme("readable-command", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "ffffff", background: "000000" },
        { token: "comment", foreground: "8b949e" },
        { token: "keyword", foreground: "67e8f9" },
        { token: "string", foreground: "86efac" },
        { token: "number", foreground: "fcd34d" },
        { token: "type", foreground: "c4b5fd" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#ffffff",
        "editorLineNumber.foreground": "#666666",
        "editorLineNumber.activeForeground": "#ffffff",
        "editorCursor.foreground": "#67e8f9",
        "editor.selectionBackground": "#333333",
        "editor.inactiveSelectionBackground": "#222222",
        "editor.lineHighlightBackground": "#111111",
        "editorGutter.background": "#000000",
        "scrollbarSlider.background": "#33333380",
        "scrollbarSlider.hoverBackground": "#44444490",
      },
    });

    monaco.editor.setTheme("readable-command");
    editor.focus();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/15 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link
              to={repo?.id ? `/repo/${repo.id}` : "/home"}
              state={repo?.id ? { repo } : undefined}
              className="mb-1 inline-flex items-center gap-2 font-mono text-sm text-white/60 hover:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="font-mono text-xl font-bold tracking-normal">{file.name}</h1>
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

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-lg border border-white/15 bg-zinc-950">
          <div className="flex flex-col gap-3 border-b border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-sm">
              <p className="text-white">Language: <span className="text-cyan-300">{file.language}</span></p>
              <p className="mt-1 text-white/50">Type your code below. It saves automatically.</p>
            </div>
            <button
              onClick={() => saveContent(false)}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 font-mono text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>

          <div className="min-h-[62vh] bg-black">
            <MonacoEditor
              height="62vh"
              language={editorLanguage}
              theme="readable-command"
              value={content}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              loading={
                <div className="flex h-[62vh] items-center justify-center bg-black font-mono text-white/60">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-cyan-300" />
                  Loading editor...
                </div>
              }
              options={{
                minimap: { enabled: false },
                fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
                fontSize: 16,
                lineHeight: 26,
                wordWrap: "on",
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                roundedSelection: false,
                renderLineHighlight: "line",
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                bracketPairColorization: { enabled: true },
                guides: { indentation: true },
              }}
            />
          </div>
        </section>

        <aside className="rounded-lg border border-white/15 bg-zinc-950 p-4">
          <h2 className="font-mono text-lg font-bold">Output</h2>
          <div className="mt-4 rounded-md border border-white/10 bg-black p-4 font-mono text-sm leading-7">
            <p className="text-white/60">Run button is only visual for now.</p>
            <p className="text-amber-300">You asked me not to connect the run API.</p>
            <p className="mt-4 inline-flex items-center gap-2 text-emerald-300">
              <Check className="h-4 w-4" />
              {status}
            </p>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/20 px-3 py-3 font-mono text-sm text-white hover:bg-white hover:text-black"
          >
            <Play className="h-4 w-4" />
            Run later
          </button>
        </aside>
      </main>
    </div>
  );
};
