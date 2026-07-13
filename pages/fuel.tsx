import React, { useState } from "react";
import Head from "next/head";
import { Plus, Download } from "lucide-react";
import { exportToPDF } from "@/utils/pdfExport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());

export default function FuelExpenses() {
  const { data: fuelLogsData } = useSWR('/api/fuel', fetcher);
  const { data: expensesData } = useSWR('/api/expenses', fetcher);
  const { data: maintenanceData } = useSWR('/api/maintenance', fetcher);
  const { data: vehiclesData } = useSWR('/api/vehicles', fetcher);
  const { data: tripsData } = useSWR('/api/trips', fetcher);

  const fuelLogs = Array.isArray(fuelLogsData) ? fuelLogsData : [];
  const expenses = Array.isArray(expensesData) ? expensesData : [];
  const maintenanceLogs = Array.isArray(maintenanceData) ? maintenanceData : [];
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
  const trips = Array.isArray(tripsData) ? tripsData : [];

  const [fuelForm, setFuelForm] = useState({ vehicleId: '', date: '', liters: '', cost: '', location: '' });
  const [expenseForm, setExpenseForm] = useState({ tripId: '', vehicleId: '', type: '', amount: '', date: '', notes: '' });
  
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const [fuelPage, setFuelPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(fuelForm)
      });
      if (res.ok) {
        mutate('/api/fuel');
        setFuelOpen(false);
        setFuelForm({ vehicleId: '', date: '', liters: '', cost: '', location: '' });
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to log fuel');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while logging fuel');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a payload, omitting empty tripId/vehicleId to avoid foreign key issues
      const payload: Record<string, string> = { ...expenseForm };
      if (!payload.tripId) delete payload.tripId;
      if (!payload.vehicleId) delete payload.vehicleId;
      
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        mutate('/api/expenses');
        setExpenseOpen(false);
        setExpenseForm({ tripId: '', vehicleId: '', type: '', amount: '', date: '', notes: '' });
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to add expense');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while adding expense');
    }
  };

  const totalFuelCost = fuelLogs.reduce((acc: number, log: { cost?: number }) => acc + (log.cost || 0), 0);
  const totalMaintCost = maintenanceLogs.reduce((acc: number, log: { cost?: number }) => acc + (log.cost || 0), 0) +
                         expenses.filter((e: { type: string }) => e.type === 'MAINTENANCE' || e.type === 'REPAIR').reduce((acc: number, e: { amount: number }) => acc + e.amount, 0);

  const totalOpCost = totalFuelCost + totalMaintCost;

  // Group expenses by Trip
  const tripExpensesMap = expenses.reduce((acc: Record<string, { tripId: string, tripName: string, vehicle: string, toll: number, other: number, maint: number, status: string }>, exp: { tripId?: string, trip?: { id: string, status: string }, vehicle?: { registration: string }, type: string, amount: number }) => {
    if (!exp.tripId) return acc;
    const tripId = exp.tripId;
    if (!acc[tripId]) {
      acc[tripId] = {
        tripId,
        tripName: exp.trip ? `TR${exp.trip.id.substring(exp.trip.id.length - 4).toUpperCase()}` : 'Unlinked',
        vehicle: exp.vehicle ? exp.vehicle.registration : '-',
        toll: 0,
        other: 0,
        maint: 0,
        status: exp.trip ? exp.trip.status : '-'
      };
    }
    if (exp.type === 'TOLL') acc[tripId].toll += exp.amount;
    else if (exp.type === 'MAINTENANCE' || exp.type === 'REPAIR') acc[tripId].maint += exp.amount;
    else acc[tripId].other += exp.amount;
    return acc;
  }, {});

  const tripExpenses = Object.values(tripExpensesMap);

  const handleExportPDF = () => {
    if (!fuelLogs || fuelLogs.length === 0) return;
    exportToPDF({
      title: "Fuel Logs",
      filename: "fuel_logs.pdf",
      headers: ['Vehicle', 'Date', 'Liters', 'Cost', 'Location'],
      data: fuelLogs.map((log: any) => [
        log.vehicle?.registration || log.vehicleId,
        new Date(log.date).toLocaleString(),
        String(log.liters),
        `₹${log.cost}`,
        log.location
      ])
    });
  };

  return (
    <>
      <Head>
        <title>Fuel & Expenses | TransitOps</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fuel & Expenses</h1>
            <p className="text-muted-foreground">Financial overview of fleet operations.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            
            <Dialog open={fuelOpen} onOpenChange={setFuelOpen}>
              <DialogTrigger render={<Button variant="default" />}>
                <Plus className="mr-2 h-4 w-4" /> Log Fuel
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Log Fuel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFuelSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleId">Vehicle</Label>
                    <Select value={fuelForm.vehicleId} onValueChange={(val) => setFuelForm({ ...fuelForm, vehicleId: val })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v: { id: string, registration: string }) => (
                          <SelectItem key={v.id} value={v.id}>{v.registration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="datetime-local" value={fuelForm.date} onChange={e => setFuelForm({...fuelForm, date: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="liters">Liters</Label>
                      <Input id="liters" type="number" min="0" step="0.1" value={fuelForm.liters} onChange={e => setFuelForm({...fuelForm, liters: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost">Total Cost (₹)</Label>
                      <Input id="cost" type="number" min="0" step="1" value={fuelForm.cost} onChange={e => setFuelForm({...fuelForm, cost: e.target.value})} required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={fuelForm.location} onChange={e => setFuelForm({...fuelForm, location: e.target.value})} required />
                  </div>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" type="button" />}>
                      Cancel
                    </DialogClose>
                    <Button type="submit">Save Log</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
              <DialogTrigger render={<Button variant="outline" />}>
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tripId">Trip (Optional)</Label>
                    <Select value={expenseForm.tripId} onValueChange={(val) => setExpenseForm({ ...expenseForm, tripId: val === 'none' ? '' : val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trip" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {trips.map((t: { id: string, source: string, destination: string }) => (
                          <SelectItem key={t.id} value={t.id}>{t.source} to {t.destination}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expenseVehicleId">Vehicle (Optional)</Label>
                    <Select value={expenseForm.vehicleId} onValueChange={(val) => setExpenseForm({ ...expenseForm, vehicleId: val === 'none' ? '' : val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {vehicles.map((v: { id: string, registration: string }) => (
                          <SelectItem key={v.id} value={v.id}>{v.registration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Expense Type</Label>
                    <Select value={expenseForm.type} onValueChange={(val) => setExpenseForm({ ...expenseForm, type: val })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TOLL">Toll</SelectItem>
                        <SelectItem value="PARKING">Parking</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="REPAIR">Repair</SelectItem>
                        <SelectItem value="ALLOWANCE">Allowance</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input id="amount" type="number" min="0" step="1" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expDate">Date</Label>
                      <Input id="expDate" type="datetime-local" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} />
                  </div>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" type="button" />}>
                      Cancel
                    </DialogClose>
                    <Button type="submit">Save Expense</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg uppercase text-muted-foreground tracking-wider font-semibold">Fuel Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Vehicle</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Liters</th>
                    <th className="px-4 py-3 rounded-tr-lg">Fuel Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.length > 0 ? fuelLogs.slice((fuelPage - 1) * ITEMS_PER_PAGE, fuelPage * ITEMS_PER_PAGE).map((log: { id: string, vehicle?: { registration: string }, vehicleId: string, date: string, liters: number, cost: number }) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-primary">{log.vehicle?.registration || log.vehicleId}</td>
                      <td className="px-4 py-3">{new Date(log.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3">{log.liters} L</td>
                      <td className="px-4 py-3 font-medium">{log.cost.toLocaleString('en-IN')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted-foreground">No fuel logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {fuelLogs.length > ITEMS_PER_PAGE && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setFuelPage(p => Math.max(1, p - 1)); }} 
                        className={fuelPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm px-2">Page {fuelPage} of {Math.ceil(fuelLogs.length / ITEMS_PER_PAGE)}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setFuelPage(p => Math.min(Math.ceil(fuelLogs.length / ITEMS_PER_PAGE), p + 1)); }} 
                        className={fuelPage === Math.ceil(fuelLogs.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg uppercase text-muted-foreground tracking-wider font-semibold">Other Expenses (Toll / Misc)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Trip</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Toll</th>
                    <th className="px-4 py-3">Other</th>
                    <th className="px-4 py-3">Maint. (Linked)</th>
                    <th className="px-4 py-3 rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tripExpenses.length > 0 ? tripExpenses.slice((expensePage - 1) * ITEMS_PER_PAGE, expensePage * ITEMS_PER_PAGE).map((exp: { tripName: string, vehicle: string, toll: number, other: number, maint: number, status: string }, idx: number) => {
                    const total = exp.toll + exp.other + exp.maint;
                    return (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{exp.tripName}</td>
                        <td className="px-4 py-3 text-primary">{exp.vehicle}</td>
                        <td className="px-4 py-3">{exp.toll.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">{exp.other.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">{exp.maint.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-medium">
                          {total.toLocaleString('en-IN')} 
                          <span className="ml-2 text-xs text-muted-foreground capitalize">
                            {exp.status ? exp.status.toLowerCase() : ''}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">No expenses found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {tripExpenses.length > ITEMS_PER_PAGE && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setExpensePage(p => Math.max(1, p - 1)); }} 
                        className={expensePage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm px-2">Page {expensePage} of {Math.ceil(tripExpenses.length / ITEMS_PER_PAGE)}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setExpensePage(p => Math.min(Math.ceil(tripExpenses.length / ITEMS_PER_PAGE), p + 1)); }} 
                        className={expensePage === Math.ceil(tripExpenses.length / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold tracking-tight text-center">
              TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINTENANCE <span className="text-primary ml-2">{totalOpCost.toLocaleString('en-IN')}</span>
            </h2>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
