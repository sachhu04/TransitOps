import React, { useState, useMemo } from "react";
import Head from "next/head";
import { Plus, Search, MoreVertical, ShieldAlert, Filter, Download } from "lucide-react";
import useSWR from "swr";
import { exportToPDF } from "@/utils/pdfExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(async res => {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'An error occurred');
  }
  return res.json();
});

export default function Drivers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [user, setUser] = useState<{name: string; role: string} | null>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const canManage = user?.role === 'FLEET_MANAGER' || user?.role === 'SAFETY_OFFICER';
  
  const queryUrl = `/api/drivers?search=${encodeURIComponent(search)}&status=${statusFilter}&sort=${sortBy}`;
  const { data: drivers, mutate, error } = useSWR(queryUrl, fetcher);
  const { data: dashboardData } = useSWR('/api/dashboard', fetcher);
  const displayDrivers = Array.isArray(drivers) ? drivers : [];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "",
    licenseExpiry: "",
    contactNumber: "",
    safetyScore: 100,
    status: "AVAILABLE"
  });

  const handleOpenEdit = (driver: any) => {
    let parsedAvatar = { contact: "", category: "" };
    try {
      if (driver.avatar) parsedAvatar = JSON.parse(driver.avatar);
    } catch(e) {}
    
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: parsedAvatar.category || "",
      licenseExpiry: new Date(driver.licenseExpiry).toISOString().split('T')[0],
      contactNumber: parsedAvatar.contact || "",
      safetyScore: driver.safetyScore,
      status: driver.status
    });
    setSelectedDriver(driver);
    setIsEditOpen(true);
  };

  const handleOpenView = (driver: any) => {
    setSelectedDriver(driver);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (driver: any) => {
    setSelectedDriver(driver);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditOpen ? `/api/drivers/${selectedDriver.id}` : `/api/drivers`;
    const method = isEditOpen ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save driver');
      
      toast.success(isEditOpen ? 'Driver updated' : 'Driver added');
      mutate();
      setIsAddOpen(false);
      setIsEditOpen(false);
      setFormData({ name: "", licenseNumber: "", licenseCategory: "", licenseExpiry: "", contactNumber: "", safetyScore: 100, status: "AVAILABLE" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedDriver) return;
    try {
      const res = await fetch(`/api/drivers/${selectedDriver.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete driver');
      
      toast.success('Driver deleted');
      mutate();
      setIsDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const isLicenseExpired = (expiryStr: string) => {
    return new Date(expiryStr) < new Date();
  };

  const handleExportPDF = () => {
    if (!drivers || drivers.length === 0) return;
    exportToPDF({
      title: "Driver Directory",
      filename: "driver_directory.pdf",
      orientation: "landscape",
      headers: ['Name', 'Contact', 'License No.', 'Category', 'Safety Score', 'Status'],
      data: drivers.map((d: any) => [
        d.name,
        d.contactNumber,
        d.licenseNumber,
        d.licenseCategory,
        String(d.safetyScore),
        d.status
      ])
    });
  };

  return (
    <>
      <Head>
        <title>Drivers | TransitOps</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Driver Directory</h1>
            <p className="text-muted-foreground">Manage your driving staff and monitor safety scores.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            {canManage && (
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <div onClick={() => setFormData({ name: "", licenseNumber: "", licenseCategory: "", licenseExpiry: "", contactNumber: "", safetyScore: 100, status: "AVAILABLE" })} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Driver
                  </div>
                </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSave}>
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Number</label>
                        <Input required placeholder="+91XXXXXXXXXX" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">License Number</label>
                        <Input required placeholder="MH1420210009823" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">License Category</label>
                        <Input required placeholder="LMV, HMV" value={formData.licenseCategory} onChange={e => setFormData({...formData, licenseCategory: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">License Expiry</label>
                        <Input type="date" required value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Safety Score</label>
                        <Input type="number" step="0.1" min="0" max="100" value={formData.safetyScore} onChange={e => setFormData({...formData, safetyScore: parseFloat(e.target.value)})} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as string})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                            <SelectItem value="ON_TRIP">ON_TRIP</SelectItem>
                            <SelectItem value="OFF_DUTY">OFF_DUTY</SelectItem>
                            <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalDrivers || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{dashboardData?.availableDrivers || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-info">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">On Trip</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{dashboardData?.driversOnDuty || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Off Duty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{dashboardData?.offDutyDrivers || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{dashboardData?.suspendedDrivers || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search drivers by name or license..." 
              className="pl-10 bg-card"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as string)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{statusFilter === 'ALL' ? 'All Statuses' : statusFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
              <SelectItem value="ON_TRIP">ON_TRIP</SelectItem>
              <SelectItem value="OFF_DUTY">OFF_DUTY</SelectItem>
              <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={v => setSortBy(v as string)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="safetyScore">Safety Score</SelectItem>
              <SelectItem value="licenseExpiry">License Expiry</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDrivers.map((driver: any) => {
            const expired = isLicenseExpired(driver.licenseExpiry);
            
            return (
            <Card key={driver.id} className={`overflow-hidden ${driver.status === 'SUSPENDED' || expired ? 'border-destructive/50' : ''}`}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={driver.avatar && driver.avatar.startsWith('http') ? driver.avatar : undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">{driver.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{driver.name}</h3>
                        <p className="text-sm text-muted-foreground">{driver.licenseNumber}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenView(driver)}>View Profile</DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuItem onClick={() => handleOpenEdit(driver)}>Edit Driver</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleOpenDelete(driver)}>Delete Driver</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Safety Score</p>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{driver.safetyScore}</div>
                        {driver.safetyScore < 85 && (
                          <ShieldAlert className="h-4 w-4 text-warning" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <div className="font-semibold">{driver.experienceYears} Years</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Trips Completed</p>
                      <div className="font-semibold">{driver.tripsCompleted}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge 
                        variant="secondary"
                        className={
                          driver.status === "AVAILABLE" ? "bg-success/10 text-success" :
                          driver.status === "ON_TRIP" ? "bg-info/10 text-info" :
                          driver.status === "SUSPENDED" ? "bg-destructive/10 text-destructive" :
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {driver.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {(driver.status === 'SUSPENDED' || expired) && (
                  <div className="bg-destructive/10 px-6 py-3 border-t border-destructive/20">
                    <p className="text-xs font-medium text-destructive flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> 
                      {expired ? 'Action Required: License Expired' : 'Action Required: License Review'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )})}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Number</label>
                  <Input required placeholder="+91XXXXXXXXXX" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Number</label>
                  <Input required placeholder="MH1420210009823" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Category</label>
                  <Input required placeholder="LMV, HMV" value={formData.licenseCategory} onChange={e => setFormData({...formData, licenseCategory: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Expiry</label>
                  <Input type="date" required value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Safety Score</label>
                  <Input type="number" step="0.1" min="0" max="100" value={formData.safetyScore} onChange={e => setFormData({...formData, safetyScore: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as string})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                      <SelectItem value="ON_TRIP">ON_TRIP</SelectItem>
                      <SelectItem value="OFF_DUTY">OFF_DUTY</SelectItem>
                      <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Driver Profile</DialogTitle>
          </DialogHeader>
          {selectedDriver && (() => {
            let parsedAvatar = { contact: "N/A", category: "N/A" };
            try {
              if (selectedDriver.avatar) parsedAvatar = JSON.parse(selectedDriver.avatar);
            } catch(e) {}
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarFallback className="bg-primary/10 text-primary">{selectedDriver.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{selectedDriver.name}</h2>
                    <p className="text-muted-foreground">{selectedDriver.licenseNumber}</p>
                    <Badge className="mt-2" variant={selectedDriver.status === "AVAILABLE" ? "default" : "secondary"}>{selectedDriver.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{parsedAvatar.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Category</p>
                    <p className="font-medium">{parsedAvatar.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Expiry</p>
                    <p className="font-medium">{new Date(selectedDriver.licenseExpiry).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Safety Score</p>
                    <p className="font-medium">{selectedDriver.safetyScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedDriver.experienceYears} Years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trips Completed</p>
                    <p className="font-medium">{selectedDriver.tripsCompleted}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the driver {selectedDriver?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
