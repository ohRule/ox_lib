import { Box, createStyles } from '@mantine/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import LibIcon from '../../../../components/LibIcon';

interface Props {
  icon: IconProp;
  canClose?: boolean;
  iconSize: number;
  handleClick: () => void;
}

const useStyles = createStyles((_theme, params: { canClose?: boolean }) => ({
  button: {
    width: '4.2vh',
    height: '4.2vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: params.canClose === false ? 'rgba(255, 255, 255, 0.35)' : '#fff',
    cursor: params.canClose === false ? 'default' : 'pointer',
  },
}));

const HeaderButton: React.FC<Props> = ({ icon, canClose, iconSize, handleClick }) => {
  const { classes } = useStyles({ canClose });

  return (
    <Box className={classes.button} onClick={canClose === false ? undefined : handleClick}>
      <LibIcon icon={icon} fontSize={iconSize} fixedWidth />
    </Box>
  );
};

export default HeaderButton;
