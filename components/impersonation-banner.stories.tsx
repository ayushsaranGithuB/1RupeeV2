import type { Meta, StoryObj } from '@storybook/react';

// Note: ImpersonationBanner requires useSession and auth hooks from Better Auth
// which don't work in Storybook. This story shows the visual structure for documentation.

const meta = {
  title: 'Components/ImpersonationBanner',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold p-6">ImpersonationBanner Component</h2>

      <div className="bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 flex items-center justify-center gap-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>
          Viewing as <strong>John Doe</strong> — admin impersonation session
        </span>
        <button className="bg-amber-950 text-amber-50 hover:bg-amber-900 px-3 py-1 rounded text-xs font-medium">
          Exit
        </button>
      </div>

      <div className="p-6 space-y-4">
        <p>
          <strong>Purpose:</strong> Sticky banner displayed when an admin is impersonating a user.
        </p>
        <div className="space-y-2">
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Displays the impersonated user's name</li>
            <li>Shows "admin impersonation session" label</li>
            <li>Exit button to stop impersonation</li>
            <li>Sticky positioning (stays at top when scrolling)</li>
            <li>Only shown when <code>session.impersonatedBy</code> is set</li>
          </ul>
        </div>
        <p>
          <strong>Note:</strong> This component requires Better Auth hooks which don't work in Storybook.
          It's best tested in the actual app during admin impersonation flows.
        </p>
      </div>
    </div>
  ),
};
