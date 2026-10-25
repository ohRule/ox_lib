type SkillCheckDifficulty = 'easy' | 'medium' | 'hard' | { areaSize: number; speedMultiplier: number };

export const skillCheck = (
  difficulty: SkillCheckDifficulty | SkillCheckDifficulty[],
  inputs?: string[],
  style?: 'bar' | 'bounce'
) => exports.ox_lib.skillCheck(difficulty, inputs, style);

export const skillCheckActive = (): boolean => exports.ox_lib.skillCheckActive();

export const cancelSkillCheck = (): void => exports.ox_lib.cancelSkillCheck();
