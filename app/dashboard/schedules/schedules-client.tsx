"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Search, Plus } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteScheduleButton } from "./delete-schedule-button";

type Schedule = {
  id: number;
  title: string;
  startAt: Date;
  location: string;
};

interface SchedulesClientProps {
  data: Schedule[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function SchedulesClient({ data, canCreate, canUpdate, canDelete }: SchedulesClientProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Schedule>[] = [
    {
      accessorKey: "title",
      header: "Kegiatan",
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "startAt",
      header: "Tanggal",
      cell: ({ row }) => {
        const date = new Date(row.getValue("startAt"));
        return (
          <span>
            {date.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Lokasi",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" render={<Link href={`/dashboard/schedules/${s.id}`} />} nativeButton={false} title="Lihat Detail">
              <Eye className="h-4 w-4" />
            </Button>
            {canUpdate && (
              <Button variant="ghost" size="icon" render={<Link href={`/dashboard/schedules/${s.id}/edit`} />} nativeButton={false} title="Edit Jadwal">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canDelete && <DeleteScheduleButton id={s.id} title={s.title} />}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jadwal Pelayanan</h1>
          <p className="text-muted-foreground">Kelola jadwal misa dan kegiatan pelayanan.</p>
        </div>
        {canCreate && (
          <Button render={<Link href="/dashboard/schedules/create" />} nativeButton={false}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
          </Button>
        )}
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari jadwal..."
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
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

