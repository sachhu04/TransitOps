import React from "react";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
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
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());

export default function Analytics() {
  const { data: reportsData, isLoading: reportsLoading } = useSWR('/api/reports', fetcher);
  const { data: dashboard, isLoading: dashLoading } = useSWR('/api/dashboard', fetcher);

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

  const bentoCardStyle = "group hover:border-border/80 transition-all duration-300 hover:shadow-md flex flex-col";

  return (
    <>
      <Head>
        <title>Reports & Analytics | TransitOps</title>
      </Head>
      
      <div className="flex-1 space-y-8 p-1 sm:p-4">
        {/* Classy Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/60">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Comprehensive insights into fleet performance and costs.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline" }) + " gap-2"}>
              <Download className="h-4 w-4" /> Export Report
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-2">
          <Card className={bentoCardStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Efficiency</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{dashLoading ? <Skeleton className="h-8 w-24" /> : `${dashboard?.fuelEfficiency?.toFixed(1) || '0.0'} km/l`}</div>
            </CardContent>
          </Card>
          
          <Card className={bentoCardStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fleet Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{dashLoading ? <Skeleton className="h-8 w-16" /> : `${dashboard?.fleetUtilization?.toFixed(0) || '0'}%`}</div>
            </CardContent>
          </Card>

          <Card className={bentoCardStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Operational Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{dashLoading ? <Skeleton className="h-8 w-24" /> : `₹${(dashboard?.operationalCost || 0).toLocaleString()}`}</div>
            </CardContent>
          </Card>

          <Card className={bentoCardStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vehicle ROI</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{reportsLoading ? <Skeleton className="h-8 w-16" /> : `${avgRoi.toFixed(1)}%`}</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                (Rev − (Maint + Fuel)) / Acq Cost
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className={`col-span-2 ${bentoCardStyle}`}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E54B4B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#E54B4B" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCostAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                      formatter={(val) => `₹${(val as number).toLocaleString()}`} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#E54B4B" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueAnalytics)" />
                    <Area type="monotone" dataKey="cost" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorCostAnalytics)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={bentoCardStyle}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Costliest Vehicles</CardTitle>
              <CardDescription>Vehicles with highest operational cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={`skel-cost-${i}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                  ))
                ) : topCostliestVehicles.length > 0 ? (
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
