export interface SynthSettings {
  waveform: OscillatorType;
  filterCutoff: number; // 200 to 8000 Hz
  filterResonance: number; // 1 to 20
  attack: number; // 0.01 to 2.0s
  release: number; // 0.01 to 3.0s
  detune: number; // -100 to 100 cents
  delayTime: number; // 0 to 1.0s
  delayFeedback: number; // 0 to 0.9
  octave: number; // 3, 4, 5
  volume: number; // 0 to 1
}

export interface NoteItem {
  id: string;
  name: string;
  freq: number;
  label: string;
  colorClass: string; // Tailwind bg color class reflecting terracotta, lilac, indigo, cream
  hex: string; // Exact hex code for matching elements
  octaveOffset: number;
}

export interface SequencerStep {
  noteId: string;
  active: boolean;
}

export interface Preset {
  name: string;
  settings: SynthSettings;
  description: string;
}
