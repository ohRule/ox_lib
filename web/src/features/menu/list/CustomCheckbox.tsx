import { Checkbox, createStyles } from '@mantine/core';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'rgba(20, 20, 22, var(--ox-progress-alpha, 0.55))',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    '&:checked': {
      backgroundColor: 'rgba(var(--ox-progress-highlight), 0.72)',
      borderColor: 'rgba(var(--ox-progress-highlight), 0.95)',
    },
  },
  inner: {
    '> svg > path': {
      fill: '#e8e8e8',
    },
  },
}));

const CustomCheckbox: React.FC<{ checked: boolean }> = ({ checked }) => {
  const { classes } = useStyles();
  return (
    <Checkbox
      checked={checked}
      size="md"
      classNames={{ root: classes.root, input: classes.input, inner: classes.inner }}
    />
  );
};

export default CustomCheckbox;
