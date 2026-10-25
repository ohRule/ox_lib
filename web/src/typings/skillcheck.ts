interface CustomGameDifficulty {
  areaSize: number;
  speedMultiplier: number;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard' | CustomGameDifficulty;

export type SkillCheckStyle = 'bar' | 'bounce';

export interface SkillCheckProps {
  angle: number;
  difficultyOffset: number;
  difficulty: GameDifficulty;
  keys?: string[];
  key: string;
  /** `bounce` keeps moving until a press or the check is hidden. `bar` fails at the end of one pass. */
  style?: SkillCheckStyle;
}
