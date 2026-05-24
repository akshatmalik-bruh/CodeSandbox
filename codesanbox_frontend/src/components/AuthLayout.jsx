import React from "react";

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/15 bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-mono text-xs text-emerald-300">CodeSandbox</p>
            <h1 className="font-mono text-xl font-bold tracking-normal">Simple Code Runner</h1>
          </div>
          <p className="font-mono text-sm text-white/60">black_white_mode</p>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px]">
        <section>
          <p className="font-mono text-sm text-cyan-300">Start here</p>
          <h2 className="mt-3 font-mono text-4xl font-bold tracking-normal text-white sm:text-5xl">
            Write code, save files, keep it simple.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">
            A plain workspace for folders, files, and one editor page. No fake system panels, no noisy dashboard, just the basics.
          </p>
          <div className="mt-6 rounded-lg border border-white/15 bg-zinc-950 p-4 font-mono text-sm leading-7">
            <p><span className="text-emerald-300">&gt;</span> create folder</p>
            <p><span className="text-cyan-300">&gt;</span> create file</p>
            <p><span className="text-amber-300">&gt;</span> write code</p>
          </div>
        </section>

        <section className="rounded-lg border border-white/15 bg-zinc-950 p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="font-mono text-2xl font-bold tracking-normal text-white">{title}</h2>
            {subtitle && <p className="mt-2 text-base leading-7 text-white/60">{subtitle}</p>}
          </div>
          {children}
        </section>
      </main>
    </div>
  );
};
