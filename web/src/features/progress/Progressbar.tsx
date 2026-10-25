import React from 'react';
import { Box, createStyles, Text } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import type { ProgressbarProps } from '../../typings';
import { useHotbarOffset } from './hotbarLayout';

const useStyles = createStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // Same footprint as the 6 hotbar slots, including the gap between them.
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
    width: '100%',
    height: '1.6vh',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: '0.45vh',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha))',
  },
  bar: {
    height: '100%',
    backgroundColor: 'rgba(var(--ox-progress-highlight), 0.72)',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '0.8vh',
    width: '100%',
    marginBottom: '0.45vh',
    padding: '0 0.8vh',
    boxSizing: 'border-box',
  },
  label: {
    minWidth: 0,
    flex: 1,
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
  percent: {
    flexShrink: 0,
    fontFamily: 'Roboto, sans-serif',
    fontSize: '1.2vh',
    fontWeight: 500,
    letterSpacing: '0.06em',
    lineHeight: 1,
    color: '#e8e8e8',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
  },
}));

const Progressbar: React.FC = () => {
  const { classes } = useStyles();
  // Sits just above the ox_inventory hotbar and follows its scale.
  useHotbarOffset();
  const [visible, setVisible] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [duration, setDuration] = React.useState(0);
  const [percent, setPercent] = React.useState(0);
  const [runId, setRunId] = React.useState(0);

  useNuiEvent('progressCancel', () => setVisible(false));

  useNuiEvent<ProgressbarProps>('progress', (data) => {
    setVisible(true);
    setLabel(data.label);
    setDuration(data.duration);
    setPercent(0);
    setRunId((id) => id + 1);
  });

  // Keep the percent in step with the CSS fill, without re-rendering the bar itself.
  React.useEffect(() => {
    if (!visible || duration <= 0) return;

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      setPercent(Math.min(100, Math.floor(((now - start) / duration) * 100)));
      if (now - start < duration) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, duration, runId]);

  return (
    <>
      <Box className={classes.wrapper}>
        <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
          <Box className={classes.container}>
            <Box className={classes.header}>
              <Text className={classes.label}>{label}</Text>
              <Text className={classes.percent}>{percent}%</Text>
            </Box>
            <Box className={classes.track}>
              <Box
                className={classes.bar}
                onAnimationEnd={() => setVisible(false)}
                sx={{
                  animation: 'progress-bar linear',
                  animationDuration: `${duration}ms`,
                }}
              />
            </Box>
          </Box>
        </ScaleFade>
      </Box>
    </>
  );
};

export default Progressbar;
