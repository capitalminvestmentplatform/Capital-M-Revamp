"use client";
import DataTable from "./DataTable";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const UsersPage = () => {
  const pathname = usePathname(); // Get the current path

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const users = response.data;
      setUsers(users);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="my-10 flex justify-end">
        <Link
          href={`${pathname}/add`}
          className="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md me-20"
        >
          Add new user
        </Link>
      </div>
      <DataTable
        tableCols={["Client code", "Name", "Email", "Phone", "Role", "Actions"]}
        tableRows={users}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default UsersPage;
