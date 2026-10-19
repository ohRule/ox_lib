import { useNuiEvent } from '../../../hooks/useNuiEvent';
import { Box, createStyles, Flex, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ContextMenuProps } from '../../../typings';
import ContextButton from './components/ContextButton';
import { fetchNui } from '../../../utils/fetchNui';
import ReactMarkdown from 'react-markdown';
import HeaderButton from './components/HeaderButton';
import ScaleFade from '../../../transitions/ScaleFade';
import MarkdownComponents from '../../../config/MarkdownComponents';

const openMenu = (id: string | undefined) => {
  fetchNui<ContextMenuProps>('openContext', { id: id, back: true });
};

const useStyles = createStyles(() => ({
  container: {
    position: 'absolute',
    top: '15%',
    right: '25%',
    width: 320,
  },
  panel: {
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '0.45vh',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha, 0.55))',
    fontFamily: 'Roboto, sans-serif',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    gap: 0,
    minHeight: '4.2vh',
    backgroundColor: 'rgb(var(--ox-progress-highlight))',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleText: {
    color: '#fff',
    padding: '0.6vh 0.4vh',
    textAlign: 'center',
    fontSize: '1.7vh',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontFamily: 'Roboto, sans-serif',
    '& p, & h1, & h2, & h3': {
      margin: 0,
      color: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 1.2,
      textTransform: 'inherit',
    },
  },
  // Matches the back/close buttons so the title stays centred.
  headerSpacer: {
    width: '4.2vh',
    flexShrink: 0,
  },
  buttonsContainer: {
    maxHeight: '60vh',
    overflowY: 'scroll',
  },
  buttonsFlexWrapper: {
    gap: 0,
  },
}));

const ContextMenu: React.FC = () => {
  const { classes } = useStyles();
  const [visible, setVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuProps>({
    title: '',
    options: { '': { description: '', metadata: [] } },
  });

  const closeContext = () => {
    if (contextMenu.canClose === false) return;
    setVisible(false);
    fetchNui('closeContext');
  };

  // Hides the context menu on ESC
  useEffect(() => {
    if (!visible) return;

    const keyHandler = (e: KeyboardEvent) => {
      if (['Escape'].includes(e.code)) closeContext();
    };

    window.addEventListener('keydown', keyHandler);

    return () => window.removeEventListener('keydown', keyHandler);
  }, [visible]);

  useNuiEvent('hideContext', () => setVisible(false));

  useNuiEvent<ContextMenuProps>('showContext', async (data) => {
    if (visible) {
      setVisible(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    setContextMenu(data);
    setVisible(true);
  });

  return (
    <Box className={classes.container}>
      <ScaleFade visible={visible}>
        <Box className={classes.panel}>
          <Flex className={classes.header}>
            {contextMenu.menu ? (
              <HeaderButton icon="chevron-left" iconSize={16} handleClick={() => openMenu(contextMenu.menu)} />
            ) : (
              <Box className={classes.headerSpacer} />
            )}
            <Box className={classes.titleContainer}>
              <Text className={classes.titleText}>
                <ReactMarkdown components={MarkdownComponents}>{contextMenu.title}</ReactMarkdown>
              </Text>
            </Box>
            <HeaderButton icon="xmark" canClose={contextMenu.canClose} iconSize={18} handleClick={closeContext} />
          </Flex>
          <Box className={classes.buttonsContainer}>
            <Stack className={classes.buttonsFlexWrapper}>
              {Object.entries(contextMenu.options).map((option, index) => (
                <ContextButton option={option} key={`context-item-${index}`} />
              ))}
            </Stack>
          </Box>
        </Box>
      </ScaleFade>
    </Box>
  );
};

export default ContextMenu;
