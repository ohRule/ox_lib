import { useRef, useState } from 'react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import Indicator from './indicator';
import { fetchNui } from '../../utils/fetchNui';
import { Box, createStyles, Text } from '@mantine/core';
import type { GameDifficulty, SkillCheckProps, SkillCheckStyle } from '../../typings';
import ScaleFade from '../../transitions/ScaleFade';
import { useHotbarOffset } from '../progress/hotbarLayout';

const getRandomAngle = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

const difficultyOffsets = {
  easy: 50,
  medium: 40,
  hard: 25,
};

/** Same chrome as the progress bar. The sweep is still the old 0–360 angle, drawn along the track. */
const useStyles = createStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 'calc((6 * 9.6vh + 5 * 0.55vh) * var(--ox-hotbar-scale))',
  },
  wrapper: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    bottom: 'var(--ox-progress-bottom)',
  },
  track: {
    position: 'relative',
    width: '100%',
    height: '1.6vh',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: '0.45vh',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha))',
  },
  zone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(var(--ox-progress-highlight), 0.72)',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '0.2vh',
    marginLeft: '-0.1vh',
    backgroundColor: '#fff',
  },
  label: {
    maxWidth: '100%',
    marginBottom: '0.45vh',
    padding: '0 0.8vh',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '1.2vh',
    fontWeight: 500,
    letterSpacing: '0.06em',
    lineHeight: 1,
    textTransform: 'uppercase',
    color: '#e8e8e8',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
  },
}));

const SkillCheck: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const dataRef = useRef<{ difficulty: GameDifficulty | GameDifficulty[]; inputs?: string[] } | null>(null);
  const dataIndexRef = useRef<number>(0);
  const [skillCheck, setSkillCheck] = useState<SkillCheckProps>({
    angle: 0,
    difficultyOffset: 50,
    difficulty: 'easy',
    key: 'e',
  });
  const { classes } = useStyles();
  useHotbarOffset();
  const zoneStart = ((skillCheck.angle + 90) / 360) * 100;
  const zoneWidth = (skillCheck.difficultyOffset / 360) * 100;

  useNuiEvent('startSkillCheck', (data: { difficulty: GameDifficulty | GameDifficulty[]; inputs?: string[]; style?: SkillCheckStyle }) => {
    const style = data.style === 'bounce' ? 'bounce' : 'bar';
    // Bounce uses three passes of the same difficulty unless the script already passed a list.
    if (style === 'bounce' && !Array.isArray(data.difficulty)) {
      data.difficulty = [data.difficulty, data.difficulty, data.difficulty];
    }

    dataRef.current = data;
    dataIndexRef.current = 0;
    const gameData = Array.isArray(data.difficulty) ? data.difficulty[0] : data.difficulty;
    const offset = typeof gameData === 'object' ? gameData.areaSize : difficultyOffsets[gameData];
    const randomKey = data.inputs ? data.inputs[Math.floor(Math.random() * data.inputs.length)] : 'e';
    setSkillCheck({
      angle: -90 + getRandomAngle(120, 360 - offset),
      difficultyOffset: offset,
      difficulty: gameData,
      keys: data.inputs?.map((input) => input.toLowerCase()),
      key: randomKey.toLowerCase(),
      style,
    });

    setVisible(true);
  });

  useNuiEvent('skillCheckCancel', () => {
    setVisible(false);
    fetchNui('skillCheckOver', false);
  });

  const handleComplete = (success: boolean) => {
    if (!dataRef.current) return;
    if (!success || !Array.isArray(dataRef.current.difficulty)) {
      setVisible(false);
      return fetchNui('skillCheckOver', success);
    }

    if (dataIndexRef.current >= dataRef.current.difficulty.length - 1) {
      setVisible(false);
      return fetchNui('skillCheckOver', success);
    }

    dataIndexRef.current++;
    const data = dataRef.current.difficulty[dataIndexRef.current];
    const key = dataRef.current.inputs
      ? dataRef.current.inputs[Math.floor(Math.random() * dataRef.current.inputs.length)]
      : 'e';
    const offset = typeof data === 'object' ? data.areaSize : difficultyOffsets[data];
    setSkillCheck((prev) => ({
      ...prev,
      angle: -90 + getRandomAngle(120, 360 - offset),
      difficultyOffset: offset,
      difficulty: data,
      key: key.toLowerCase(),
    }));
  };

  return (
    <Box className={classes.wrapper}>
      <ScaleFade visible={visible}>
        <Box className={classes.container}>
          <Text className={classes.label}>{skillCheck.key}</Text>
          <Box className={classes.track}>
            <Box className={classes.zone} style={{ left: `${zoneStart}%`, width: `${zoneWidth}%` }} />
            <Indicator
              angle={skillCheck.angle}
              offset={skillCheck.difficultyOffset}
              multiplier={
                skillCheck.difficulty === 'easy'
                  ? 1
                  : skillCheck.difficulty === 'medium'
                  ? 1.5
                  : skillCheck.difficulty === 'hard'
                  ? 1.75
                  : skillCheck.difficulty.speedMultiplier
              }
              handleComplete={handleComplete}
              className={classes.indicator}
              skillCheck={skillCheck}
            />
          </Box>
        </Box>
      </ScaleFade>
    </Box>
  );
};

export default SkillCheck;
