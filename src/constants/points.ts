export const POINTS = {
  // Result components
  GROUP_CORRECT_RESULT: 3,
  R32_CORRECT_ADVANCE: 5,
  R16_CORRECT_ADVANCE: 5,
  QF_CORRECT_ADVANCE: 8,
  SF_CORRECT_ADVANCE: 12,
  THIRD_PLACE_CORRECT_ADVANCE: 12,
  FINAL_CORRECT_WINNER: 20,

  // Bonus — stacks with result component
  EXACT_SCORE_BONUS: 5,
} as const;

export const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Group Stage',
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-finals',
  SF: 'Semi-finals',
  THIRD_PLACE: 'Third-Place Play-off',
  FINAL: 'Final',
};
