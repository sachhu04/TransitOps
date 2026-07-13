import React, { useState, useMemo } from "react";
import Head from "next/head";
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from "@tanstack/react-table";
import { Plus, Search, SlidersHorizontal, ChevronDown, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import useSWR, { mutate } from "swr";
import { exportToPDF } from "@/utils/pdfExport";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export type Vehicle = {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  type: string;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
  mileage: number;
  capacity: number;
  acquisitionCost: number;
  region: string;
  healthScore: number;
};

const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());

export default function Fleet() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [user, setUser] = useState<{name: string; role: string} | null>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const { data: vehicles, mutate: mutateVehicles } = useSWR<Vehicle[]>('/api/vehicles', fetcher);

  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleOpenAddDialog = () => {
    setSelectedVehicle(null);
    setFormData({
      registration: "",
      make: "",
      model: "",
      year: 2024,
      type: "",
      status: "AVAILABLE",
      mileage: 0,
      capacity: 0,
      acquisitionCost: 0,
      region: "",
    });
    setFormError("");
    setIsVehicleDialogOpen(true);
  };

  const handleOpenEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData(vehicle);
    setFormError("");
    setIsVehicleDialogOpen(true);
  };

  const handleOpenDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    const method = selectedVehicle ? "PUT" : "POST";
    const url = selectedVehicle ? `/api/vehicles/${selectedVehicle.id}` : "/api/vehicles";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save vehicle");
      }

      toast.success(`Vehicle ${selectedVehicle ? 'updated' : 'added'} successfully`);
      setIsVehicleDialogOpen(false);
      mutateVehicles();
      mutate('/api/dashboard');
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    try {
      const res = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete vehicle");
      }

      toast.success("Vehicle deleted successfully");
      setIsDeleteDialogOpen(false);
      mutateVehicles();
      mutate('/api/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update status");
      }
      
      toast.success("Status updated");
      mutateVehicles();
      mutate('/api/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns = useMemo<ColumnDef<Vehicle>[]>(() => {
    const cols: ColumnDef<Vehicle>[] = [
      {
        accessorKey: "registration",
        header: "Registration",
        cell: ({ row }) => <div className="font-medium text-primary">{row.getValue("registration")}</div>,
      },
      {
        accessorKey: "make",
        header: "Make & Model",
        cell: ({ row }) => <div>{row.original.make} {row.original.model}</div>,
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "region",
        header: "State",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge 
              variant="secondary"
              className={
                status === "AVAILABLE" ? "bg-success/10 text-success hover:bg-success/20" :
                status === "ON_TRIP" ? "bg-info/10 text-info hover:bg-info/20" :
                status === "IN_SHOP" ? "bg-warning/10 text-warning hover:bg-warning/20" :
                "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "mileage",
        header: "Odometer",
        cell: ({ row }) => <div>{((row.getValue("mileage") as number) || 0).toLocaleString()} km</div>,
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => <div>{((row.getValue("capacity") as number) || 0).toLocaleString()} kg</div>,
      },
      {
        accessorKey: "acquisitionCost",
        header: "Acquisition Cost",
        cell: ({ row }) => <div>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((row.getValue("acquisitionCost") as number) || 0)}</div>,
      }
    ];

    if (user?.role === 'FLEET_MANAGER') {
      cols.push({
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleOpenEditDialog(vehicle)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'AVAILABLE')}>AVAILABLE</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'ON_TRIP')}>ON_TRIP</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'IN_SHOP')}>IN_SHOP</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'RETIRED')}>RETIRED</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenDeleteDialog(vehicle)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Vehicle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      });
    }
    
    return cols;
  }, [user]);

  const table = useReactTable({
    data: Array.isArray(vehicles) ? vehicles : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  const handleExportPDF = () => {
    if (!vehicles || vehicles.length === 0) return;
    exportToPDF({
      title: "Fleet Registry",
      filename: "fleet_registry.pdf",
      headers: ['Registration', 'Make & Model', 'Type', 'State', 'Status'],
      data: vehicles.map((v: any) => [
        v.registration,
        `${v.make} ${v.model}`,
        v.type,
        v.region,
        v.status
      ])
    });
  };

  return (
    <>
      <Head>
        <title>Fleet | TransitOps</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Registry</h1>
            <p className="text-muted-foreground">Manage and track your entire fleet.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            {user?.role === 'FLEET_MANAGER' && (
              <Button onClick={handleOpenAddDialog}>
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            )}
          </div>
        </div>

        <Card className="p-0 border-0 shadow-sm sm:border sm:p-1 overflow-hidden bg-card">
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search registration, make, model, state..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" className="ml-auto w-full sm:w-auto" />}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                View
                <ChevronDown className="ml-2 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {vehicles ? "No results." : "Loading vehicles..."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </Card>
      </div>

      {/* Add / Edit Vehicle Dialog */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
            <DialogDescription>
              {selectedVehicle ? 'Update details for this vehicle in the fleet.' : 'Register a new vehicle into the system.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            {formError && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration">Registration No. (e.g., KA01AB4587)</Label>
                <Input 
                  id="registration" 
                  required 
                  pattern="^[A-Za-z]{2}[0-9]{2}[A-Za-z]{1,2}[0-9]{4}$"
                  title="Indian Vehicle Registration (e.g., KA01AB4587)"
                  value={formData.registration || ""}
                  onChange={(e) => setFormData({...formData, registration: e.target.value.toUpperCase()})}
                  placeholder="KA01AB4587"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Vehicle Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val as string})}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light Commercial">Light Commercial</SelectItem>
                    <SelectItem value="Medium Commercial">Medium Commercial</SelectItem>
                    <SelectItem value="Heavy Commercial">Heavy Commercial</SelectItem>
                    <SelectItem value="Passenger Commercial">Passenger Commercial</SelectItem>
                    <SelectItem value="Pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Manufacturer (Make)</Label>
                <Input 
                  id="make" 
                  required 
                  value={formData.make || ""}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  placeholder="e.g. Tata"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  required 
                  value={formData.model || ""}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="e.g. Ace Gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (kg)</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  required 
                  value={formData.capacity || ""}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Odometer (km)</Label>
                <Input 
                  id="mileage" 
                  type="number"
                  required 
                  value={formData.mileage || ""}
                  onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year" 
                  type="number"
                  required 
                  value={formData.year || ""}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || new Date().getFullYear()})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisitionCost">Acquisition Cost (₹)</Label>
                <Input 
                  id="acquisitionCost" 
                  type="number"
                  required 
                  value={formData.acquisitionCost || ""}
                  onChange={(e) => setFormData({...formData, acquisitionCost: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region (State)</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(val) => setFormData({...formData, region: val as string})}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kerala">Kerala</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Telangana">Telangana</SelectItem>
                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsVehicleDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : selectedVehicle ? "Update Vehicle" : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vehicle {selectedVehicle?.registration} from the database.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
