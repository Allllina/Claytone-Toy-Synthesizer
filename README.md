# Claytone

A playful browser-based toy synthesizer for shaping tiny loops with clay-like controls and stop-motion charm.

**Live demo:** [claytone-toy-synthesizer.vercel.app](https://claytone-toy-synthesizer.vercel.app)

Claytone looks like a miniature stop-motion instrument desk — matte polymer keys, wooden knobs, and white peg-doll hands that press down as you play. Under the surface it is a fully client-side synth built on the Web Audio API: no backend, no API keys, no install beyond a browser tab.

---

## What it does

Claytone is a **creative toy instrument**, not a DAW. You can jam on colorful keys, twist tactile knobs, and program short 8-step loops — all inside a cozy terracotta / lilac / indigo aesthetic inspired by painted clay dolls and miniature film sets.

### Play the keyboard

- **8 keys** — C major scale from C4 to C5, each keyed in a distinct clay palette
- **Touch or click** — keys depress with a physical “peg” feel
- **Computer keyboard** — type **A S D F G H J K** for instant play
- **Polyphonic** — hold multiple notes at once

### Shape the sound

Six draggable toy knobs control the synth engine:

| Control    | What it does                          |
| ---------- | ------------------------------------- |
| Cutoff     | Low-pass filter brightness            |
| Resonance  | Filter Q / character                  |
| Attack     | Note fade-in time                     |
| Release    | Note fade-out time                    |
| Echo Time  | Delay length                          |
| Feedback   | Delay repeat amount                   |

Additional controls:

- **Osc Waveform** — Triangle, Sine, Square, or Sawtooth
- **Octave** — Low (3) / Mid (4) / High (5)
- **Master Volume** — Output level slider

### Material presets

Four one-click timbre presets, each tuned for a different “clay material” feel:

- **Cozy Polymer** — soft, powdery pluck
- **Terracotta Bass** — growly low-end square
- **Indigo Echoes** — ambient, ringing space
- **Peg Doll Beeps** — clean retro toy bleeps

### Step sequencer

An 8-step grid lets you paint short melodic loops:

- Tap clay dots to toggle steps per note row
- **Play Loop** / **Pause** with adjustable BPM (60–240)
- **Load Mel** — drop in a starter folk melody
- **Clear** — wipe the grid

When the sequencer runs, the peg-doll hands dance along with the active steps.

### Stop-motion hands

Two white sphere “peg hands” float above the keyboard. They:

- Follow your hover position
- Press down when you play a key
- Split left/right across the lower and upper half of the keyboard
- Bounce in rhythm during sequencer playback

### Chroma key backdrop

Toggle **Chroma BG** for a solid `#00FF00` green screen — useful for screen recording, motion graphics, or compositing Claytone into video projects.

---

## Tech stack

| Layer      | Choice                          |
| ---------- | ------------------------------- |
| UI         | React 19 + TypeScript           |
| Build      | Vite 6                          |
| Styling    | Tailwind CSS 4                  |
| Animation  | Motion (Framer Motion)          |
| Audio      | Web Audio API (client-side)     |
| Icons      | Lucide React                    |

Audio routing: per-note oscillators → ADSR envelope → shared low-pass filter → delay feedback loop → master gain → output.

---

## Run locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/Allllina/Claytone-Toy-Synthesizer.git
cd Claytone-Toy-Synthesizer

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click anywhere once to unlock audio (browser autoplay policy).

### Other scripts

```bash
npm run build    # production build → dist/
npm run preview  # preview production build
npm run lint     # TypeScript type check
```

> **Note:** This app runs entirely in the browser. A `GEMINI_API_KEY` is **not** required for local development or playback — that variable comes from the original AI Studio project template and is unused in the current codebase.

---

## Project structure

```
src/
├── App.tsx                 # Main console layout & state
├── components/
│   ├── ToyKnob.tsx         # Draggable rotary controls
│   ├── ToyHands.tsx        # Stop-motion peg-hand animation
│   └── StepSequencer.tsx   # 8-step loop grid
├── data/
│   └── synthData.ts        # Presets, notes, defaults
├── utils/
│   └── audio.ts            # Web Audio engine
└── types.ts                # SynthSettings & note types
```

---

## Design intent

Claytone sits at the intersection of **toy UX** and **browser music**:

- Controls should feel *tactile* — chunky keys, ceramic knobs, warm wood tones
- Sound should feel *small and cozy* — short envelopes, gentle filtering, light delay
- Motion should feel *handmade* — spring physics on the peg hands, not slick UI transitions

It is meant to be fun in thirty seconds: load a preset, tap a few keys, hit Play on the sequencer, and watch the hands dance.

---

## License

See repository license file for terms.

---

Built with care for anyone who misses the feeling of a wooden toy that also happens to make music.
