import { debugData } from '../../../utils/debugData';
import { GameDifficulty } from '../../../typings';

export const debugSkillCheck = (style?: 'bar' | 'bounce') => {
  debugData<{ difficulty: GameDifficulty | GameDifficulty[]; inputs?: string[]; style?: 'bar' | 'bounce' }>([
    {
      action: 'startSkillCheck',
      data: {
        difficulty: style === 'bounce' ? ['easy', 'easy', 'hard'] : ['easy', 'easy', 'hard'],
        inputs: style === 'bounce' ? ['E'] : ['W', 'A', 'S', 'D'],
        style,
      },
    },
  ]);
};
