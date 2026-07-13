import { fn } from 'storybook/test';

export const useSession = fn(() => ({
  data: null,
  isPending: false,
  isRefetching: false,
  error: null,
  refetch: async () => {},
})).mockName('useSession');
