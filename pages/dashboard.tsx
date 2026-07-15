import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Route, Wrench, Activity, Percent, Filter, Download, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToPDF } from '@/utils/pdfExport';
import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(
    (res) => res.json()
  );
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState('all');
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [status, setStatus] = useState('all');
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [region, setRegion] = useState('all');
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(storedUser));
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (e) {}
    }
  }, []);

  const canCreateTrip = user?.role === 'ADMIN' || user?.role === 'DISPATCHER';

  const queryParams = new URLSearchParams();
  if (vehicleType !== 'all') queryParams.append('type', vehicleType);
  if (status !== 'all') queryParams.append('status', status);
  if (region !== 'all') queryParams.append('region', region);

  const queryString = queryParams.toString();
  const dashboardUrl = queryString ? `/api/dashboard?${queryString}` : '/api/dashboard';

  const { data: dashboardData, isLoading: dashLoading } = useSWR(dashboardUrl, fetcher);
  const { data: tripsData, isLoading: tripsLoading } = useSWR('/api/trips', fetcher);
  const { data: auditData, isLoading: auditLoading } = useSWR('/api/audit', fetcher);
  const {
    data: notesData,
    isLoading: notesLoading,
    mutate: mutateNotes,
  } = useSWR('/api/notes', fetcher);

  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: newNote }),
      });
      if (res.ok) {
        setNewNote('');
        mutateNotes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const recentTrips = Array.isArray(tripsData) ? tripsData.slice(0, 5) : [];

  const revenueData = [
    { name: 'Mon', revenue: 12400, cost: 8400 },
    { name: 'Tue', revenue: 14500, cost: 9200 },
    { name: 'Wed', revenue: 11200, cost: 7100 },
    { name: 'Thu', revenue: 15800, cost: 10400 },
    { name: 'Fri', revenue: 18900, cost: 12100 },
    { name: 'Sat', revenue: 9400, cost: 6300 },
    { name: 'Sun', revenue: 8100, cost: 5200 },
  ];

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Active Vehicles,${dashboardData?.activeVehicles + dashboardData?.availableVehicles || 0}\n` +
      `Active Trips,${dashboardData?.activeTrips || 0}\n` +
      `Vehicles in Shop,${dashboardData?.maintenanceVehicles || 0}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dashboard_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    exportToPDF({
      title: 'Dashboard Report',
      filename: 'dashboard_report.pdf',
      headers: ['Metric', 'Value'],
      data: [
        [
          'Active Vehicles',
          String((dashboardData?.activeVehicles || 0) + (dashboardData?.availableVehicles || 0)),
        ],
        ['Active Trips', String(dashboardData?.activeTrips || 0)],
        ['Vehicles in Shop', String(dashboardData?.maintenanceVehicles || 0)],
      ],
    });
  };

  const bentoCardStyle =
    'group hover:border-border/80 transition-all duration-300 hover:shadow-md flex flex-col';

  return (
    <>
      <Head>
        <title>Dashboard | TransitOps</title>
      </Head>

      <div className="flex-1 space-y-8 p-1 sm:p-4">
        {/* Classy Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/60">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground">
              Monitor your fleet operations in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
                <Download className="w-4 h-4" />
                Export
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={exportPDF}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {canCreateTrip && (
              <Link href="/trips">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Dispatch
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted/50 border border-border/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Subtle Filters */}
            <div className="hidden md:flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={vehicleType} onValueChange={(val) => val && setVehicleType(val)}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-transparent border-border/50">
                  <SelectValue placeholder="All Vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="Light Commercial">Light Commercial</SelectItem>
                  <SelectItem value="Heavy Commercial">Heavy Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6 outline-none">
            {/* THE BENTO GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* ROW 1: KPIs */}
              <Card className={bentoCardStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {dashLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      String(dashboardData?.activeVehicles || 0).padStart(2, '0')
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Out of {dashboardData?.totalVehicles || 0} total fleet
                  </p>
                </CardContent>
              </Card>

              <Card className={bentoCardStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                  <Route className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {dashLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      String(dashboardData?.activeTrips || 0).padStart(2, '0')
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Currently in transit</p>
                </CardContent>
              </Card>

              <Card className={bentoCardStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {dashLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      String(dashboardData?.maintenanceVehicles || 0).padStart(2, '0')
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-destructive/80">
                    Requires attention
                  </p>
                </CardContent>
              </Card>

              <Card className={bentoCardStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {dashLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      `${Math.round(dashboardData?.fleetUtilization || 0)}%`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Overall efficiency score</p>
                </CardContent>
              </Card>

              {/* ROW 2: Main Chart (Span 3) & Shift Notes (Span 1) */}
              <Card className={`md:col-span-3 ${bentoCardStyle}`}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                  <CardDescription>Daily revenue vs operational costs</CardDescription>
                </CardHeader>
                <CardContent className="pl-0 pb-4 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E54B4B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#E54B4B" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--border)"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                        dx={-10}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                        itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#E54B4B"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCost)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className={`md:col-span-1 ${bentoCardStyle}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Shift Notes</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 h-[350px]">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {notesLoading ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="space-y-2 p-3 bg-muted/40 rounded-lg">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-2 w-20" />
                          </div>
                        ))
                    ) : notesData && notesData.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      notesData.map((note: any) => (
                        <div
                          key={note.id}
                          className="p-3 bg-muted/40 rounded-lg border border-border/40 hover:bg-muted/60 transition-colors"
                        >
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {note.content}
                          </p>
                          <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                            <span className="font-semibold">{note.authorName}</span>
                            <span>
                              {new Date(note.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No notes for this shift.
                      </p>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 pt-2 border-t border-border/40">
                    <Textarea
                      placeholder="Add a quick note..."
                      className="resize-none h-16 text-sm bg-muted/20 border-border/50 focus-visible:ring-1"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleAddNote}
                      disabled={isSubmittingNote || !newNote.trim()}
                    >
                      {isSubmittingNote ? 'Saving...' : 'Post Note'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ROW 3: Recent Trips (Span 2) & Activity (Span 2) */}
              <Card className={`md:col-span-2 ${bentoCardStyle}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Recent Dispatches</CardTitle>
                    <CardDescription>Latest fleet movements</CardDescription>
                  </div>
                  <Link href="/trips">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground border-y border-border/40 bg-muted/20">
                        <tr>
                          <th className="px-6 py-3 font-medium">Trip ID</th>
                          <th className="px-6 py-3 font-medium">Driver</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {tripsLoading ? (
                          Array(4)
                            .fill(0)
                            .map((_, i) => (
                              <tr key={`skeleton-${i}`}>
                                <td className="px-6 py-3">
                                  <Skeleton className="h-4 w-16" />
                                </td>
                                <td className="px-6 py-3">
                                  <Skeleton className="h-4 w-24" />
                                </td>
                                <td className="px-6 py-3">
                                  <Skeleton className="h-5 w-20 rounded-full" />
                                </td>
                              </tr>
                            ))
                        ) : recentTrips.length > 0 ? (
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          recentTrips.map((trip: any) => (
                            <tr key={trip.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-6 py-3 font-medium text-foreground/80">
                                {trip.id}
                              </td>
                              <td className="px-6 py-3">{trip.driver?.name || 'Unassigned'}</td>
                              <td className="px-6 py-3">
                                <Badge
                                  variant="secondary"
                                  className={
                                    trip.status === 'COMPLETED'
                                      ? 'bg-success/10 text-success border-success/20'
                                      : trip.status === 'DISPATCHED'
                                        ? 'bg-info/10 text-info border-info/20'
                                        : trip.status === 'ASSIGNED'
                                          ? 'bg-warning/10 text-warning border-warning/20'
                                          : 'bg-muted text-muted-foreground border-border/50'
                                  }
                                >
                                  {trip.status}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                              No recent trips.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className={`md:col-span-2 ${bentoCardStyle}`}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">System Activity</CardTitle>
                  <CardDescription>Real-time audit logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 pr-2">
                    {auditLoading ? (
                      Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <Skeleton className="w-2 h-2 mt-2 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        ))
                    ) : auditData && auditData.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      auditData.slice(0, 4).map((log: any) => (
                        <div key={log.id} className="flex gap-4 items-start relative group/log">
                          <div className="absolute left-[3px] top-4 bottom-[-24px] w-px bg-border/50 group-last/log:hidden" />
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-primary/40 ring-4 ring-background shrink-0 z-10" />
                          <div>
                            <p className="text-sm leading-tight text-foreground/90">
                              <span className="font-semibold text-foreground">{log.userName}</span>{' '}
                              {log.action.replace(/_/g, ' ').toLowerCase()}: {log.details}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent activity.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="outline-none">
            <Card className="h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed reporting view coming soon.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="outline-none">
            <Card className="h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center">
                <Download className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">Custom Reports</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Report generation suite coming soon.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
