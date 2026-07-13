import React, { useState } from "react";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Package,
  Truck,
  Users,
  Check,
  ChevronsUpDown,
  Download
} from "lucide-react";
import { exportToPDF } from "@/utils/pdfExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  cargo: z.string().min(1, "Cargo details are required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  date: z.date({ message: "Schedule date is required" }),
});

type TripFormValues = z.infer<typeof tripSchema>;

export default function Trips() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const canCreate = user?.role === 'DISPATCHER';
  
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as any,
    mode: "onChange",
    defaultValues: {
      source: "",
      destination: "",
      vehicleId: "",
      driverId: "",
      cargo: "",
      weight: 0,
    }
  });

  const { data: vehiclesData } = useSWR('/api/vehicles', fetcher);
  const { data: driversData } = useSWR('/api/drivers', fetcher);
  const { data: tripsData, mutate: mutateTrips } = useSWR('/api/trips', fetcher);

  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
  const drivers = Array.isArray(driversData) ? driversData : [];
  const trips = Array.isArray(tripsData) ? tripsData : [];

  const onSubmit = async (data: TripFormValues) => {
    setIsSubmitting(true);
    
    try {
      const scheduledDeparture = data.date.toISOString();
      const estimatedArrival = new Date(data.date.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          source: data.source,
          destination: data.destination,
          vehicleId: data.vehicleId,
          driverId: data.driverId,
          cargo: data.cargo,
          weight: data.weight,
          distance: 150, // mock distance
          scheduledDeparture,
          estimatedArrival
        })
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error("Dispatch failed", { description: result.message || "Failed to create trip" });
      } else {
        toast.success("Trip Dispatched", {
          description: `Successfully dispatched trip from ${data.source} to ${data.destination}.`
        });
        form.reset();
        mutateTrips();
      }
    } catch (error) {
      toast.error("Error", { description: "Something went wrong" });
    }
    
    setIsSubmitting(false);
  };

  const handleUpdateTripStatus = async (tripId: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
    setUpdatingTripId(tripId);
    try {
      const res = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(`Failed to ${newStatus.toLowerCase()} trip`, { description: errorData.message || "Something went wrong" });
      } else {
        toast.success(`Trip ${newStatus === 'COMPLETED' ? 'Completed' : 'Cancelled'}`, {
          description: `Trip has been successfully ${newStatus.toLowerCase()}.`
        });
        mutateTrips();
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to connect to the server" });
    } finally {
      setUpdatingTripId(null);
    }
  };

  const activeTrips = trips.filter((t: any) => t.status === "DISPATCHED" || t.status === "ASSIGNED" || t.status === "DRAFT").slice(0, 5);
  const pastTrips = trips.filter((t: any) => t.status === "COMPLETED" || t.status === "CANCELLED").slice(0, 10);

  const handleExportPDF = () => {
    if (!trips || trips.length === 0) return;
    exportToPDF({
      title: "Trips Directory",
      filename: "trips_directory.pdf",
      headers: ['Source', 'Destination', 'Vehicle', 'Driver', 'Status', 'Date'],
      data: trips.map((t: any) => [
        t.source,
        t.destination,
        t.vehicle?.registration || "Unassigned",
        t.driver?.name || "Unassigned",
        t.status,
        new Date(t.scheduledDate || t.createdAt).toLocaleDateString()
      ])
    });
  };

  return (
    <>
      <Head>
        <title>Trips & Dispatch | TransitOps</title>
      </Head>
      
      <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trips & Dispatch</h1>
            <p className="text-muted-foreground">Create new trips and monitor active dispatch operations.</p>
          </div>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Panel - Creation Form */}
          {canCreate ? (
            <Card className="flex flex-col h-full overflow-hidden border-border shadow-sm">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle>Create New Trip</CardTitle>
                <CardDescription>Enter trip details to assign a vehicle and driver.</CardDescription>
              </CardHeader>
              <div className="overflow-y-auto flex-1 p-6">
                <form id="trip-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label>Source Origin</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="e.g. Warehouse A" className="pl-9" {...form.register("source")} />
                      </div>
                      {form.formState.errors.source && <p className="text-sm text-destructive">{form.formState.errors.source.message}</p>}
                    </div>
                    
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label>Destination</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="e.g. Distribution Center B" className="pl-9" {...form.register("destination")} />
                      </div>
                      {form.formState.errors.destination && <p className="text-sm text-destructive">{form.formState.errors.destination.message}</p>}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label>Assign Vehicle</Label>
                      <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={vehicleOpen}
                              className={cn("w-full justify-between", !form.watch("vehicleId") && "text-muted-foreground")}
                            />
                          }
                        >
                          {form.watch("vehicleId")
                            ? vehicles.find((v: any) => v.id === form.watch("vehicleId"))?.registration
                            : "Search vehicle..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search by registration or type..." />
                            <CommandList>
                              <CommandEmpty>No vehicle found.</CommandEmpty>
                              <CommandGroup>
                                {vehicles.filter((v: any) => v.status === "AVAILABLE").map((v: any) => (
                                  <CommandItem
                                    key={v.id}
                                    value={v.registration + " " + v.type}
                                    onSelect={() => {
                                      form.setValue("vehicleId", v.id, { shouldValidate: true });
                                      setVehicleOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        form.watch("vehicleId") === v.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {v.registration} ({v.type})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.vehicleId && <p className="text-sm text-destructive">{form.formState.errors.vehicleId.message}</p>}
                    </div>
                    
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label>Assign Driver</Label>
                      <Popover open={driverOpen} onOpenChange={setDriverOpen}>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={driverOpen}
                              className={cn("w-full justify-between", !form.watch("driverId") && "text-muted-foreground")}
                            />
                          }
                        >
                          {form.watch("driverId")
                            ? drivers.find((d: any) => d.id === form.watch("driverId"))?.name
                            : "Search driver..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search by name..." />
                            <CommandList>
                              <CommandEmpty>No driver found.</CommandEmpty>
                              <CommandGroup>
                                {drivers.filter((d: any) => d.status === "AVAILABLE").map((d: any) => (
                                  <CommandItem
                                    key={d.id}
                                    value={d.name}
                                    onSelect={() => {
                                      form.setValue("driverId", d.id, { shouldValidate: true });
                                      setDriverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        form.watch("driverId") === d.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {d.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.driverId && <p className="text-sm text-destructive">{form.formState.errors.driverId.message}</p>}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Cargo Details</Label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Description of goods" className="pl-9" {...form.register("cargo")} />
                      </div>
                      {form.formState.errors.cargo && <p className="text-sm text-destructive">{form.formState.errors.cargo.message}</p>}
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label>Weight (kg)</Label>
                      <Input type="number" placeholder="40000" {...form.register("weight")} />
                      {form.formState.errors.weight && <p className="text-sm text-destructive">{form.formState.errors.weight.message}</p>}
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label>Schedule Date</Label>
                      <Popover>
                        <PopoverTrigger render={
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.watch("date") && "text-muted-foreground"
                            )}
                          />
                        }>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("date") ? format(form.watch("date"), "PPP") : <span>Pick a date</span>}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={form.watch("date")}
                            onSelect={(date) => date && form.setValue("date", date)}
                          />
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.date && <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>}
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-border bg-muted/10">
                <Button type="submit" form="trip-form" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Dispatching..." : "Create & Dispatch Trip"}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center h-full overflow-hidden border-border shadow-sm bg-muted/30">
              <CardTitle className="text-muted-foreground mb-2">Permission Denied</CardTitle>
              <CardDescription>You do not have permission to dispatch trips.</CardDescription>
            </Card>
          )}

          {/* Right Panel - Dispatch Board & History */}
          <Card className="flex flex-col h-full overflow-hidden border-border shadow-sm bg-muted/10">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <CardTitle>Dispatch Operations</CardTitle>
              <CardDescription>Monitor active operations and past history.</CardDescription>
            </CardHeader>
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <Tabs defaultValue="active" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                  <TabsTrigger value="active">Active Trips</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="flex-1 overflow-y-auto space-y-6 mt-0 pr-2">
                  {activeTrips.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No active trips.</div>
                  ) : activeTrips.map((trip: any) => (
                    <div key={trip.id} className="bg-card p-4 rounded-xl border border-border shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-info"></div>
                      
                      <div className="flex justify-between items-start mb-4 pl-2">
                        <div>
                          <h4 className="font-semibold">{trip.id}</h4>
                          <p className="text-xs text-muted-foreground">{trip.cargo}</p>
                        </div>
                        <Badge variant="secondary" className="bg-info/10 text-info">
                          {trip.status}
                        </Badge>
                      </div>
                      
                      <div className="pl-2 mb-6">
                        <div className="relative pl-6 pb-4 border-l-2 border-muted">
                          <div className="absolute w-3 h-3 bg-card border-2 border-primary rounded-full -left-[7px] top-1"></div>
                          <p className="text-sm font-medium">{trip.source}</p>
                          <p className="text-xs text-muted-foreground">Dep: {new Date(trip.scheduledDeparture).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-muted border-2 border-muted-foreground rounded-full -left-[7px] top-1"></div>
                          <p className="text-sm font-medium">{trip.destination}</p>
                          <p className="text-xs text-muted-foreground">ETA: {new Date(trip.estimatedArrival).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pl-2 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{trip.vehicle?.registration || trip.vehicleId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{trip.driver?.name || "Assigned Driver"}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4 pl-2 mt-4 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTripStatus(trip.id, 'CANCELLED')}
                          disabled={updatingTripId === trip.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                          Cancel Trip
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUpdateTripStatus(trip.id, 'COMPLETED')}
                          disabled={updatingTripId === trip.id}
                        >
                          Complete Trip
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="history" className="flex-1 overflow-y-auto space-y-6 mt-0 pr-2">
                  {pastTrips.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No past trips found.</div>
                  ) : pastTrips.map((trip: any) => (
                    <div key={trip.id} className="bg-card p-4 rounded-xl border border-border shadow-sm relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${trip.status === 'COMPLETED' ? 'bg-green-500' : 'bg-destructive'}`}></div>
                      
                      <div className="flex justify-between items-start mb-4 pl-2">
                        <div>
                          <h4 className="font-semibold">{trip.id}</h4>
                          <p className="text-xs text-muted-foreground">{trip.cargo}</p>
                        </div>
                        <Badge variant="secondary" className={trip.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}>
                          {trip.status}
                        </Badge>
                      </div>
                      
                      <div className="pl-2 mb-6">
                        <div className="relative pl-6 pb-4 border-l-2 border-muted">
                          <div className="absolute w-3 h-3 bg-card border-2 border-primary rounded-full -left-[7px] top-1"></div>
                          <p className="text-sm font-medium">{trip.source}</p>
                          <p className="text-xs text-muted-foreground">Dep: {new Date(trip.scheduledDeparture).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-muted border-2 border-muted-foreground rounded-full -left-[7px] top-1"></div>
                          <p className="text-sm font-medium">{trip.destination}</p>
                          <p className="text-xs text-muted-foreground">ETA: {new Date(trip.estimatedArrival).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pl-2 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{trip.vehicle?.registration || trip.vehicleId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{trip.driver?.name || "Assigned Driver"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
