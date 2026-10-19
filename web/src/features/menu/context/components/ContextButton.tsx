import { Box, createStyles, Group, HoverCard, Image, Progress, Stack, Text } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { ContextMenuProps, Option } from '../../../../typings';
import { fetchNui } from '../../../../utils/fetchNui';
import { isIconUrl } from '../../../../utils/isIconUrl';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import MarkdownComponents from '../../../../config/MarkdownComponents';
import LibIcon from '../../../../components/LibIcon';

const openMenu = (id: string | undefined) => {
  fetchNui<ContextMenuProps>('openContext', { id: id, back: false });
};

const clickContext = (id: string) => {
  fetchNui('clickContext', id);
};

const useStyles = createStyles((_theme, params: { disabled?: boolean; readOnly?: boolean }) => ({
  button: {
    height: 'fit-content',
    width: '100%',
    padding: '0.9vh 1.2vh',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    color: params.disabled ? 'rgba(232, 232, 232, 0.35)' : '#e8e8e8',
    fontFamily: 'Roboto, sans-serif',
    '&:hover': {
      backgroundColor: params.disabled || params.readOnly ? 'transparent' : 'rgba(var(--ox-progress-highlight), 0.45)',
      cursor: params.disabled || params.readOnly ? 'default' : 'pointer',
    },
  },
  iconImage: {
    maxWidth: '25px',
  },
  description: {
    color: params.disabled ? 'rgba(232, 232, 232, 0.35)' : 'rgba(232, 232, 232, 0.65)',
    fontSize: '1.15vh',
    fontFamily: 'Roboto, sans-serif',
  },
  dropdown: {
    padding: 10,
    color: '#e8e8e8',
    fontSize: 14,
    fontFamily: 'Roboto, sans-serif',
    maxWidth: 256,
    width: 'fit-content',
    backgroundColor: 'rgba(18, 18, 20, 0.92)',
    borderRadius: '0.45vh',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  buttonStack: {
    gap: 4,
    flex: '1',
  },
  buttonGroup: {
    gap: 4,
    flexWrap: 'nowrap',
  },
  buttonIconContainer: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitleText: {
    overflowWrap: 'break-word',
    fontSize: '1.4vh',
    fontFamily: 'Roboto, sans-serif',
    '& p, & h1, & h2, & h3': {
      margin: 0,
      fontSize: 'inherit',
      fontWeight: 'inherit',
      color: 'inherit',
      lineHeight: 1.3,
    },
  },
  buttonArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 25,
  },
}));

const ContextButton: React.FC<{
  option: [string, Option];
}> = ({ option }) => {
  const button = option[1];
  const buttonKey = option[0];
  const { classes } = useStyles({ disabled: button.disabled, readOnly: button.readOnly });

  return (
    <>
      <HoverCard
        position="right-start"
        disabled={button.disabled || !(button.metadata || button.image)}
        openDelay={200}
      >
        <HoverCard.Target>
          <Box
            className={classes.button}
            onClick={() =>
              !button.disabled && !button.readOnly
                ? button.menu
                  ? openMenu(button.menu)
                  : clickContext(buttonKey)
                : null
            }
          >
            <Group position="apart" w="100%" noWrap>
              <Stack className={classes.buttonStack}>
                {(button.title || Number.isNaN(+buttonKey)) && (
                  <Group className={classes.buttonGroup}>
                    {button?.icon && (
                      <Stack className={classes.buttonIconContainer}>
                        {typeof button.icon === 'string' && isIconUrl(button.icon) ? (
                          <img src={button.icon} className={classes.iconImage} alt="Missing img" />
                        ) : (
                          <LibIcon
                            icon={button.icon as IconProp}
                            fixedWidth
                            size="lg"
                            style={{ color: button.iconColor }}
                            animation={button.iconAnimation}
                          />
                        )}
                      </Stack>
                    )}
                    <Text className={classes.buttonTitleText}>
                      <ReactMarkdown components={MarkdownComponents}>{button.title || buttonKey}</ReactMarkdown>
                    </Text>
                  </Group>
                )}
                {button.description && (
                  <Text className={classes.description}>
                    <ReactMarkdown components={MarkdownComponents}>{button.description}</ReactMarkdown>
                  </Text>
                )}
                {button.progress !== undefined && (
                  <Progress
                    value={button.progress}
                    size="sm"
                    color={button.colorScheme || 'gray'}
                    styles={{
                      root: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
                      bar: button.colorScheme ? {} : { backgroundColor: 'rgb(var(--ox-progress-highlight))' },
                    }}
                  />
                )}
              </Stack>
              {(button.menu || button.arrow) && button.arrow !== false && (
                <Stack className={classes.buttonArrowContainer}>
                  <LibIcon icon="chevron-right" fixedWidth />
                </Stack>
              )}
            </Group>
          </Box>
        </HoverCard.Target>
        <HoverCard.Dropdown className={classes.dropdown}>
          {button.image && <Image src={button.image} />}
          {Array.isArray(button.metadata) ? (
            button.metadata.map(
              (
                metadata: string | { label: string; value?: any; progress?: number; colorScheme?: string },
                index: number
              ) => (
                <>
                  <Text key={`context-metadata-${index}`}>
                    {typeof metadata === 'string' ? `${metadata}` : `${metadata.label}: ${metadata?.value ?? ''}`}
                  </Text>

                  {typeof metadata === 'object' && metadata.progress !== undefined && (
                    <Progress
                      value={metadata.progress}
                      size="sm"
                      color={metadata.colorScheme || button.colorScheme || 'gray'}
                      styles={{
                        root: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
                        bar:
                          metadata.colorScheme || button.colorScheme
                            ? {}
                            : { backgroundColor: 'rgb(var(--ox-progress-highlight))' },
                      }}
                    />
                  )}
                </>
              )
            )
          ) : (
            <>
              {typeof button.metadata === 'object' &&
                Object.entries(button.metadata).map((metadata: { [key: string]: any }, index) => (
                  <Text key={`context-metadata-${index}`}>
                    {metadata[0]}: {metadata[1]}
                  </Text>
                ))}
            </>
          )}
        </HoverCard.Dropdown>
      </HoverCard>
    </>
  );
};

export default ContextButton;
