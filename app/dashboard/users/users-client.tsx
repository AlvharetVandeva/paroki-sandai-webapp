"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssignRoleDialog from "./assign-role-dialog";
import UserFormDialog from "./user-form-dialog";
import DeleteUserDialog from "./delete-user-dialog";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Role = { id: number; name: string; description: string | null };
type UserRole = { role: Role };
type User = { id: string; name: string; email: string; userRoles: UserRole[] };

interface UsersClientProps {
  users: User[];
  allRoles: Role[];
  currentUserId: string;
}

export function UsersClient({ users, allRoles, currentUserId }: UsersClientProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      id: "roles",
      accessorFn: (row) => row.userRoles.map(ur => ur.role.name).join(", "),
      header: "Roles",
      cell: ({ row }) => {
        const ur = row.original.userRoles;
        return (
          <div className="flex flex-wrap gap-1">
            {ur.map((r) => (
              <Badge key={r.role.id} variant="secondary">
                {r.role.name}
              </Badge>
            ))}
            {ur.length === 0 && (
              <span className="text-xs text-muted-foreground italic">Tidak ada role</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end items-center gap-1">
            <AssignRoleDialog user={user} allRoles={allRoles} />
            <UserFormDialog user={user} />
            {user.id !== currentUserId && (
              <DeleteUserDialog userId={user.id} userName={user.name} />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari user atau email..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
