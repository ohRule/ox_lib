import React from 'react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { Box, createStyles, Group, Stack, Text } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import ScaleFade from '../../transitions/ScaleFade';
import remarkGfm from 'remark-gfm';
import type { TextUiPosition, TextUiProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import LibIcon from '../../components/LibIcon';
import { fetchNui } from '../../utils/fetchNui';

const useStyles = createStyles((_theme, params: { position?: TextUiPosition }) => {
  // Left prompts sit on the minimap, which Lua measures into these variables.
  const left = params.position === 'left-center';

  return {
  wrapper: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    display: 'flex',
    alignItems: left
      ? 'flex-end'
      : params.position === 'top-center' ? 'baseline' :
      params.position === 'bottom-center' ? 'flex-end' : 'center',
    justifyContent: left
      ? 'flex-start'
      : params.position === 'right-center' ? 'flex-end' :
      params.position === 'left-center' ? 'flex-start' : 'center',
    paddingLeft: left ? 'var(--ox-minimap-left, 2.8vh)' : 0,
    paddingBottom: left ? 'calc(100vh - var(--ox-minimap-top, 80vh) + 6px)' : 0,
    boxSizing: 'border-box',
  },
  container: {
    width: '32vh',
    boxSizing: 'border-box',
    fontSize: 16,
    padding: 12,
    margin: 8,
    backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha, 0.55))',
    color: '#fff',
    fontFamily: 'Roboto',
    borderRadius: '0.45vh',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  // Card inside the left stack. The stack itself is the minimap width.
  anchoredCard: {
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 16,
    padding: 12,
    margin: 0,
    backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha, 0.55))',
    color: '#fff',
    fontFamily: 'Roboto',
    borderRadius: '0.45vh',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  keyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    margin: left ? 0 : 8,
    width: left ? 'var(--ox-minimap-width, 29vh)' : '32vh',
  },
  keyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minWidth: 0,
  },
  keycap: {
    minWidth: 38,
    height: 38,
    padding: '0 8px',
    boxSizing: 'border-box',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '2px solid rgba(255, 255, 255, 0.92)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    color: '#fff',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 1,
  },
  // Icons stay in the same square as a single letter. Text keys can still grow.
  iconKeycap: {
    width: 38,
    maxWidth: 38,
    padding: 0,
    '& svg': {
      display: 'block',
    },
  },
  keyDivider: {
    width: 2,
    alignSelf: 'stretch',
    margin: '4px 0',
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  keyCopy: {
    minWidth: 0,
    flex: 1,
  },
  keyTitle: {
    color: '#fff',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 700,
    fontSize: 16,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  keyDetail: {
    color: '#fff',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}});

/** `[E] - Open door` puts E in a keycap. Extra lines sit under that label. */
const KEY_LINE = /^\s*\[([^\]]+)\]\s*-\s*(.*)$/;

type KeyIcon = 'lmb' | 'rmb' | 'scroll' | 'scrollup' | 'scrolldown' | 'backspace' | 'enter';

const KEY_ICONS: Record<string, KeyIcon> = {
  lmb: 'lmb',
  mouse1: 'lmb',
  m1: 'lmb',
  leftmouse: 'lmb',
  rmb: 'rmb',
  mouse2: 'rmb',
  m2: 'rmb',
  rightmouse: 'rmb',
  scroll: 'scroll',
  mousewheel: 'scroll',
  wheel: 'scroll',
  mwheel: 'scroll',
  scrollup: 'scrollup',
  wheelup: 'scrollup',
  mwheelup: 'scrollup',
  mousewheelup: 'scrollup',
  scrolldown: 'scrolldown',
  wheeldown: 'scrolldown',
  mwheeldown: 'scrolldown',
  mousewheeldown: 'scrolldown',
  backspace: 'backspace',
  back: 'backspace',
  bksp: 'backspace',
  enter: 'enter',
  return: 'enter',
  ent: 'enter',
};

const keyIcon = (key: string) => KEY_ICONS[key.toLowerCase().replace(/\s+/g, '')] ?? null;

/** Left or right mouse button, drawn to fit the existing keycap. */
const MouseCap: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <svg width="16" height="22" viewBox="0 0 20 28" aria-hidden="true">
    <rect x="1.2" y="1.2" width="17.6" height="25.6" rx="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M10 1.4V11.2M1.4 11.2h17.2" stroke="currentColor" strokeWidth="1.4" />
    <path
      d={side === 'left' ? 'M2.4 10.6V7Q2.4 2.2 9.4 2.2V10.6Z' : 'M17.6 10.6V7Q17.6 2.2 10.6 2.2V10.6Z'}
      fill="currentColor"
    />
  </svg>
);

/** Mouse wheel. Up sits above the mouse; down sits just under the wheel. */
const ScrollCap: React.FC<{ direction: 'up' | 'down' | 'both' }> = ({ direction }) => (
  <svg width="16" height="27" viewBox="0 0 20 34" aria-hidden="true">
    {(direction === 'up' || direction === 'both') && <path d="M10 1.2 7.3 4.4h5.4Z" fill="currentColor" />}
    <rect x="1.2" y="6.2" width="17.6" height="25.6" rx="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <rect x="8.1" y="8.2" width="3.8" height="6.4" rx="1.5" fill="currentColor" />
    {(direction === 'down' || direction === 'both') && <path d="M10 20.2 7.4 17.2h5.2Z" fill="currentColor" />}
  </svg>
);

/** Enter key: the return arrow, centered in the square. */
const EnterCap: React.FC = () => (
  <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">
    <path d="M13 2.9V9.9H4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.8 6.8 4.6 9.9 7.8 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Backspace key: a flat left-pointing key with the mark in the key body. */
const BackspaceCap: React.FC = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
    <path d="M7.6 1.3H19.7V12.7H7.6L2.2 7Z" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
    <path d="M11.2 4.3 16.2 9.7M16.2 4.3 11.2 9.7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
  </svg>
);

const KeyCapIcon: React.FC<{ icon: KeyIcon }> = ({ icon }) => {
  if (icon === 'lmb' || icon === 'rmb') return <MouseCap side={icon === 'lmb' ? 'left' : 'right'} />;
  if (icon === 'backspace') return <BackspaceCap />;
  if (icon === 'enter') return <EnterCap />;
  return <ScrollCap direction={icon === 'scrollup' ? 'up' : icon === 'scrolldown' ? 'down' : 'both'} />;
};

type KeyPrompt = { key: string; title: string; lines: string[] };

const parseKeyPrompts = (text: string): KeyPrompt[] | null => {
  const prompts: KeyPrompt[] = [];

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const match = line.match(KEY_LINE);
    if (match) {
      prompts.push({ key: match[1].trim(), title: match[2].trim(), lines: [] });
      continue;
    }

    // Only use the key layout when the prompt starts with [key] -
    if (!prompts.length) return null;
    prompts[prompts.length - 1].lines.push(line);
  }

  return prompts.length ? prompts : null;
};

const TextUI: React.FC = () => {
  const [data, setData] = React.useState<TextUiProps>({
    text: '',
    position: 'left-center',
  });
  const [visible, setVisible] = React.useState(false);
  const { classes } = useStyles({ position: data.position });
  const keyPrompts = parseKeyPrompts(data.text);

  // Fractions of the screen, measured in-game. Applied in this viewport's pixels.
  const applyMinimapAnchor = (anchor?: { left: number; top: number; width: number }) => {
    if (!anchor || typeof anchor.left !== 'number') return;

    const root = document.documentElement.style;
    root.setProperty('--ox-minimap-left', `${anchor.left * window.innerWidth}px`);
    root.setProperty('--ox-minimap-top', `${anchor.top * window.innerHeight}px`);
    root.setProperty('--ox-minimap-width', `${anchor.width * window.innerWidth}px`);
  };

  useNuiEvent<{ left: number; top: number; width: number }>('minimapAnchor', applyMinimapAnchor);

  React.useEffect(() => {
    fetchNui<{ left: number; top: number; width: number }>('textUiReady').then(applyMinimapAnchor).catch(() => undefined);
  }, []);

  useNuiEvent<TextUiProps>('textUi', (data) => {
    if (!data.position) data.position = 'left-center';
    setData(data);
    setVisible(true);
  });

  useNuiEvent('textUiHide', () => setVisible(false));

  return (
    <>
      <Box className={classes.wrapper}>
        <ScaleFade visible={visible}>
          {keyPrompts ? (
            <Box className={classes.keyList}>
              {keyPrompts.map((prompt) => {
                const icon = keyIcon(prompt.key);

                return (
                <Box
                  style={{ ...data.style, margin: 0 }}
                  className={data.position === 'left-center' ? classes.anchoredCard : classes.container}
                  key={`${prompt.key}-${prompt.title}`}
                >
                  <Box className={classes.keyRow}>
                    <Box className={icon ? `${classes.keycap} ${classes.iconKeycap}` : classes.keycap}>
                      {icon ? <KeyCapIcon icon={icon} /> : prompt.key}
                    </Box>
                    <Box className={classes.keyDivider} />
                    <Stack spacing={2} className={classes.keyCopy}>
                      {prompt.title && <Text className={classes.keyTitle}>{prompt.title}</Text>}
                      {prompt.lines.map((line) => (
                        <Text className={classes.keyDetail} key={line}>
                          {line}
                        </Text>
                      ))}
                    </Stack>
                  </Box>
                </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              style={
                data.position === 'left-center'
                  ? { ...data.style, width: 'var(--ox-minimap-width, 29vh)' }
                  : data.style
              }
              className={data.position === 'left-center' ? classes.anchoredCard : classes.container}
            >
              <Group spacing={12}>
                {data.icon && (
                  <LibIcon
                    icon={data.icon}
                    fixedWidth
                    size="lg"
                    animation={data.iconAnimation}
                    style={{
                      color: data.iconColor,
                      alignSelf: !data.alignIcon || data.alignIcon === 'center' ? 'center' : 'start',
                    }}
                  />
                )}
                <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                  {data.text}
                </ReactMarkdown>
              </Group>
            </Box>
          )}
        </ScaleFade>
      </Box>
    </>
  );
};

export default TextUI;
