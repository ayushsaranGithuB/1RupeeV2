"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  name: string;
  status?: string;
  created_at?: string;
}

interface SearchResponse {
  success: boolean;
  data?: {
    users: User[];
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

const ITEMS_PER_PAGE = 10;

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"email" | "name">("email");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!hasSearched) {
      loadUsers();
    }
  }, []);

  const loadUsers = async (
    page = 1,
    term = "",
    type: "email" | "name" = "email",
  ) => {
    setLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: offset.toString(),
      });

      if (term.trim()) {
        if (type === "email") {
          params.append("email", term);
        } else {
          params.append("name", term);
        }
      }

      const response = await fetch(`/api/proxy/admin/users/search?${params}`, {
        method: "GET",
        headers: { Authorization: "Bearer test-token" },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as SearchResponse;

      if (data.success && data.data?.users) {
        setUsers(data.data.users);
        setTotalUsers(data.data.total);
        setCurrentPage(page);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    loadUsers(1, searchTerm, searchType);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchType("email");
    setHasSearched(false);
    setCurrentPage(1);
    loadUsers(1, "", "email");
  };

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Search Users</h2>
        <div className="flex gap-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "email" | "name")}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="email">Search by Email</option>
            <option value="name">Search by Name</option>
          </select>
          <input
            type="text"
            placeholder={`Enter ${searchType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          {hasSearched && (
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
          {hasSearched ? "No users found" : "Loading users..."}
        </div>
      )}

      {users.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.status || "active"}</TableCell>
                  <TableCell>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)} of{" "}
              {totalUsers} users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() =>
                  loadUsers(currentPage - 1, searchTerm, searchType)
                }
              >
                Previous
              </Button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= totalPages || loading}
                onClick={() =>
                  loadUsers(currentPage + 1, searchTerm, searchType)
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white p-6 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
}
