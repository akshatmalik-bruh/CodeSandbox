import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MonacoEditor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { ArrowLeft, Check, Loader2, LogOut, Play, Save, AlertCircle, Terminal, Clock, Cpu } from "lucide-react";
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

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const pollIntervalRef = useRef(null);

  const editorLanguage = languageMap[file.language] || "plaintext";

  useEffect(() => {
    setFile(initialFile);
    setContent(initialFile.code);
  }, [initialFile]);

  useEffect(() => {
    localStorage.setItem(`codesandbox_file_${codeId}`, JSON.stringify({ ...file, content, code: content }));
  }, [codeId, content, file]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

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
      hasEdited.current = false;
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

  const pollExecutionStatus = (executionId) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/sandbox/execution/${executionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to poll execution status");
        }

        const execution = data.execution;
        setExecutionResult({
          status: execution.status,
          output: execution.output || "",
          error: execution.error || "",
          executionTime: execution.executionTime || 0,
        });

        if (execution.status === "completed" || execution.status === "failed") {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsRunning(false);
          if (execution.status === "completed") {
            toast.success("Execution completed!");
          } else {
            toast.error("Execution failed");
          }
        }
      } catch (err) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setIsRunning(false);
        setExecutionResult((prev) => ({
          status: "failed",
          output: prev?.output || "",
          error: err.message || "Error polling execution status",
          executionTime: prev?.executionTime || 0,
        }));
        toast.error(err.message || "Error checking execution status");
      }
    }, 1000);
  };

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setExecutionResult({
      status: "queued",
      output: "",
      error: "",
      executionTime: 0,
    });

    try {
      if (hasEdited.current || status === "Unsaved changes") {
        await saveContent(true);
      }

      const payload = {
        repoId: repo?.id || repo?._id || file?.repoId || "",
        codeId: codeId,
        language: file.language,
        codeSnapshot: content,
      };

      const response = await authFetch(`${API_BASE_URL}/sandbox/run`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate execution");
      }

      const executionId = data.exectuionId || data.executionId;
      if (!executionId) {
        throw new Error("No execution ID received from the server");
      }

      pollExecutionStatus(executionId);
    } catch (err) {
      setIsRunning(false);
      setExecutionResult({
        status: "failed",
        output: "",
        error: err.message || "Could not execute code",
        executionTime: 0,
      });
      toast.error(err.message || "Failed to start execution");
    }
  };

  // Compute status details
  const getStatusBadge = () => {
    if (!executionResult) return null;
    switch (executionResult.status) {
      case "queued":
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-medium text-amber-400 border border-amber-500/20 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Queued
          </span>
        );
      case "running":
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-xs font-medium text-cyan-400 border border-cyan-500/20">
            <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
            Running
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <Check className="h-3 w-3 text-emerald-400" />
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-rose-500/10 px-2 py-0.5 font-mono text-xs font-medium text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3 text-rose-400" />
            Failed
          </span>
        );
      default:
        return null;
    }
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

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-lg border border-white/15 bg-zinc-950">
          <div className="flex flex-col gap-3 border-b border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-sm">
              <p className="text-white">Language: <span className="text-cyan-300">{file.language}</span></p>
              <p className="mt-1 text-white/50">Type your code below. It saves automatically.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/40 mr-2">{status}</span>
              <button
                onClick={() => saveContent(false)}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-zinc-900 px-3 py-2 font-mono text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
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

        <aside className="flex flex-col gap-4 rounded-lg border border-white/15 bg-zinc-950 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h2 className="font-mono text-base font-bold">Terminal</h2>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex-1 min-h-[300px] flex flex-col">
            <div className="flex-1 rounded-md border border-white/10 bg-black p-4 font-mono text-sm leading-6 flex flex-col overflow-auto max-h-[420px]">
              {!executionResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-white/40">
                  <Terminal className="h-8 w-8 mb-2 text-white/20 stroke-[1.5]" />
                  <p className="text-xs">No execution active.</p>
                  <p className="text-[11px] mt-1 text-white/30">Click "Run Code" below to process on execution queue.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {executionResult.status === "queued" && (
                    <p className="text-amber-400/90 animate-pulse">
                      &gt; Job submitted. Waiting in the worker queue...
                    </p>
                  )}
                  {executionResult.status === "running" && (
                    <p className="text-cyan-400/90 animate-pulse">
                      &gt; Execution started. Running sandbox environment...
                    </p>
                  )}
                  {executionResult.output && (
                    <pre className="text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                      {executionResult.output}
                    </pre>
                  )}
                  {executionResult.error && (
                    <pre className="text-rose-400 whitespace-pre-wrap font-mono leading-relaxed bg-rose-500/5 p-2 rounded border border-rose-500/10">
                      {executionResult.error}
                    </pre>
                  )}
                  {executionResult.status === "completed" && !executionResult.output && (
                    <p className="text-emerald-500/70 italic">&gt; Process exited with code 0 (Empty output)</p>
                  )}
                </div>
              )}
            </div>

            {executionResult && (
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 font-mono text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time: {executionResult.executionTime ? `${executionResult.executionTime}ms` : "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  Status: {executionResult.status}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-mono text-sm font-semibold text-black hover:bg-cyan-300 disabled:bg-zinc-800 disabled:text-zinc-500 transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Run Code
              </>
            )}
          </button>
        </aside>
      </main>
    </div>
  );
};
