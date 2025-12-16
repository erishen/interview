import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button, Card, Input } from '@interview/ui';

const meta = {
  title: 'Examples/Component Combinations',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Examples showing how different components work together.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginForm: Story = {
  render: () => (
    <Card className="p-8 w-96">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" placeholder="Enter your email" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input type="password" placeholder="Enter your password" />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
        
        <Button className="w-full">Sign In</Button>
        
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </span>
        </div>
      </form>
    </Card>
  ),
};

export const ContactForm: Story = {
  render: () => (
    <Card className="p-8 w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
        <p className="text-gray-600">We'd love to hear from you</p>
      </div>
      
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <Input placeholder="John" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <Input placeholder="Doe" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" placeholder="john@example.com" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <Input placeholder="How can we help?" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Tell us more about your inquiry..."
          />
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1">
            Send Message
          </Button>
        </div>
      </form>
    </Card>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, John!</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export</Button>
          <Button>New Project</Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
          <div className="text-gray-600">Total Users</div>
          <div className="text-sm text-green-600 mt-1">+12% from last month</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">$12.5K</div>
          <div className="text-gray-600">Revenue</div>
          <div className="text-sm text-green-600 mt-1">+8% from last month</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">456</div>
          <div className="text-gray-600">Orders</div>
          <div className="text-sm text-red-600 mt-1">-3% from last month</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">98.5%</div>
          <div className="text-gray-600">Uptime</div>
          <div className="text-sm text-green-600 mt-1">+0.2% from last month</div>
        </Card>
      </div>
      
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input type="search" placeholder="Search projects..." />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Filter</Button>
            <Button variant="outline" size="sm">Sort</Button>
          </div>
        </div>
        
        {/* Project List */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Project {i}</h3>
                <p className="text-sm text-gray-600">Last updated 2 hours ago</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  ),
};