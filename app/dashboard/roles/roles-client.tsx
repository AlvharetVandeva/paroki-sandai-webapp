"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRole, updateRole, deleteRole } from "@/actions/service-role.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Role = { id: number; name: string; description: string | null; _count?: { persons: number } };

export function RolesClient({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  function openCreate() {
    setEditRole(null);
    setName("");
    setDescription("");
    setOpen(true);
  }

  function openEdit(role: Role) {
    setEditRole(role);
    setName(role.name);
    setDescription(role.description ?? "");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { name, description: description || undefined };
    try {
      if (editRole) {
        await updateRole(editRole.id, data);
        toast.success("Role berhasil diperbarui");
      } else {
        await createRole(data);
        toast.success("Role berhasil ditambahkan");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Pastikan nama role unik.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (deleteId) {
      setLoading(true);
      try {
        await deleteRole(deleteId);
        toast.success("Role berhasil dihapus");
        setDeleteId(null);
        router.refresh();
      } catch {
        toast.error("Gagal menghapus. Role mungkin sedang digunakan.");
      } finally {
        setLoading(false);
      }
    }
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Nama Peran",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("description") ?? "-"}</div>,
    },
    {
      id: "count",
      accessorFn: (row) => row._count?.persons ?? 0,
      header: "Jumlah Petugas",
      cell: ({ row }) => <div>{row.getValue("count")} orang</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(role)} title="Edit Role">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(role.id)} title="Hapus Role">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peran Pelayanan</h1>
          <p className="text-muted-foreground">Master data jabatan (role) petugas pelayanan.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Role
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari peran..."
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
                  Tidak ada role yang ditemukan.
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRole ? "Edit Role" : "Tambah Role"}</DialogTitle>
            <DialogDescription>
              {editRole ? "Ubah nama atau deskripsi role." : "Buat role pelayanan baru."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Role</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Misal: Lektor, Prodiakon, Misdinar..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opsional" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(isOpen) => { if (!isOpen) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin? Jika role ini sedang digunakan oleh petugas, penghapusan mungkin gagal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
              {loading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
