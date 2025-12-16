import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Input } from '@interview/ui';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with various types and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The type of input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Pre-filled value',
    placeholder: 'Enter text...',
  },
};

// Interactive example with state
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-4">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type something..."
        />
        <p className="text-sm text-gray-600">
          Current value: <code>{value || '(empty)'}</code>
        </p>
      </div>
    );
  },
};

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input placeholder="Enter your name" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input type="email" placeholder="Enter your email" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <Input type="tel" placeholder="Enter your phone number" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Website</label>
        <Input type="url" placeholder="https://example.com" />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  ),
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input className="text-sm py-1 px-2" placeholder="Small input" />
      <Input placeholder="Default input" />
      <Input className="text-lg py-3 px-4" placeholder="Large input" />
    </div>
  ),
};

// Validation states
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Valid input"
          className="border-green-500 focus:border-green-500 focus:ring-green-500"
        />
        <p className="text-sm text-green-600 mt-1">✓ This looks good!</p>
      </div>
      <div>
        <Input
          placeholder="Invalid input"
          className="border-red-500 focus:border-red-500 focus:ring-red-500"
        />
        <p className="text-sm text-red-600 mt-1">✗ Please enter a valid value</p>
      </div>
      <div>
        <Input
          placeholder="Warning input"
          className="border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500"
        />
        <p className="text-sm text-yellow-600 mt-1">⚠ This might need attention</p>
      </div>
    </div>
  ),
};