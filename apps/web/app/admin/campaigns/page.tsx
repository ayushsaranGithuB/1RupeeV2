"use client";

import { useState, useEffect } from "react";

interface Campaign {
  id: string;
  title: string;
  slug: string;
  status: string;
  raised_amount: number;
  goal_amount: number;
}

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`/api/proxy/admin/campaigns`, {
          headers: { Authorization: "Bearer test-token" },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCampaigns(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          + Create Campaign
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                  No campaigns found
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => {
                const progress = campaign.goal_amount
                  ? Math.round(
                      (campaign.raised_amount / campaign.goal_amount) * 100,
                    )
                  : 0;
                return (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {campaign.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          campaign.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "DRAFT"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{progress}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
