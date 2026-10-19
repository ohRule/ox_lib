import { Button, createStyles, Group, Modal, Stack } from '@mantine/core';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import { useLocales } from '../../providers/LocaleProvider';
import remarkGfm from 'remark-gfm';
import type { AlertProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';

const useStyles = createStyles(() => ({
  contentStack: {
    color: '#e8e8e8',
    fontFamily: 'Roboto, sans-serif',
  },
}));

const AlertDialog: React.FC = () => {
  const { locale } = useLocales();
  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  const [dialogData, setDialogData] = useState<AlertProps>({
    header: '',
    content: '',
  });

  const closeAlert = (button: string) => {
    setOpened(false);
    fetchNui('closeAlert', button);
  };

  useNuiEvent('sendAlert', (data: AlertProps) => {
    setDialogData(data);
    setOpened(true);
  });

  useNuiEvent('closeAlertDialog', () => {
    setOpened(false);
  });

  return (
    <>
      <Modal
        opened={opened}
        centered={dialogData.centered}
        size={dialogData.size || 'md'}
        overflow={dialogData.overflow ? 'inside' : 'outside'}
        closeOnClickOutside={false}
        onClose={() => {
          setOpened(false);
          closeAlert('cancel');
        }}
        withCloseButton={false}
        overlayOpacity={0.5}
        exitTransitionDuration={150}
        transition="fade"
        padding={0}
        classNames={{ modal: 'ox-input-dialog' }}
        styles={{
          modal: {
            backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha, 0.55))',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '0.45vh',
            padding: 0,
            overflow: 'hidden',
          },
          header: {
            backgroundColor: 'rgb(var(--ox-progress-highlight))',
            margin: 0,
            padding: '0 1.2vh',
            minHeight: '4.2vh',
            borderRadius: 0,
          },
          title: {
            color: '#fff',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: '1.7vh',
            fontFamily: 'Roboto, sans-serif',
            width: '100%',
            marginRight: 0,
            textAlign: 'center',
          },
          body: {
            padding: '1.4vh',
          },
        }}
        title={<ReactMarkdown components={MarkdownComponents}>{dialogData.header}</ReactMarkdown>}
      >
        <Stack className={classes.contentStack}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ...MarkdownComponents,
              img: ({ ...props }) => <img style={{ maxWidth: '100%', maxHeight: '100%' }} {...props} />,
            }}
          >
            {dialogData.content}
          </ReactMarkdown>
          <Group position="right" spacing={10}>
            {dialogData.cancel && (
              <Button uppercase variant="default" className="ox-dialog-cancel" onClick={() => closeAlert('cancel')}>
                {dialogData.labels?.cancel || locale.ui.cancel}
              </Button>
            )}
            <Button uppercase className="ox-dialog-confirm" onClick={() => closeAlert('confirm')}>
              {dialogData.labels?.confirm || locale.ui.confirm}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default AlertDialog;
