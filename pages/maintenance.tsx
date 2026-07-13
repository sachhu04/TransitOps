import React from "react";
import Head from "next/head";
import { Wrench, CheckCircle2, Clock, Check, ChevronsUpDown, ArrowRightCircle, Download } from "lucide-react";
import { exportToPDF } from "@/utils/pdfExport";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());

export default function Maintenance() {
  const { data: vehiclesData } = useSWR('/api/vehicles', fetcher);
  const { data: logsData, mutate: mutateLogs } = useSWR('/api/maintenance', fetcher);
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
  const logs = Array.isArray(logsData) ? logsData : [];
  
  const [vehicleOpen, setVehicleOpen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<string>("");
  const [service, setService] = React.useState("");
  const [technician, setTechnician] = React.useState("");
  const [cost, setCost] = React.useState("");
  const [date, setDate] = React.useState("");
  const [status, setStatus] = React.useState("IN_PROGRESS");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSave = async () => {
    if (!selectedVehicle || !service || !cost || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          service,
          technician,
          cost,
          date,
          status
        })
      });
      
      if (!res.ok) throw new Error('Failed to save record');
      
      toast.success("Maintenance record saved successfully!");
      
      // Reset form
      setSelectedVehicle("");
      setService("");
      setTechnician("");
      setCost("");
      setDate("");
      setStatus("IN_PROGRESS");
      
      mutateLogs(); // Refresh logs
    } catch (error) {
      console.error(error);
      toast.error("Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLogStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success("Status updated successfully!");
      mutateLogs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    }
  };

  const handleExportPDF = () => {
    if (!logs || logs.length === 0) return;
    exportToPDF({
      title: "Maintenance Logs",
      filename: "maintenance_logs.pdf",
      headers: ['Vehicle', 'Service', 'Date', 'Cost', 'Technician', 'Status'],
      data: logs.map((log: any) => [
        log.vehicle?.registration || log.vehicleId,
        log.service,
        new Date(log.date).toLocaleDateString(),
        `₹${log.cost}`,
        log.technician || "N/A",
        log.status
      ])
    });
  };

  return (
    <>
      <Head>
        <title>Maintenance | TransitOps</title>
      </Head>
      
      <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance & Repairs</h1>
          <p className="text-muted-foreground">Schedule service and view vehicle maintenance history.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Panel - Schedule Form */}
          <Card className="flex flex-col h-full overflow-hidden border-border shadow-sm lg:col-span-1">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <CardTitle>Schedule Service</CardTitle>
              <CardDescription>Log a new maintenance record or schedule an upcoming service.</CardDescription>
            </CardHeader>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={vehicleOpen}
                        className={cn("w-full justify-between", !selectedVehicle && "text-muted-foreground")}
                      />
                    }
                  >
                    {selectedVehicle
                      ? vehicles.find((v: Record<string, any>) => v.id === selectedVehicle)?.registration
                      : "Search vehicle..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search by registration or type..." />
                      <CommandList>
                        <CommandEmpty>No vehicle found.</CommandEmpty>
                        <CommandGroup>
                          {vehicles.map((v: Record<string, any>) => (
                            <CommandItem
                              key={v.id}
                              value={v.registration + " " + v.type}
                              onSelect={() => {
                                setSelectedVehicle(v.id);
                                setVehicleOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedVehicle === v.id ? "opacity-100" : "opacity-0"
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
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input placeholder="e.g. Oil Change, Brake Inspection" value={service} onChange={(e) => setService(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Technician / Shop</Label>
                <Input placeholder="Name of technician or external shop" value={technician} onChange={(e) => setTechnician(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Cost</Label>
                <Input type="number" placeholder="₹0.00" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val || "IN_PROGRESS")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">Active (In Shop)</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/10 space-y-3">
              <Button className="w-full" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </Card>

          {/* Right Panel - Service History */}
          <Card className="flex flex-col h-full overflow-hidden border-border shadow-sm lg:col-span-2 bg-muted/10">
            <CardHeader className="bg-muted/30 border-b border-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service History</CardTitle>
                <CardDescription>Recent maintenance logs across the fleet.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </CardHeader>
            <div className="overflow-y-auto flex-1 p-6">
              <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground pl-6">No maintenance records found.</p>
                ) : (
                  logs.map((log: Record<string, any>) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute w-6 h-6 bg-card border-2 border-border rounded-full -left-[13px] top-0 flex items-center justify-center">
                        {log.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3 h-3 text-success" />
                        ) : log.status === 'IN_PROGRESS' ? (
                          <Wrench className="w-3 h-3 text-info" />
                        ) : (
                          <Clock className="w-3 h-3 text-warning" />
                        )}
                      </div>
                      
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{log.service}</h4>
                            <p className="text-sm text-primary font-medium">{log.vehicle?.registration || log.vehicleId}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">₹{log.cost}</span>
                            <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-muted-foreground">Technician: {log.technician || 'N/A'}</span>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium ${
                              log.status === 'COMPLETED' ? 'text-success' : 
                              log.status === 'IN_PROGRESS' ? 'text-info' : 'text-warning'
                            }`}>
                              {log.status.replace('_', ' ')}
                            </span>
                            {log.status === 'IN_PROGRESS' && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => updateLogStatus(log.id, 'COMPLETED')}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Done
                              </Button>
                            )}
                            {log.status === 'SCHEDULED' && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => updateLogStatus(log.id, 'IN_PROGRESS')}>
                                <Wrench className="w-3 h-3 mr-1" /> Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
