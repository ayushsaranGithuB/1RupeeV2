import type { Meta, StoryObj } from '@storybook/react';
import { CampaignGrid } from './campaign-grid';
import type { PublicCampaign } from '@/lib/public';

const meta = {
  title: 'Components/CampaignGrid',
  component: CampaignGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CampaignGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCampaigns: PublicCampaign[] = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    slug: 'clean-water',
    description: 'Bringing clean drinking water to rural villages',
    category: 'health',
    raised_amount: 5000,
    goal_amount: 10000,
    is_active: true,
    desktop_hero_image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500',
    mobile_hero_image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400',
    supporter_count: 45,
    created_at: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Education for All',
    slug: 'education-all',
    description: 'Building schools and providing education to underprivileged children',
    category: 'education',
    raised_amount: 8000,
    goal_amount: 12000,
    is_active: true,
    desktop_hero_image: 'https://images.unsplash.com/photo-1427504494785-cdccb2e8b9a3?w=500',
    mobile_hero_image: 'https://images.unsplash.com/photo-1427504494785-cdccb2e8b9a3?w=400',
    supporter_count: 62,
    created_at: new Date('2024-02-10'),
  },
  {
    id: '3',
    title: 'Healthcare Access',
    slug: 'healthcare-access',
    description: 'Mobile clinics providing healthcare to remote areas',
    category: 'health',
    raised_amount: 3000,
    goal_amount: 8000,
    is_active: true,
    desktop_hero_image: 'https://images.unsplash.com/photo-1631217b5f58-c62d4da0c49f?w=500',
    mobile_hero_image: 'https://images.unsplash.com/photo-1631217b5f58-c62d4da0c49f?w=400',
    supporter_count: 28,
    created_at: new Date('2024-03-05'),
  },
];

export const MultipleCampaigns: Story = {
  args: {
    campaigns: sampleCampaigns,
  },
};

export const SingleCampaign: Story = {
  args: {
    campaigns: [sampleCampaigns[0]],
  },
};

export const Empty: Story = {
  args: {
    campaigns: [],
  },
};

export const EmptyWithCustomMessage: Story = {
  args: {
    campaigns: [],
    emptyMessage: 'Currently no campaigns are accepting pledges. Please visit again soon!',
  },
};

export const LargeCampaignList: Story = {
  args: {
    campaigns: [
      ...sampleCampaigns,
      ...sampleCampaigns.map((c, i) => ({
        ...c,
        id: `${c.id}-dup-${i}`,
        title: `${c.title} #${i + 2}`,
      })),
    ],
  },
};
