import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '../table';

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <div className="w-full overflow-auto">
      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">John Doe</td>
            <td className="p-2">john@example.com</td>
            <td className="p-2">Active</td>
          </tr>
          <tr>
            <td className="p-2">Jane Smith</td>
            <td className="p-2">jane@example.com</td>
            <td className="p-2">Active</td>
          </tr>
          <tr>
            <td className="p-2">Bob Johnson</td>
            <td className="p-2">bob@example.com</td>
            <td className="p-2">Inactive</td>
          </tr>
        </tbody>
      </Table>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div className="w-full overflow-auto">
      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Item</th>
            <th className="text-left p-2">Quantity</th>
            <th className="text-left p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Product A</td>
            <td className="p-2">5</td>
            <td className="p-2">₹100</td>
          </tr>
          <tr>
            <td className="p-2">Product B</td>
            <td className="p-2">3</td>
            <td className="p-2">₹200</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="p-2 font-bold">Total</td>
            <td className="p-2 font-bold">₹800</td>
          </tr>
        </tfoot>
      </Table>
    </div>
  ),
};
