"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type Player = "X" | "O";
type Cell = Player | null;

const THEMES = {
  classic: { label: "Classic", X: "✕", O: "◯", xName: "X", oName: "O" },
  pets: { label: "Cats vs Dogs", X: "🐱", O: "🐶", xName: "Cats", oName: "Dogs" },
  space: { label: "Space", X: "🚀", O: "🛸", xName: "Rockets", oName: "UFOs" },
} as const;
type ThemeKey = keyof typeof THEMES;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

function findWinner(board: Cell[]): { player: Player; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

const CONFETTI = Array.from({ length: 28 }, (_, i) => i);

export default function Game() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const [starter, setStarter] = useState<Player>("X");
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [themeKey, setThemeKey] = useState<ThemeKey>("classic");
  const theme = THEMES[themeKey];

  const winner = useMemo(() => findWinner(board), [board]);
  const isDraw = !winner && board.every(Boolean);
  const gameOver = Boolean(winner) || isDraw;

  function play(i: number) {
    if (board[i] || gameOver) return;
    const next = [...board];
    next[i] = turn;
    setBoard(next);

    const result = findWinner(next);
    if (result) {
      setScores((s) => ({ ...s, [result.player]: s[result.player] + 1 }));
    } else if (next.every(Boolean)) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    } else {
      setTurn(turn === "X" ? "O" : "X");
    }
  }

  function newGame() {
    // Alternate who goes first each round to keep it fair.
    const nextStarter: Player = starter === "X" ? "O" : "X";
    setStarter(nextStarter);
    setTurn(nextStarter);
    setBoard(Array(9).fill(null));
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 });
    setStarter("X");
    setTurn("X");
    setBoard(Array(9).fill(null));
  }

  const name = (p: Player) => (p === "X" ? theme.xName : theme.oName);

  let status: React.ReactNode;
  if (winner) {
    status = (
      <>
        <span className={styles[`mark${winner.player}`]}>{theme[winner.player]}</span>{" "}
        {name(winner.player)} win{theme.xName === "X" ? "s" : ""}!
      </>
    );
  } else if (isDraw) {
    status = <>It&apos;s a draw 🤝</>;
  } else {
    status = (
      <>
        <span className={styles[`mark${turn}`]}>{theme[turn]}</span> {name(turn)}&apos;s turn
      </>
    );
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        Tic<span className={styles.dot}>·</span>Tac<span className={styles.dot}>·</span>Glow
      </h1>

      <div className={styles.themes} role="radiogroup" aria-label="Icon theme">
        {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
          <button
            key={key}
            role="radio"
            aria-checked={themeKey === key}
            className={`${styles.chip} ${themeKey === key ? styles.chipActive : ""}`}
            onClick={() => setThemeKey(key)}
          >
            {THEMES[key].X} {THEMES[key].O} {THEMES[key].label}
          </button>
        ))}
      </div>

      <section className={styles.scoreboard} aria-label="Scoreboard">
        <div className={`${styles.score} ${styles.scoreX} ${!gameOver && turn === "X" ? styles.active : ""}`}>
          <span className={styles.scoreLabel}>{theme.X} {theme.xName}</span>
          <span className={styles.scoreValue}>{scores.X}</span>
        </div>
        <div className={`${styles.score} ${styles.scoreDraw}`}>
          <span className={styles.scoreLabel}>🤝 Draws</span>
          <span className={styles.scoreValue}>{scores.draws}</span>
        </div>
        <div className={`${styles.score} ${styles.scoreO} ${!gameOver && turn === "O" ? styles.active : ""}`}>
          <span className={styles.scoreLabel}>{theme.O} {theme.oName}</span>
          <span className={styles.scoreValue}>{scores.O}</span>
        </div>
      </section>

      <p className={`${styles.status} ${gameOver ? styles.statusOver : ""}`} aria-live="polite">
        {status}
      </p>

      <div className={styles.boardWrap}>
        <div className={`${styles.board} ${gameOver ? styles.boardOver : ""}`}>
          {board.map((cell, i) => {
            const inLine = winner?.line.includes(i);
            return (
              <button
                key={i}
                className={[
                  styles.cell,
                  cell ? styles[`cell${cell}`] : "",
                  inLine ? styles.cellWin : "",
                  winner && !inLine ? styles.cellDim : "",
                ].join(" ")}
                onClick={() => play(i)}
                disabled={Boolean(cell) || gameOver}
                aria-label={cell ? `Cell ${i + 1}: ${name(cell)}` : `Cell ${i + 1}: empty`}
              >
                {cell && <span className={styles.mark}>{theme[cell]}</span>}
                {!cell && !gameOver && <span className={styles.ghost}>{theme[turn]}</span>}
              </button>
            );
          })}
        </div>

        {winner && (
          <div className={styles.confetti} aria-hidden>
            {CONFETTI.map((i) => (
              <span
                key={i}
                style={{
                  left: `${(i * 37) % 100}%`,
                  animationDelay: `${(i % 7) * 0.08}s`,
                  animationDuration: `${1.4 + (i % 5) * 0.25}s`,
                }}
              >
                {i % 3 === 0 ? "✨" : theme[winner.player]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={newGame}>
          New Game
        </button>
        <button className={styles.secondary} onClick={resetScores}>
          Reset Scores
        </button>
      </div>

      <p className={styles.footer}>
        {starter === "X" ? theme.xName : theme.oName} start{theme.xName === "X" ? "s" : ""} this round · the first move alternates every game
      </p>
    </main>
  );
}
