import type { Preview } from '@storybook/nextjs-vite';
import { sb } from 'storybook/test';
import '../app/globals.css';

// sb.mock() is only ever read out of this file (preview.ts), not story files -
// story files just configure return values via beforeEach + mocked().
// dashboard.ts is spied (real calculateDonationRunway/formatRunwayDays still
// run) so only dashboardRequest needs overriding per-story.
sb.mock(import('../lib/auth-client.ts'));
sb.mock(import('../lib/dashboard.ts'), { spy: true });

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
