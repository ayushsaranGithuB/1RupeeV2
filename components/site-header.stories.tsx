import type { Meta, StoryObj } from '@storybook/react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar } from './avatar';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'FAQ', href: '/faq' },
];

interface SiteHeaderPreviewProps {
  isSignedIn?: boolean;
  userName?: string;
}

function SiteHeaderPreview({ isSignedIn = false, userName = 'John Doe' }: SiteHeaderPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-bold text-slate-900"
        >
          <Image src="/logo.png" alt="1Rupee Logo" width={128} height={57} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-kalam',
                'text-lg font-medium text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary))]/80',
              )}
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-900">
              <Avatar name={userName} size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--primary))]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--primary))]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-slate-600 hover:text-[hsl(var(--primary))]"
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <Button variant="outline" className="w-full">
              Sign out
            </Button>
          ) : (
            <>
              <Link href="/sign-in" className="block">
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up" className="block">
                <Button className="w-full">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const meta = {
  title: 'Components/SiteHeader',
  component: SiteHeaderPreview,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isSignedIn: {
      control: 'boolean',
    },
    userName: {
      control: 'text',
    },
  },
} satisfies Meta<typeof SiteHeaderPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  args: {
    isSignedIn: false,
  },
};

export const SignedIn: Story = {
  args: {
    isSignedIn: true,
    userName: 'John Doe',
  },
};

export const SignedInDifferentName: Story = {
  args: {
    isSignedIn: true,
    userName: 'Priya Sharma',
  },
};
