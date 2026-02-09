"use client";

import { useEffect, useMemo, useState } from "react";

type Task = { id: string; text: string; done: boolean };

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  useEffect(() => {
    const raw = localStorage.getItem("fast_todo_tasks");
    if (raw) setTasks(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("fast_todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const shown = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter]);

  const activeCount = tasks.filter((t) => !t.done).length;

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [{ id: crypto.randomUUID(), text, done: false }, ...prev]);
    setInput("");
  }

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function edit(id: string, text: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl">
          <p className="text-xs uppercase tracking-wider text-indigo-300">Fast Todo</p>
          <h1 className="text-3xl font-semibold mt-1">Plan your day, fast</h1>
          <p className="text-slate-400 mt-1">Clean todo MVP with local persistence.</p>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <CardStat label="Total" value={String(tasks.length)} />
            <CardStat label="Active" value={String(activeCount)} />
            <CardStat label="Done" value={String(tasks.length - activeCount)} />
          </div>
        </header>

        <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a task and hit Enter"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-indigo-500"
            />
            <button onClick={addTask} className="rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500">Add</button>
          </div>

          <div className="flex gap-2 mt-3">
            {(["all", "active", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm border ${filter === f ? "bg-indigo-600 border-indigo-500" : "bg-slate-800 border-slate-700"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          {shown.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={toggle} onDelete={remove} onEdit={edit} />
          ))}
          {shown.length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-400">No tasks here yet.</div>}
        </section>
      </div>
    </main>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex items-center gap-3">
      <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} className="h-4 w-4" />
      {editing ? (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEdit(task.id, text.trim() || task.text);
              setEditing(false);
            }
          }}
          className="flex-1 rounded bg-slate-800 border border-slate-700 px-2 py-1"
          autoFocus
        />
      ) : (
        <p className={`flex-1 ${task.done ? "line-through text-slate-500" : ""}`}>{task.text}</p>
      )}
      <button
        onClick={() => {
          if (editing) onEdit(task.id, text.trim() || task.text);
          setEditing((v) => !v);
        }}
        className="text-sm rounded bg-slate-800 border border-slate-700 px-2 py-1"
      >
        {editing ? "Save" : "Edit"}
      </button>
      <button onClick={() => onDelete(task.id)} className="text-sm rounded bg-rose-900/60 border border-rose-700 px-2 py-1">Delete</button>
    </div>
  );
}
