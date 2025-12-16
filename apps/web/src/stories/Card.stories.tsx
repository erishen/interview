import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card } from '@interview/ui';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component for displaying content in a contained format.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    children: {
      control: 'text',
      description: 'The content of the card',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a basic card with some content.',
  },
};

export const WithPadding: Story = {
  args: {
    className: 'p-6',
    children: 'This card has custom padding applied.',
  },
};

export const WithContent: Story = {
  args: {
    children: '',
  },
  render: () => (
    <Card className="p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Card Title</h3>
      <p className="text-gray-600 mb-4">
        This is a more complex card with a title, description, and action button.
      </p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Action
      </button>
    </Card>
  ),
};

export const ProductCard: Story = {
  args: {
    children: '',
  },
  render: () => (
    <Card className="p-6 max-w-sm">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-gray-500">Product Image</span>
      </div>
      <h3 className="text-xl font-bold mb-2">Product Name</h3>
      <p className="text-gray-600 mb-4">
        A brief description of the product and its key features.
      </p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-green-600">$99.99</span>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add to Cart
        </button>
      </div>
    </Card>
  ),
};

export const UserProfileCard: Story = {
  args: {
    children: '',
  },
  render: () => (
    <Card className="p-6 max-w-sm">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
          JD
        </div>
        <div>
          <h3 className="font-semibold">John Doe</h3>
          <p className="text-gray-600 text-sm">Software Engineer</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">
        Passionate developer with 5+ years of experience in React and TypeScript.
      </p>
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Follow
        </button>
        <button className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50">
          Message
        </button>
      </div>
    </Card>
  ),
};

export const StatsCard: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
        <div className="text-gray-600">Total Users</div>
      </Card>
      <Card className="p-6 text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">$12.5K</div>
        <div className="text-gray-600">Revenue</div>
      </Card>
      <Card className="p-6 text-center">
        <div className="text-3xl font-bold text-purple-600 mb-2">98.5%</div>
        <div className="text-gray-600">Uptime</div>
      </Card>
    </div>
  ),
};