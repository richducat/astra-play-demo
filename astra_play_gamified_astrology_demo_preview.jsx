import React, { useMemo, useState, useEffect } from "react";

// --- Lightweight UI helpers (no external deps) ---
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-lg border border-black/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur p-5 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const base = "px-4 py-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">{children}</span>
);

// --- Fake content seeds ---
const HOUSES = [
  "Arcanum",
  "Beacon",
  "Catalyst",
  "Dawn",
  "Ember",
  "Flux",
  "Glyph",
  "Harbor",
  "Ion",
  "Jade",
  "Kindred",
  "Lumina",
];

const DAILY_SCENARIOS = [
  {
    id: "work_pitch",
    title: "Your morning has a bold edge. Pitch now or prep more?",
    a: "Pitch now (ride momentum)",
    b: "Prep more (send tomorrow)",
    tip: "Mars-Mercury vibes favor decisive starts; keep it concise.",
  },
  {
    id: "date_text",
    title: "Thinking about texting someone new—go playful or direct?",
    a: "Playful opener",
    b: "Direct invite",
    tip: "Venus in a curious angle rewards warmth + clarity in two beats.",
  },
  {
    id: "fitness",
    title: "Energy window appears late afternoon—lift or long walk?",
    a: "Short, heavy lift",
    b: "45-min walk + stretch",
    tip: "Pick what you’ll celebrate finishing. Consistency > intensity.",
  },
];

// --- Utilities ---
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function AstraPlayDemo() {
  // Theme
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Session state
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(45); // out of 100
  const [house, setHouse] = useState(null);
  const [seasonDaysLeft] = useState(20);
  const [stars, setStars] = useState(12); // soft currency

  // Check-in state
  const [mood, setMood] = useState(null); // low/ok/high
  const [focus, setFocus] = useState(null);
  const [connection, setConnection] = useState(null);
  const checkinComplete = Boolean(mood && focus && connection);
  const [checkinAwarded, setCheckinAwarded] = useState(false);

  // Mini-game: Decision Duel
  const scenario = useMemo(() => DAILY_SCENARIOS[Math.floor(Math.random()*DAILY_SCENARIOS.length)], []);
  const [choice, setChoice] = useState(null);
  const [duelDone, setDuelDone] = useState(false);

  // Quests
  const [quests, setQuests] = useState([
    { id: 'q1', label: 'Complete daily check‑in', done: false, xp: 20 },
    { id: 'q2', label: 'Read your guidance brief', done: false, xp: 15 },
    { id: 'q3', label: 'Play 1 mini‑game', done: false, xp: 25 },
  ]);

  // Derived guidance stub
  const guidance = useMemo(() => {
    const tags = [];
    if (mood === 'high') tags.push('Ride confidence early.');
    if (mood === 'low') tags.push('Set a tiny win before noon.');
    if (focus === 'high') tags.push('Deep work block: 45–60 min.');
    if (connection === 'high') tags.push('Send a 2‑line check‑in to a friend.');
    if (tags.length === 0) tags.push('Light touch today. One meaningful action > many half‑starts.');
    return tags.slice(0,3);
  }, [mood, focus, connection]);

  // Functions
  const grantXP = (amount) => {
    setXp((prevXp) => {
      let total = prevXp + amount;
      let levelsEarned = 0;

      while (total >= 100) {
        total -= 100;
        levelsEarned += 1;
      }

      if (levelsEarned) {
        setLevel((lvl) => lvl + levelsEarned);
        setStars((curr) => curr + levelsEarned); // small bonus per level
      }

      return clamp(total, 0, 100);
    });
  };

  const completeQuest = (id) => {
    setQuests((prev) => prev.map(q => q.id === id ? { ...q, done: true } : q));
  };

  const handleCheckin = () => {
    if (!checkinComplete || checkinAwarded) return;
    grantXP(25);
    completeQuest('q1');
    setCheckinAwarded(true);
  };

  const handleDuel = (pick) => {
    if (duelDone) return;
    setChoice(pick);
    // lightweight outcome logic
    const favorA = (focus === 'high' || mood === 'high');
    const pickedA = pick === 'a';
    const win = favorA ? pickedA : !pickedA;
    setTimeout(() => {
      setDuelDone(true);
      grantXP(win ? 30 : 10);
      completeQuest('q3');
    }, 500);
  };

  const guidanceViewed = () => completeQuest('q2');

  // House leaderboard (demo)
  const leaderboard = useMemo(() => {
    const base = HOUSES.map((h) => ({ name: h, points: Math.floor(Math.random() * 900 + 100) }));
    if (house) {
      const favored = base.find((x) => x.name === house);
      if (favored) favored.points += 120; // tiny bias to feel good
    }
    return base.sort((a, b) => b.points - a.points).slice(0, 5);
  }, [house]);

  // Copy helpers
  const copyChallenge = async () => {
    try {
      await navigator.clipboard.writeText('Join my Decision Duel on Astra Play → (demo link)');
      alert('Challenge link copied!');
    } catch {
      alert('Copied placeholder challenge to your clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-zinc-950/60 border-b border-black/5 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 grid place-items-center text-white font-black">A</div>
            <div>
              <div className="font-extrabold tracking-tight text-lg">Astra Play</div>
              <div className="text-xs opacity-70">Daily cosmic game • Season: Sagittarius</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge>Lvl {level}</Badge>
            <div className="w-40 h-3 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${xp}%`}} />
            </div>
            <span className="text-xs opacity-80">{xp}/100 XP</span>
            <Button variant="ghost" onClick={() => setDark(!dark)}>{dark ? 'Light' : 'Dark'} mode</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <section className="lg:col-span-2 space-y-6">
          {/* Season banner */}
          <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-indigo-600">Season Pass</div>
                <h2 className="text-2xl font-bold">Sagittarius — Aim True</h2>
                <p className="text-sm opacity-80">{seasonDaysLeft} days left • Earn cosmetics & streak freeze tokens</p>
              </div>
              <div className="hidden md:block w-48 h-24 bg-indigo-100/60 dark:bg-indigo-900/30 rounded-xl rotate-6" />
            </div>
            <div className="mt-4 w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${clamp((100-xp)/1.2, 10, 100)}%`}} />
            </div>
          </Card>

          {/* Check-in */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">1) Daily Check‑in</h3>
              {checkinAwarded ? <Badge>+25 XP</Badge> : null}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <CheckItem label="Mood" value={mood} setValue={setMood} />
              <CheckItem label="Focus" value={focus} setValue={setFocus} />
              <CheckItem label="Connection" value={connection} setValue={setConnection} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={handleCheckin} disabled={!checkinComplete || checkinAwarded}>Complete check‑in</Button>
              <span className="text-sm opacity-70">Takes 10s • Helps tune your brief</span>
            </div>
          </Card>

          {/* Guidance */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">2) Guidance Drop</h3>
              <Button variant="ghost" onClick={guidanceViewed}>Mark read</Button>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {guidance.map((g,i) => <li key={i} className="text-sm">{g}</li>)}
            </ul>
            <p className="mt-3 text-xs opacity-70">Entertainment & wellness only. Not medical, legal, or financial advice.</p>
          </Card>

          {/* Mini‑game */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">3) Mini‑game — Decision Duel</h3>
              {duelDone ? <Badge>Completed</Badge> : null}
            </div>
            <div className="space-y-3">
              <p className="text-md font-medium">{scenario.title}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => handleDuel('a')} disabled={duelDone}>A) {scenario.a}</Button>
                <Button onClick={() => handleDuel('b')} disabled={duelDone} variant="ghost">B) {scenario.b}</Button>
              </div>
              {choice && (
                <div className="mt-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-800/50">
                  <p className="text-sm"><b>Tip:</b> {scenario.tip}</p>
                  {duelDone ? (
                    <p className="text-sm mt-1">Outcome: <b>{choice === 'a' ? scenario.a : scenario.b}</b> was favored. <span className="opacity-70">(+XP)</span></p>
                  ) : (
                    <p className="text-sm mt-1 opacity-70">Calculating alignment…</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={copyChallenge}>Challenge a friend</Button>
                <span className="text-sm opacity-70">Co‑op & leaderboards unlock with Plus</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Right column */}
        <aside className="space-y-6">
          {/* House select & board */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">House</h3>
              {house ? <Badge>{house}</Badge> : <Badge>Pick one</Badge>}
            </div>
            {house ? (
              <div>
                <p className="text-sm opacity-80 mb-2">Top Houses this week</p>
                <ul className="space-y-2">
                  {leaderboard.map((row, i) => (
                    <li key={row.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><span className="w-5 text-right">{i+1}.</span> {row.name}</span>
                      <span className="font-semibold">{row.points} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {HOUSES.map(h => (
                  <button key={h} onClick={() => setHouse(h)} className="text-sm px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20">
                    {h}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Quests */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Quests</h3>
              <Badge>Daily</Badge>
            </div>
            <ul className="space-y-2">
              {quests.map(q => (
                <li key={q.id} className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={q.done} onChange={() => completeQuest(q.id)} />
                    {q.label}
                  </label>
                  <span className="text-xs opacity-70">{q.done ? 'claimed' : `+${q.xp} XP`}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Wallet / Plus */}
          <Card>
            <h3 className="font-bold mb-2">Wallet</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">Stars (soft currency)</div>
                <div className="text-2xl font-extrabold">{stars}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80">Astra Plus</div>
                <div className="text-lg font-bold">$9.99/mo</div>
                <Button className="mt-2">Start free trial</Button>
              </div>
            </div>
          </Card>

          {/* Disclaimers */}
          <Card className="text-xs opacity-80">
            <p>Wellness & entertainment only. No medical, financial, or legal advice. Data used locally for personalization. Age 13+.</p>
          </Card>
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-10 text-xs opacity-70">
        Built for demo: Core loop (check‑in → brief → mini‑game → rewards), season pass feel, Houses, daily quests, wallet, theme toggle. No tracking; all state is in‑memory.
      </footer>
    </div>
  );
}

function CheckItem({ label, value, setValue }){
  const Opt = ({ v, emoji, name }) => (
    <button onClick={() => setValue(v)} className={`flex-1 px-3 py-2 rounded-xl border text-sm transition ${value===v? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/60 dark:bg-zinc-800/60 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'}`}>
      <div className="text-lg">{emoji}</div>
      <div className="mt-1">{name}</div>
    </button>
  );
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{label}</div>
      <div className="flex gap-2">
        <Opt v="low" emoji="🌥️" name="Low" />
        <Opt v="ok" emoji="⛅" name="OK" />
        <Opt v="high" emoji="☀️" name="High" />
      </div>
    </div>
  );
}
