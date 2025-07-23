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
      toast.success(response.message);
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    } finally {
    }
  };

  const sendEmail = async (id: string) => {
    try {
      const res = await fetch(`/api/send-email-to-user/${id}`, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);
    } catch (error) {
      setError((error as Error).message);
      toast.error((error as Error).message);
    }
  };
  return (
    <div>
      <div className="my-10 flex justify-end">
        <Link
          href={`${pathname}/add`}
          className={`bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md text-sm font-semibold`}
        >
          Add new user
        </Link>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">No users available</p>
      ) : (
        <DataTable
          tableCols={[
            "Client code",
            "Name",
            "Email",
            "Phone",
            "Role",
            // "Send Email",
            "Actions",
          ]}
          tableRows={users}
          handleDelete={handleDelete}
          sendEmail={sendEmail}
        />
      )}
    </div>
  );
};

export default UsersPage;
