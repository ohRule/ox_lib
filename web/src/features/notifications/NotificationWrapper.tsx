import { useNuiEvent } from '../../hooks/useNuiEvent';
import { toast, Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Box, createStyles, Group, keyframes, Stack, Text, useMantineTheme } from '@mantine/core';
import React from 'react';
import tinycolor from 'tinycolor2';
import type { NotificationProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import LibIcon from '../../components/LibIcon';

const useStyles = createStyles(() => ({
  container: {
    width: 300,
    height: '35px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha, 0.55))',
    color: '#e8e8e8',
    padding: '0 12px',
    borderRadius: '0.45vh',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    fontFamily: 'Roboto',
  },
  icon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: 26,
    lineHeight: 1,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: 500,
    lineHeight: 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: 12,
    color: 'rgba(232, 232, 232, 0.7)',
    fontFamily: 'Roboto',
    lineHeight: 'normal',
    overflow: 'hidden',
    '& p': {
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  descriptionOnly: {
    fontSize: 14,
    color: '#e8e8e8',
    fontFamily: 'Roboto',
    lineHeight: 'normal',
    overflow: 'hidden',
    '& p': {
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}));

const createAnimation = (from: string, to: string, visible: boolean) => keyframes({
  from: {
    opacity: visible ? 0 : 1,
    transform: `translate${from}`,
  },
  to: {
    opacity: visible ? 1 : 0,
    transform: `translate${to}`,
  },
});

const getAnimation = (visible: boolean, position: string) => {
  const animationOptions = visible ? '0.2s ease-out forwards' : '0.4s ease-in forwards'
  let animation: { from: string; to: string };

  if (visible) {
    animation = position.includes('bottom') ? { from: 'Y(30px)', to: 'Y(0px)' } : { from: 'Y(-30px)', to:'Y(0px)' };
  } else {
    if (position.includes('right')) {
      animation = { from: 'X(0px)', to: 'X(100%)' }
    } else if (position.includes('left')) {
      animation = { from: 'X(0px)', to: 'X(-100%)' };
    } else if (position === 'top-center') {
      animation = { from: 'Y(0px)', to: 'Y(-100%)' };
    } else if (position === 'bottom-center') {
      animation = { from: 'Y(0px)', to: 'Y(100%)' };
    } else {
      animation = { from: 'X(0px)', to: 'X(100%)' };
    }
  }

  return `${createAnimation(animation.from, animation.to, visible)} ${animationOptions}`
};

const Notifications: React.FC = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  // Mantine tokens like teal.6, or a colour already resolved from iconColor.
  const cssColor = (color: string) => {
    const [name, shade] = color.split('.');
    const swatch = theme.colors[name];
    if (swatch && shade) return swatch[Number(shade)] ?? color;
    return color;
  };

  useNuiEvent<NotificationProps>('notify', (data) => {
    if (!data.title && !data.description) return;

    const toastId = data.id?.toString();
    const duration = data.duration || 3000;

    let iconColor: string;
    let position = data.position || 'top-right';

    // Backwards compat with old notifications
    switch (position) {
      case 'top':
        position = 'top-center';
        break;
      case 'bottom':
        position = 'bottom-center';
        break;
    }

    if (!data.icon) {
      switch (data.type) {
        case 'error':
          data.icon = 'xmark';
          break;
        case 'success':
          data.icon = 'check';
          break;
        case 'warning':
          data.icon = 'exclamation';
          break;
        default:
          data.icon = 'info';
          break;
      }
    }

    if (!data.iconColor) {
      switch (data.type) {
        case 'error':
          iconColor = 'red.6';
          break;
        case 'success':
          iconColor = 'teal.6';
          break;
        case 'warning':
          iconColor = 'yellow.6';
          break;
        default:
          iconColor = 'blue.6';
          break;
      }
    } else {
      iconColor = tinycolor(data.iconColor).toRgbString();
    }

    toast.custom(
      (t) => (
        <Box
          sx={{
            animation: getAnimation(t.visible, position),
            ...data.style,
          }}
          className={`${classes.container}`}
        >
          <Group noWrap spacing={12} style={{ width: '100%', height: '100%', minWidth: 0 }}>
            {data.icon && (
              <Box
                className={classes.icon}
                style={{
                  color: cssColor(iconColor),
                  alignSelf: !data.alignIcon || data.alignIcon === 'center' ? 'center' : 'start',
                }}
              >
                <LibIcon icon={data.icon} fixedWidth color={cssColor(iconColor)} animation={data.iconAnimation} />
              </Box>
            )}
            <Stack spacing={0} className={classes.content}>
              {data.title && <Text className={classes.title}>{data.title}</Text>}
              {data.description && (
                <ReactMarkdown
                  components={MarkdownComponents}
                  className={`${!data.title ? classes.descriptionOnly : classes.description} description`}
                >
                  {data.description}
                </ReactMarkdown>
              )}
            </Stack>
          </Group>
        </Box>
      ),
      {
        id: toastId,
        duration: duration,
        position: position,
      }
    );
  });

  return <Toaster />;
};

export default Notifications;
