"use client";
import { getLoggedInUser, uploadFileToCloudinary } from "@/utils/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { AddStatementModal } from "@/app/components/modals/AddStatementModal";

const StatementsPage = () => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statements, setStatements] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchStatements();
    fetchUsers();
  }, []);

  const fetchStatements = async () => {
    try {
      const res = await fetch("/api/statements");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const statements = response.data;
      setStatements(statements);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");

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

  const handleAddStatement = async (data: any) => {
    try {
      const file = new File([data.pdf?.[0]], "statement.pdf", {
        type: "application/pdf",
      });
      let pdfUrl = "";

      if (file) {
        pdfUrl = (await uploadFileToCloudinary(file, "statements")) ?? "";
      }

      const payload = {
        userId: data.userId,
        month: data.month,
        year: +data.year,
        pdf: pdfUrl,
      };

      const res = await fetch(`/api/statements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      fetchStatements();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteStatement = async (id: string) => {
    try {
      const res = await fetch(`/api/statements/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      fetchStatements();

      return true;
    } catch (error) {
      return false;
    }
  };

  const filteredStatements =
    statements.length > 0
      ? statements.filter((receipt: any) => {
          if (isAdmin) return true; // Admin sees all
          return receipt.email === loggedInUser?.email; // Others see their own
        })
      : [];

  const tableCols =
    role === "Admin"
      ? ["Username", "Month", "Year", "Statement", "Action"]
      : ["Month", "Year", "Statement"];

  return (
    <div>
      <div className="my-10 flex justify-end">
        {isAdmin && (
          <AddStatementModal users={users} onSubmit={handleAddStatement} />
        )}
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : statements.length === 0 ? (
        <p className="text-center text-gray-500">No Statement available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredStatements || []}
          handleDelete={handleDeleteStatement}
        />
      )}
    </div>
  );
};

export default StatementsPage;
