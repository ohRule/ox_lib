import { ActionIcon, Button, Divider, Drawer, Slider, Stack, Text, Tooltip } from '@mantine/core';
import { debugAlert } from './debug/alert';
import { debugContext } from './debug/context';
import { debugInput } from './debug/input';
import { debugMenu } from './debug/menu';
import { debugCustomNotification } from './debug/notification';
import { debugProgressbar } from './debug/progress';
import { debugTextUI } from './debug/textui';
import { debugSkillCheck } from './debug/skillcheck';
import { useEffect, useRef, useState } from 'react';
import { HOTBAR_GAP_VH } from '../progress/hotbarLayout';
import { debugRadial } from './debug/radial';
import LibIcon from '../../components/LibIcon';

const HOTBAR_SLOTS = 6;

/** Browser stand-in for the ox_inventory hotbar, using the same size and scale origin. */
const DevHotbar: React.FC<{ scale: number; hidden: boolean }> = ({ scale, hidden }) => {
  const slotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const publish = () => {
      // Same signal the inventory sends when the HUD hotbar is hidden.
      if (hidden) {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { action: 'hotbarLayout', data: { scale, active: false } },
          })
        );
        return;
      }

      const slots = slotsRef.current;
      if (!slots) return;

      const rect = slots.getBoundingClientRect();
      const gap = (HOTBAR_GAP_VH / 100) * window.innerHeight;

      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            action: 'hotbarLayout',
            data: {
              scale,
              bottom: Math.round(window.innerHeight - rect.top + gap),
              active: true,
            },
          },
        })
      );
    };

    publish();
    window.addEventListener('resize', publish);
    return () => window.removeEventListener('resize', publish);
  }, [scale, hidden]);

  if (hidden) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: '2vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={slotsRef}
        style={{
          display: 'flex',
          gap: '0.55vh',
          transform: `scale(${scale})`,
          transformOrigin: 'center bottom',
        }}
      >
        {Array.from({ length: HOTBAR_SLOTS }, (_, index) => (
          <div
            key={index}
            style={{
              width: '9.6vh',
              height: '9.6vh',
              boxSizing: 'border-box',
              background: 'rgba(20, 20, 22, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.45vh',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Dev: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const [hotbarScale, setHotbarScale] = useState(1);
  const [hotbarHidden, setHotbarHidden] = useState(false);

  return (
    <>
      <DevHotbar scale={hotbarScale} hidden={hotbarHidden} />
      <Tooltip label="Developer drawer" position="bottom">
        <ActionIcon
          onClick={() => setOpened(true)}
          radius="xl"
          variant="filled"
          color="orange"
          sx={{ position: 'absolute', bottom: 0, right: 0, width: 50, height: 50 }}
          size="xl"
          mr={50}
          mb={50}
        >
          <LibIcon icon="wrench" fontSize={24} />
        </ActionIcon>
      </Tooltip>

      <Drawer position="left" onClose={() => setOpened(false)} opened={opened} title="Developer drawer" padding="xl">
        <Stack>
          <Divider />
          <Button fullWidth onClick={() => debugInput()}>
            Open input dialog
          </Button>
          <Button fullWidth onClick={() => debugAlert()}>
            Open alert dialog
          </Button>
          <Divider />
          <Button fullWidth onClick={() => debugContext()}>
            Open context menu
          </Button>
          <Button fullWidth onClick={() => debugMenu()}>
            Open list menu
          </Button>
          <Button fullWidth onClick={() => debugRadial()}>
            Open radial menu
          </Button>
          <Divider />
          <Button fullWidth onClick={() => debugCustomNotification()}>
            Send notification
          </Button>
          <Divider />
          <Button fullWidth onClick={() => debugProgressbar()}>
            Activate progress bar
          </Button>
          <Button fullWidth onClick={() => setHotbarHidden((hidden) => !hidden)}>
            {hotbarHidden ? 'Enable hotbar' : 'Disable hotbar'}
          </Button>
          <Text size="sm">Hotbar scale {hotbarScale.toFixed(2)}</Text>
          <Slider
            min={0.75}
            max={1.35}
            step={0.01}
            value={hotbarScale}
            onChange={setHotbarScale}
            label={(value) => value.toFixed(2)}
          />
          <Divider />
          <Button fullWidth onClick={() => debugTextUI()}>
            Show TextUI
          </Button>
          <Divider />
          <Button fullWidth onClick={() => debugSkillCheck()}>
            Run skill check
          </Button>
          <Button fullWidth onClick={() => debugSkillCheck('bounce')}>
            Run bouncing skill check
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default Dev;
