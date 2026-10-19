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
              {keyPrompts.map((prompt) => (
                <Box
                  style={{ ...data.style, margin: 0 }}
                  className={data.position === 'left-center' ? classes.anchoredCard : classes.container}
                  key={`${prompt.key}-${prompt.title}`}
                >
                  <Box className={classes.keyRow}>
                    <Box className={classes.keycap}>{prompt.key}</Box>
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
              ))}
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
