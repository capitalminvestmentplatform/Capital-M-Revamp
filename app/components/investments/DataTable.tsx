import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

import React from "react";
import { getLoggedInUser } from "@/utils/client";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (userId: string) => void;
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
    <Table>
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
            <TableCell>{row.productId ? row.productId : "-"}</TableCell>
            <TableCell>
              <Link
                href={`/dashboard/investments/${row._id}`}
                className="text-blue-500 hover:underline"
              >
                {row.title ? row.title : "-"}
              </Link>
            </TableCell>
            <TableCell>{row.category ? row.category : "-"}</TableCell>
            <TableCell>
              {row.expectedValue
                ? `AED ${row.expectedValue.toLocaleString()}`
                : "-"}
            </TableCell>
            <TableCell className="capitalize">
              {row.investmentDuration ? `${row.investmentDuration} years` : "-"}
            </TableCell>
            <TableCell>{row.status ? "Active" : "InActive"}</TableCell>
            <TableCell className="flex gap-2">
              {role === "Admin" && (
                <>
                  <Trash
                    className="cursor-pointer"
                    size={16}
                    onClick={() => handleDelete(row._id)}
                  />{" "}
                  <Link href={`/dashboard/investments/${row._id}/edit`}>
                    <Pencil className="cursor-pointer" size={16} />
                  </Link>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
