"use client";

import { useState, useEffect } from "react";

interface NGO {
  id: string;
  name: string;
  slug: string;
  description: string;
  verification_status: string;
}

export default function NGOManagement() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchNgos();
  }, []);

  const fetchNgos = async () => {
    try {
      const res = await fetch(`/api/proxy/admin/ngos`, {
        headers: { Authorization: "Bearer test-token" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNgos(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch NGOs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/proxy/admin/ngos`, {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("NGO created successfully!");
        setFormData({ name: "", slug: "", description: "", email: "" });
        setShowForm(false);
        await fetchNgos();
      } else {
        setError(data.error || "Failed to create NGO");
      }
    } catch (err) {
      setError("Error creating NGO: " + String(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">NGO Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? "Cancel" : "+ Add NGO"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Create New NGO</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Organization Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="organization-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Organization description (min 10 chars)"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@organization.com"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Create NGO
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Slug
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
            ) : ngos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                  No NGOs found
                </td>
              </tr>
            ) : (
              ngos.map((ngo) => (
                <tr key={ngo.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ngo.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {ngo.slug}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ngo.verification_status === "VERIFIED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {ngo.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-800">
                      View
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
