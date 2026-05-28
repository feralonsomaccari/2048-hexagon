import { useCallback, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import { playSound, setMuted, vibrate, SoundName, SoundOpts } from "../utils/soundManager";

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
  const play = useCallback((name: SoundName, opts?: SoundOpts) => {
    playSound(name, opts);
    vibrate(name);
  }, []);

  return { isMuted, toggleMuted, play };
};

export default useSound;
