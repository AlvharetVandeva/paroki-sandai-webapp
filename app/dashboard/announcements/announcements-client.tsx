"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteAnnouncement } from "@/actions/announcement.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Ann = { id: number; title: string; content: string; createdAt: Date };

export function AnnouncementsClient({ announcements }: { announcements: Ann[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  async function handleDelete() {
    if (deleteId) {
      const result = await deleteAnnouncement(deleteId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pengumuman berhasil dihapus!");
      }
      setDeleteId(null);
      router.refresh();
    }
  }

  const columns: ColumnDef<Ann>[] = [
    {
      accessorKey: "title",
      header: "Judul Pengumuman",
      cell: ({ row }) => {
        const a = row.original;
        const link = "/dashboard/announcements/" + a.id;
        return (
          <Link href={link} className="font-medium hover:underline">
            {row.getValue("title")}
          </Link>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Dibuat",
      cell: ({ row }) => {
        const d = new Date(row.getValue("createdAt"));
        return (
          <span className="text-muted-foreground">
            {d.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const a = row.original;
        const detailLink = "/dashboard/announcements/" + a.id;
        const editLink = "/dashboard/announcements/" + a.id + "/edit";
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" render={<Link href={detailLink} />} title="Lihat Detail" nativeButton={false}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" render={<Link href={editLink} />} title="Edit" nativeButton={false}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)} title="Hapus">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: announcements,
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
          <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
          <p className="text-muted-foreground">Kelola pengumuman singkat untuk umat.</p>
        </div>
        <Button render={<Link href="/dashboard/announcements/create" />} nativeButton={false}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Pengumuman
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pengumuman..."
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
                  Tidak ada pengumuman ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengumuman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
