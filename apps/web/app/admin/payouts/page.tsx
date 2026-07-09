"use client";

import { useState, useEffect } from "react";

interface Payout {
  id: string;
  ngo_id: string;
  status: string;
  total_amount: number;
  period_start: string;
  period_end: string;
}

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/admin/payouts`, {
          headers: { Authorization: "Bearer test-token" },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPayouts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch payouts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payout Management</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          + Generate Payout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Period
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
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
            ) : payouts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                  No payouts found
                </td>
              </tr>
            ) : (
              payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(payout.period_start).toLocaleDateString()} -{" "}
                    {new Date(payout.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{payout.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        payout.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : payout.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-800">
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
