"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleFormDialog from "./role-form-dialog";
import DeleteRoleDialog from "./delete-role-dialog";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Permission = { id: number; action: string; resource: string; description: string | null };
type RolePermission = { permission: Permission };
type Role = { id: number; name: string; description: string | null; permissions: RolePermission[] };

interface RbacRolesClientProps {
  roles: Role[];
  permissions: Permission[];
}

export function RbacRolesClient({ roles, permissions }: RbacRolesClientProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Nama Role",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("description") ?? "-"}</div>,
    },
    {
      id: "permCount",
      accessorFn: (row) => row.permissions.length,
      header: "Hak Akses",
      cell: ({ row }) => <div>{row.getValue("permCount")} akses diberikan</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex justify-end items-center gap-1">
            <RoleFormDialog permissions={permissions} role={role} />
            <DeleteRoleDialog roleId={role.id} roleName={role.name} />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: roles,
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
            placeholder="Cari nama role..."
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
