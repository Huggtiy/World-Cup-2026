import { POINTS } from '../constants/points';
import type { Match, Prediction } from './types';

export function computePoints(match: Match, prediction: Prediction): number {
  if (
    match.status !== 'FINISHED' ||
    match.home_score === null ||
    match.away_score === null
  ) {
    return 0;
  }

  const predHome = prediction.home_score;
  const predAway = prediction.away_score;
  const realHome = match.home_score;
  const realAway = match.away_score;

  const exactScore = predHome === realHome && predAway === realAway;
  const exactBonus = exactScore ? POINTS.EXACT_SCORE_BONUS : 0;

  if (match.round === 'GROUP') {
    const realResult = Math.sign(realHome - realAway); // 1=home, -1=away, 0=draw
    const predResult = Math.sign(predHome - predAway);
    if (predResult !== realResult) return 0;
    return POINTS.GROUP_CORRECT_RESULT + exactBonus;
  }

  // Knockout: result component is based on who advanced, not scoreline direction
  if (match.home_advanced === null) return 0;

  const advancedTeamId = match.home_advanced ? match.home_team_id : match.away_team_id;
  const predictedAdvanced = prediction.advancing_team_id;
  const correctAdvance = predictedAdvanced === advancedTeamId;

  let resultPoints = 0;
  if (correctAdvance) {
    switch (match.round) {
      case 'R32': resultPoints = POINTS.R32_CORRECT_ADVANCE; break;
      case 'R16': resultPoints = POINTS.R16_CORRECT_ADVANCE; break;
      case 'QF': resultPoints = POINTS.QF_CORRECT_ADVANCE; break;
      case 'SF': resultPoints = POINTS.SF_CORRECT_ADVANCE; break;
      case 'THIRD_PLACE': resultPoints = POINTS.THIRD_PLACE_CORRECT_ADVANCE; break;
      case 'FINAL': resultPoints = POINTS.FINAL_CORRECT_WINNER; break;
    }
  }

  return resultPoints + exactBonus;
}

export function maxPointsForRound(round: string): number {
  switch (round) {
    case 'GROUP': return POINTS.GROUP_CORRECT_RESULT + POINTS.EXACT_SCORE_BONUS;
    case 'R32': return POINTS.R32_CORRECT_ADVANCE + POINTS.EXACT_SCORE_BONUS;
    case 'R16': return POINTS.R16_CORRECT_ADVANCE + POINTS.EXACT_SCORE_BONUS;
    case 'QF': return POINTS.QF_CORRECT_ADVANCE + POINTS.EXACT_SCORE_BONUS;
    case 'SF': return POINTS.SF_CORRECT_ADVANCE + POINTS.EXACT_SCORE_BONUS;
    case 'THIRD_PLACE': return POINTS.THIRD_PLACE_CORRECT_ADVANCE + POINTS.EXACT_SCORE_BONUS;
    case 'FINAL': return POINTS.FINAL_CORRECT_WINNER + POINTS.EXACT_SCORE_BONUS;
    default: return 0;
  }
}
