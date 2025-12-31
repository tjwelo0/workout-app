"use client";

import { useEffect, useMemo, useState } from "react";

type Workout = {
  id: string;
  date: string;
  title: string;
  notes: string;
};

const STORAGE_KEY = "workout-food-tracker.workouts";

function formatDateForInput(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function WorkoutsPage() {
  const [date, setDate] = useState(() => formatDateForInput(new Date()));
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // 1) Load saved workouts once when the page opens
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Workout[];
      setWorkouts(parsed);
    } catch {
      // if anything goes wrong, just start empty
      setWorkouts([]);
    }
  }, []);

  // 2) Save workouts every time workouts changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  const isValid = useMemo(() => title.trim().length > 0, [title]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;

    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      date,
      title: title.trim(),
      notes: notes.trim(),
    };

    setWorkouts((prev) => [newWorkout, ...prev]);
    setTitle("");
    setNotes("");
  }

  function handleDelete(id: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Workouts</h1>
      <p className="mt-2 text-gray-600">
        Add workouts below. These are saved in your browser (they’ll still be
        here after refresh).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Workout name</label>
            <input
              placeholder="Push day, Legs, Run..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border px-3 py-2"
            />
            {!isValid && (
              <span className="text-sm text-red-600">
                Workout name is required.
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[90px] rounded-md border px-3 py-2"
            placeholder="PRs, how it felt, what to change next time..."
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="mt-4 rounded-md bg-black px-4 py-2 text-white disabled:opacity-40"
        >
          Add workout
        </button>
      </form>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Saved workouts</h2>

        {workouts.length === 0 ? (
          <p className="mt-2 text-gray-600">No workouts yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {workouts.map((w) => (
              <li key={w.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{w.date}</p>
                    <p className="text-lg font-semibold">{w.title}</p>
                    {w.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-gray-700">
                        {w.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
