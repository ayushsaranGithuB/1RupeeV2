import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ImagesSection } from './ImagesSection';

const meta = {
  title: 'Components/ImagesSection',
  component: ImagesSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ImagesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [logoUrl, setLogoUrl] = useState('');
    const [mobileHeroImage, setMobileHeroImage] = useState('');
    const [desktopHeroImage, setDesktopHeroImage] = useState('');

    return (
      <ImagesSection
        logoUrl={logoUrl}
        mobileHeroImage={mobileHeroImage}
        desktopHeroImage={desktopHeroImage}
        onLogoChange={setLogoUrl}
        onMobileHeroChange={setMobileHeroImage}
        onDesktopHeroChange={setDesktopHeroImage}
      />
    );
  },
};

export const WithImages: Story = {
  render: () => {
    const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1552664730-d307ca884978?w=200');
    const [mobileHeroImage, setMobileHeroImage] = useState('https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=300');
    const [desktopHeroImage, setDesktopHeroImage] = useState('https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=800');

    return (
      <ImagesSection
        logoUrl={logoUrl}
        mobileHeroImage={mobileHeroImage}
        desktopHeroImage={desktopHeroImage}
        onLogoChange={setLogoUrl}
        onMobileHeroChange={setMobileHeroImage}
        onDesktopHeroChange={setDesktopHeroImage}
      />
    );
  },
};
