import { useState } from "react";
import styles from "./Leaderboard.module.css";
import Button from "../Button";
import { MAX_NAME_LENGTH } from "../../config/gameConfig";

type props = {
  score: number;
  onSubmit: (name: string) => void;
  beatsHighScore?: boolean;
};

const HighScorePrompt = ({ score, onSubmit, beatsHighScore = false }: props) => {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmed) return;
    setSubmitting(true);
    onSubmit(trimmed);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} data-testid="high-score-prompt">
      <label className={styles.formLabel} htmlFor="high-score-name">
        {beatsHighScore ? "New top score" : "You scored"}: {score}! Enter your name:
      </label>
      <input
        id="high-score-name"
        className={styles.input}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={MAX_NAME_LENGTH}
        autoFocus
        autoComplete="off"
        disabled={submitting}
      />
      <div className={styles.formActions}>
        <Button
          text={submitting ? "Saving…" : "Save"}
          disabled={submitting}
          extraProps={{ type: "submit" }}
        />
      </div>
    </form>
  );
};

export default HighScorePrompt;
