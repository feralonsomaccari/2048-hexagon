import { useCallback, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import { playSound, setMuted, SoundName, SoundOpts } from "../utils/soundManager";

// Bridges the procedural sound engine to React: persists the mute preference
// (mirroring useTheme), keeps the engine's mute flag in sync, and hands back a
// stable `play` callback for game events to fire.
//
// The preference is stored as an object rather than a raw boolean: the shared
// useLocalStorage gates reads on Object.keys(value).length, so a primitive
// `true` would never be read back. Wrapping it sidesteps that quirk.
const useSound = (): {
  isMuted: boolean;
  toggleMuted: () => void;
  play: (name: SoundName, opts?: SoundOpts) => void;
} => {
  const [stored, setStored] = useLocalStorage<{ muted: boolean }>("soundMuted", { muted: true });
  const isMuted = stored.muted;

  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted]);

  const toggleMuted = useCallback(() => setStored((prev) => ({ muted: !prev.muted })), [setStored]);
  const play = useCallback((name: SoundName, opts?: SoundOpts) => playSound(name, opts), []);

  return { isMuted, toggleMuted, play };
};

export default useSound;
