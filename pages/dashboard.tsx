import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { 
  Truck, 
  Route, 
  AlertTriangle, 
  TrendingUp, 
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Users,
  Percent,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToPDF } from "@/utils/pdfExport";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState('all');
  const [status, setStatus] = useState('all');
  const [region, setRegion] = useState('all');

  const queryParams = new URLSearchParams();
  if (vehicleType !== 'all') queryParams.append('type', vehicleType);
  if (status !== 'all') queryParams.append('status', status);
  if (region !== 'all') queryParams.append('region', region);

  const queryString = queryParams.toString();
  const dashboardUrl = queryString ? `/api/dashboard?${queryString}` : '/api/dashboard';

  const { data: dashboardData, error: dashError } = useSWR(dashboardUrl, fetcher);
  const { data: tripsData, error: tripsError } = useSWR('/api/trips', fetcher);

  const recentTrips = Array.isArray(tripsData) ? tripsData.slice(0, 5) : [];
  
  const revenueData = [
    { name: "Mon", revenue: 12400, cost: 8400 },
    { name: "Tue", revenue: 14500, cost: 9200 },
    { name: "Wed", revenue: 11200, cost: 7100 },
    { name: "Thu", revenue: 15800, cost: 10400 },
    { name: "Fri", revenue: 18900, cost: 12100 },
    { name: "Sat", revenue: 9400, cost: 6300 },
    { name: "Sun", revenue: 8100, cost: 5200 },
  ];

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      `Active Vehicles,${dashboardData?.activeVehicles + dashboardData?.availableVehicles || 0}\n` +
      `Active Trips,${dashboardData?.activeTrips || 0}\n` +
      `Vehicles in Shop,${dashboardData?.maintenanceVehicles || 0}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dashboard_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    exportToPDF({
      title: "Dashboard Report",
      filename: "dashboard_report.pdf",
      headers: ['Metric', 'Value'],
      data: [
        ['Active Vehicles', String((dashboardData?.activeVehicles || 0) + (dashboardData?.availableVehicles || 0))],
        ['Active Trips', String(dashboardData?.activeTrips || 0)],
        ['Vehicles in Shop', String(dashboardData?.maintenanceVehicles || 0)],
      ]
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard | TransitOps</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">Welcome back, here's what's happening with your fleet today.</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
                Download Report
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportCSV}>Download CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={exportPDF}>Download PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/trips">
              <Button>New Dispatch</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            Filters
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Vehicle Type: All</SelectItem>
                <SelectItem value="Light Commercial">Light Commercial</SelectItem>
                <SelectItem value="Medium Commercial">Medium Commercial</SelectItem>
                <SelectItem value="Heavy Commercial">Heavy Commercial</SelectItem>
                <SelectItem value="Passenger Commercial">Passenger Commercial</SelectItem>
                <SelectItem value="Pickup">Pickup</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ON_TRIP">On Trip</SelectItem>
                <SelectItem value="IN_SHOP">In Shop</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Region: All</SelectItem>
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

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Active Vehicles</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {String(dashboardData?.activeVehicles || 0).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-t-4 border-t-success">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Available Vehicles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {String(dashboardData?.availableVehicles || 0).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-t-4 border-t-destructive">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Vehicles In Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {String(dashboardData?.maintenanceVehicles || 0).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-t-4 border-t-info">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Active Trips</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {String(dashboardData?.activeTrips || 0).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-t-4 border-t-warning">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pending Trips</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {String(dashboardData?.pendingTrips || 0).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Drivers On Duty</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {String(dashboardData?.driversOnDuty || 0).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-t-4 border-t-success">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Fleet Utilization</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(dashboardData?.fleetUtilization || 0)}%
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts & Tables */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Operational Cost</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${value}`} 
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="cost" name="Operational Cost" fill="#f97316" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trips & Vehicle Status */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="uppercase tracking-wider">Recent Trips</CardTitle>
              <Link href="/trips">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Trip</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg">ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip: any) => (
                      <tr key={trip.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{trip.id}</td>
                        <td className="px-4 py-3">{trip.vehicle?.registration || trip.vehicleId}</td>
                        <td className="px-4 py-3">{trip.driver?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant="secondary"
                            className={
                              trip.status === "COMPLETED" ? "bg-success/10 text-success" :
                              trip.status === "DISPATCHED" ? "bg-info/10 text-info" :
                              trip.status === "ASSIGNED" ? "bg-warning/10 text-warning" :
                              "bg-muted text-muted-foreground"
                            }
                          >
                            {trip.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {trip.status === "COMPLETED" ? "—" : 
                           trip.status === "DRAFT" ? "Awaiting vehicle" : 
                           trip.estimatedArrival ? new Date(trip.estimatedArrival).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Status */}
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider">Vehicle Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  <span className="text-xl font-bold">{String(dashboardData?.availableVehicles || 0).padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">On Trip</span>
                  </div>
                  <span className="text-xl font-bold">{String(dashboardData?.activeVehicles || 0).padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span className="text-sm font-medium">In Shop</span>
                  </div>
                  <span className="text-xl font-bold">{String(dashboardData?.maintenanceVehicles || 0).padStart(2, '0')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
