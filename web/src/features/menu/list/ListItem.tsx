import { Box, createStyles, Group, Progress, Stack, Text } from '@mantine/core';
import React, { forwardRef } from 'react';
import CustomCheckbox from './CustomCheckbox';
import type { MenuItem } from '../../../typings';
import { isIconUrl } from '../../../utils/isIconUrl';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import LibIcon from '../../../components/LibIcon';

interface Props {
  item: MenuItem;
  index: number;
  scrollIndex: number;
  checked: boolean;
  selected: boolean;
}

const useStyles = createStyles((theme, params: { iconColor?: string }) => ({
  buttonContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    minHeight: '3.6vh',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    scrollMargin: 0,
    '&.selected, &:focus': {
      backgroundColor: 'rgba(var(--ox-progress-highlight), 0.45)',
      outline: 'none',
    },
  },
  iconImage: {
    maxWidth: '2.2vh',
    maxHeight: '2.2vh',
  },
  buttonWrapper: {
    padding: '0.45vh 1.2vh',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.2vh',
    height: '2.2vh',
    flexShrink: 0,
  },
  icon: {
    fontSize: '1.8vh',
    color: params.iconColor || '#e8e8e8',
  },
  label: {
    color: '#e8e8e8',
    textTransform: 'uppercase',
    fontSize: '1.15vh',
    verticalAlign: 'middle',
    fontFamily: 'Roboto, sans-serif',
  },
  value: {
    color: '#e8e8e8',
    fontSize: '1.4vh',
    fontFamily: 'Roboto, sans-serif',
  },
  centered: {
    color: '#e8e8e8',
    fontSize: '1.5vh',
    fontFamily: 'Roboto, sans-serif',
    textAlign: 'center',
    flex: 1,
  },
  chevronIcon: {
    fontSize: '1.2vh',
    color: '#e8e8e8',
  },
  scrollIndexValue: {
    color: '#e8e8e8',
    textTransform: 'uppercase',
    fontSize: '1.2vh',
    fontFamily: 'Roboto, sans-serif',
  },
  progressStack: {
    width: '100%',
    marginRight: 5,
  },
  progressLabel: {
    verticalAlign: 'middle',
    marginBottom: 3,
    color: '#e8e8e8',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '1.15vh',
    textTransform: 'uppercase',
  },
}));

const ListItem = forwardRef<Array<HTMLDivElement | null>, Props>(({ item, index, scrollIndex, checked, selected }, ref) => {
  const { classes } = useStyles({ iconColor: item.iconColor });

  return (
    <Box
      tabIndex={index}
      className={`${classes.buttonContainer}${selected ? ' selected' : ''}`}
      key={`item-${index}`}
      ref={(element: HTMLDivElement) => {
        if (ref)
          // @ts-ignore i cba
          return (ref.current = [...ref.current, element]);
      }}
    >
      <Group spacing={15} noWrap className={classes.buttonWrapper}>
        {item.icon && (
          <Box className={classes.iconContainer}>
            {typeof item.icon === 'string' && isIconUrl(item.icon) ? (
              <img src={item.icon} alt="Missing image" className={classes.iconImage} />
            ) : (
              <LibIcon
                icon={item.icon as IconProp}
                className={classes.icon}
                fixedWidth
                animation={item.iconAnimation}
              />
            )}
          </Box>
        )}
        {Array.isArray(item.values) ? (
          <Group position="apart" w="100%">
            <Stack spacing={0} justify="space-between">
              <Text className={classes.label}>{item.label}</Text>
              <Text className={classes.value}>
                {typeof item.values[scrollIndex] === 'object'
                  ? // @ts-ignore for some reason even checking the type TS still thinks it's a string
                    item.values[scrollIndex].label
                  : item.values[scrollIndex]}
              </Text>
            </Stack>
            <Group spacing={1} position="center">
              <LibIcon icon="chevron-left" className={classes.chevronIcon} />
              <Text className={classes.scrollIndexValue}>
                {scrollIndex + 1}/{item.values.length}
              </Text>
              <LibIcon icon="chevron-right" className={classes.chevronIcon} />
            </Group>
          </Group>
        ) : item.checked !== undefined ? (
          <Group position="apart" w="100%">
            <Text className={classes.value}>{item.label}</Text>
            <CustomCheckbox checked={checked}></CustomCheckbox>
          </Group>
        ) : item.progress !== undefined ? (
          <Stack className={classes.progressStack} spacing={0}>
            <Text className={classes.progressLabel}>{item.label}</Text>
            <Progress
              value={item.progress}
              color={item.colorScheme || 'gray'}
              styles={{
                root: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
                bar: item.colorScheme ? {} : { backgroundColor: 'rgb(var(--ox-progress-highlight))' },
              }}
            />
          </Stack>
        ) : (
          <>
            <Text className={classes.centered}>{item.label}</Text>
            {item.icon && <Box className={classes.iconContainer} />}
          </>
        )}
      </Group>
    </Box>
  );
});

export default React.memo(ListItem);
