import React from "react";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from "recharts";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPDF } from "@/utils/pdfExport";
import { Download, TrendingUp, Activity, DollarSign, Percent } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());

export default function Analytics() {
  const { data: reportsData } = useSWR('/api/reports', fetcher);
  const { data: dashboard } = useSWR('/api/dashboard', fetcher);

  const reports = Array.isArray(reportsData) ? reportsData : [];
  
  const avgRoi = reports.length > 0 
    ? reports.reduce((acc: number, r: any) => acc + (r.roi || 0), 0) / reports.length 
    : 0;

  const topCostliestVehicles = [...reports]
    .sort((a, b) => (b.operationalCost || 0) - (a.operationalCost || 0))
    .slice(0, 5);

  const monthlyRevenueData = [
    { name: "Jan", revenue: 45000, cost: 32000 },
    { name: "Feb", revenue: 52000, cost: 34000 },
    { name: "Mar", revenue: 48000, cost: 31000 },
    { name: "Apr", revenue: 61000, cost: 38000 },
    { name: "May", revenue: 59000, cost: 36000 },
    { name: "Jun", revenue: 65000, cost: 34070 },
  ];

  const handleExportCSV = () => {
    if (!reports.length) return;
    const headers = ['Vehicle', 'Total Distance', 'Fuel Efficiency', 'Fuel Cost', 'Maintenance Cost', 'Operational Cost', 'Revenue', 'ROI'];
    const csvContent = [
      headers.join(','),
      ...reports.map(r => [
        r.registration,
        r.totalDistance,
        r.fuelEfficiency,
        r.fuelCost,
        r.maintenanceCost,
        r.operationalCost,
        r.revenue,
        r.roi
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'analytics_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!reports.length) return;
    exportToPDF({
      title: "Analytics Report",
      filename: "analytics_report.pdf",
      orientation: "landscape",
      headers: ['Vehicle', 'Total Distance', 'Fuel Efficiency', 'Fuel Cost', 'Maint. Cost', 'Op. Cost', 'Revenue', 'ROI'],
      data: reports.map((r: any) => [
        r.registration,
        String(r.totalDistance || 0),
        String(r.fuelEfficiency || 0),
        `₹${r.fuelCost || 0}`,
        `₹${r.maintenanceCost || 0}`,
        `₹${r.operationalCost || 0}`,
        `₹${r.revenue || 0}`,
        `${r.roi || 0}%`
      ])
    });
  };

  return (
    <>
      <Head>
        <title>Reports & Analytics | TransitOps</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights into fleet performance and costs.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "default" })}>
              <Download className="mr-2 h-4 w-4" /> Export Report
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">FUEL EFFICIENCY</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.fuelEfficiency?.toFixed(1) || '0.0'} km/l</div>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">FLEET UTILIZATION</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.fleetUtilization?.toFixed(0) || '0'}%</div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">OPERATIONAL COST</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(dashboard?.operationalCost || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-info">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">VEHICLE ROI</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRoi.toFixed(1)}%</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider">MONTHLY REVENUE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '10px' }} formatter={(val) => `₹${(val as number).toLocaleString()}`} />
                    <Bar dataKey="cost" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} name="Cost" />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider">TOP COSTLIEST VEHICLES</CardTitle>
              <CardDescription>Vehicles with highest operational cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCostliestVehicles.length > 0 ? (
                  topCostliestVehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase">{vehicle.registration}</span>
                        <span className="text-xs text-muted-foreground">₹{vehicle.operationalCost?.toLocaleString() || 0}</span>
                      </div>
                      <div className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                        High Cost
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
