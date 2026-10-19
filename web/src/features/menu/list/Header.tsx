import { Box, createStyles, Text } from '@mantine/core';
import React from 'react';

const useStyles = createStyles(() => ({
  container: {
    textAlign: 'center',
    backgroundColor: 'rgb(var(--ox-progress-highlight))',
    height: '4.2vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  heading: {
    fontSize: '1.7vh',
    textTransform: 'uppercase',
    fontWeight: 600,
    fontFamily: 'Roboto, sans-serif',
    color: '#fff',
    letterSpacing: '0.04em',
  },
}));

const Header: React.FC<{ title: string }> = ({ title }) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <Text className={classes.heading}>{title}</Text>
    </Box>
  );
};

export default React.memo(Header);
