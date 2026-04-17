import { create } from "zustand";

interface AudioState {
  // Recording state
  isListening: boolean;
  isCapturing: boolean;
  bufferSeconds: number;
  maxBufferSeconds: number;
  vadActive: boolean;
  vadLevel: number;

  // Actions
  setListening: (v: boolean) => void;
  setCapturing: (v: boolean) => void;
  setBufferSeconds: (v: number) => void;
  setVadActive: (v: boolean) => void;
  setVadLevel: (v: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isListening: false,
  isCapturing: false,
  bufferSeconds: 0,
  maxBufferSeconds: 60,
  vadActive: false,
  vadLevel: 0,

  setListening: (v) => set({ isListening: v }),
  setCapturing: (v) => set({ isCapturing: v }),
  setBufferSeconds: (v) => set({ bufferSeconds: v }),
  setVadActive: (v) => set({ vadActive: v }),
  setVadLevel: (v) => set({ vadLevel: v }),
}));
