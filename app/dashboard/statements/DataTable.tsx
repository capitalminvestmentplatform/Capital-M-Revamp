"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getLoggedInUser } from "@/utils/client";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (id: string) => Promise<boolean> | boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  handleDelete,
}) => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  if (tableRows.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  return (
    <Table
      style={{
        fontSize: "13px",
        whiteSpace: "nowrap",
        width: "max-content",
        minWidth: "100%",
      }}
    >
      <TableHeader>
        <TableRow>
          {tableCols.map((col, index) => (
            <TableHead key={index}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableRows.map((row, index) => (
          <TableRow key={index}>
            {role === "Admin" && (
              <TableCell>
                {row.clientCode ? `${row.clientCode} ${row.username}` : "-"}
              </TableCell>
            )}
            <TableCell>{row.month ? row.month : "-"}</TableCell>
            <TableCell>{row.year ? row.year : "-"}</TableCell>

            <TableCell>
              {row.pdf ? (
                <Link
                  href={row.pdf}
                  target="_blank"
                  className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                >
                  Preview
                </Link>
              ) : (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  Not found
                </div>
              )}
            </TableCell>
            <TableCell className="">
              <div className="flex gap-2">
                {role === "Admin" && (
                  <>
                    <ConfirmModal
                      title="Delete Statement?"
                      description="Are you sure you want to delete this statement? This action cannot be undone."
                      onConfirm={() => handleDelete(row._id)}
                    >
                      <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </ConfirmModal>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
