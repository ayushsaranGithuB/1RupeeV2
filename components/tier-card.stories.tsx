import type { Meta, StoryObj } from '@storybook/react';
import { Check, Droplets } from 'lucide-react';
import { Button } from './ui/button';
import { MarkdownText } from './markdown-text';

// TierCard uses useRouter and useSession from Next.js/auth which don't work in Storybook.
// This is a simplified visual story showing the component structure.

interface TierCardPreviewProps {
  title: string;
  daily_amount: number;
  description?: string | null;
  features?: string[] | null;
  featured?: boolean;
}

function TierCardPreview({
  title,
  daily_amount,
  description,
  features,
  featured = false,
}: TierCardPreviewProps) {
  return (
    <div
      className={`
        relative rounded-3xl border transition-all duration-300

        ${
          featured
            ? "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] shadow-2xl lg:scale-105 py-10"
            : "bg-white border-neutral-200 py-8"
        }

        px-8
      `}
    >
      {/* Icon */}
      <div
        className={`
          mb-6 flex h-16 w-16 items-center justify-center rounded-full

          ${
            featured
              ? "bg-white text-neutral-950"
              : "bg-neutral-100 text-neutral-800"
          }
        `}
      >
        <Droplets size={28} />
      </div>

      {/* Badge */}
      <span
        className={`
          inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide

          ${
            featured
              ? "bg-white text-neutral-900"
              : "bg-neutral-900 text-white"
          }
        `}
      >
        {title}
      </span>

      {/* Price */}
      <div className="mt-6 flex items-start">
        <span className="mr-1 mt-2 text-xl">₹</span>
        <span className="text-6xl font-bold leading-none">
          {daily_amount.toLocaleString()}
        </span>
        <span className="ml-1 mt-6 text-sm text-neutral-400 tracking-wide">
          /day
        </span>
      </div>

      {/* Description */}
      <MarkdownText
        className={`mt-6 text-base leading-6 ${
          featured ? "text-neutral-300" : "text-neutral-600"
        }`}
      >
        {description || ""}
      </MarkdownText>

      {/* Features */}
      <ul className="mt-8 space-y-5">
        {(features ?? []).map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div
              className={`
                mt-0.5 flex h-5 w-5 items-center justify-center rounded-full

                ${
                  featured
                    ? "bg-white text-neutral-900"
                    : "bg-neutral-900 text-white"
                }
              `}
            >
              <Check size={12} strokeWidth={3} />
            </div>

            <span
              className={
                featured ? "text-neutral-100" : "text-neutral-700"
              }
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        disabled
        className={`
          mt-10 w-full rounded-full py-3 font-medium transition cursor-not-allowed

          ${
            featured
              ? "bg-white text-neutral-950 hover:bg-neutral-200"
              : "border border-neutral-300 hover:bg-neutral-100"
          }
        `}
      >
        Start with ₹{daily_amount.toLocaleString()} a day
      </Button>
    </div>
  );
}

const meta = {
  title: 'Components/TierCard',
  component: TierCardPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    daily_amount: {
      control: 'number',
    },
    description: {
      control: 'text',
    },
    featured: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof TierCardPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicTier: Story = {
  args: {
    title: 'Daily Supporter',
    daily_amount: 5,
    description: 'Support our cause with a small daily contribution.',
    features: ['Daily impact', 'Monthly updates', 'Community member'],
    featured: false,
  },
};

export const FeaturedTier: Story = {
  args: {
    title: 'Monthly Contributor',
    daily_amount: 10,
    description: 'Make a meaningful impact every month with sustained support.',
    features: [
      'Direct impact measurement',
      'Quarterly newsletters',
      'Exclusive community access',
      'Tax-deductible receipt',
    ],
    featured: true,
  },
};

export const PremiumTier: Story = {
  args: {
    title: 'Annual Partner',
    daily_amount: 50,
    description: 'Become a long-term partner in our mission to create lasting change.',
    features: [
      'Named recognition',
      'Annual impact report',
      'Priority support',
      'Partner badge',
      'Exclusive events',
    ],
    featured: false,
  },
};

export const MinimalTier: Story = {
  args: {
    title: 'Contributor',
    daily_amount: 2,
    features: [],
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <TierCardPreview
        title="Basic"
        daily_amount={5}
        description="Start small"
        features={['Monthly updates']}
      />
      <TierCardPreview
        title="Standard"
        daily_amount={10}
        description="Regular support"
        features={['Quarterly reports', 'Community access']}
        featured={true}
      />
      <TierCardPreview
        title="Premium"
        daily_amount={25}
        description="Deep support"
        features={['Named recognition', 'Priority support']}
      />
    </div>
  ),
};
