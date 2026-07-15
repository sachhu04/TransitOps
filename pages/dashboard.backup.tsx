import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Route, Wrench, Activity, Percent, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { exportToPDF } from '@/utils/pdfExport';
import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(
    (res) => res.json()
  );
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState('all');
  const [status, setStatus] = useState('all');
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

  const {
    data: dashboardData,
    // eslint-disable-next-line unused-imports/no-unused-vars
    error: dashError,
    isLoading: dashLoading,
  } = useSWR(dashboardUrl, fetcher);
  const {
    data: tripsData,
    // eslint-disable-next-line unused-imports/no-unused-vars
    error: tripsError,
    isLoading: tripsLoading,
  } = useSWR('/api/trips', fetcher);
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

  return (
    <>
      <Head>
        <title>Dashboard | TransitOps</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your fleet operations and performance.
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: 'outline' })}>
                Download Report
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportCSV}>Download CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={exportPDF}>Download PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {canCreateTrip && (
              <Link href="/trips">
                <Button>New Dispatch</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            Filters
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={vehicleType} onValueChange={(val) => val && setVehicleType(val)}>
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
            <Select value={status} onValueChange={(val) => val && setStatus(val)}>
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
            <Select value={region} onValueChange={(val) => val && setRegion(val)}>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Vehicles
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Trips
              </CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  String(dashboardData?.activeTrips || 0).padStart(2, '0')
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently in transit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Maintenance
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  String(dashboardData?.maintenanceVehicles || 0).padStart(2, '0')
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Vehicles in the shop</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fleet Utilization
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  `${Math.round(dashboardData?.fleetUtilization || 0)}%`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall efficiency score</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Tables */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Revenue vs Operational Cost</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
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
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#E54B4B"
                      radius={[4, 4, 0, 0]}
                      barSize={25}
                    />
                    <Bar
                      dataKey="cost"
                      name="Operational Cost"
                      fill="#FFA987"
                      radius={[4, 4, 0, 0]}
                      barSize={25}
                    />
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
              <CardTitle className="text-base font-semibold">Recent Trips</CardTitle>
              <Link href="/trips">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
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
                    {tripsLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={`skeleton-${i}`} className="border-b border-border">
                            <td className="px-4 py-3">
                              <Skeleton className="h-4 w-16" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton className="h-4 w-24" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton className="h-4 w-32" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton className="h-4 w-16" />
                            </td>
                          </tr>
                        ))
                    ) : recentTrips.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      recentTrips.map((trip: any) => (
                        <tr
                          key={trip.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium">{trip.id}</td>
                          <td className="px-4 py-3">
                            {trip.vehicle?.registration || trip.vehicleId}
                          </td>
                          <td className="px-4 py-3">{trip.driver?.name || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="secondary"
                              className={
                                trip.status === 'COMPLETED'
                                  ? 'bg-success/10 text-success'
                                  : trip.status === 'DISPATCHED'
                                    ? 'bg-info/10 text-info'
                                    : trip.status === 'ASSIGNED'
                                      ? 'bg-warning/10 text-warning'
                                      : 'bg-muted text-muted-foreground'
                              }
                            >
                              {trip.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {trip.status === 'COMPLETED'
                              ? '—'
                              : trip.status === 'DRAFT'
                                ? 'Awaiting vehicle'
                                : trip.estimatedArrival
                                  ? new Date(trip.estimatedArrival).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No recent trips.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Vehicle Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  {dashLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <span className="text-xl font-bold">
                      {String(dashboardData?.availableVehicles || 0).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">On Trip</span>
                  </div>
                  {dashLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <span className="text-xl font-bold">
                      {String(dashboardData?.activeVehicles || 0).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span className="text-sm font-medium">In Shop</span>
                  </div>
                  {dashLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <span className="text-xl font-bold">
                      {String(dashboardData?.maintenanceVehicles || 0).padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log & Shift Notes */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {auditLoading ? (
                  Array(5)
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
                  auditData.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex gap-4 items-start pb-4 border-b border-border last:border-0"
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">{log.userName}</span>{' '}
                          {log.action.replace(/_/g, ' ')}: {log.details}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString()}
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

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Shift Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {notesLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))
                ) : notesData && notesData.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  notesData.map((note: any) => (
                    <div
                      key={note.id}
                      className="p-3 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">{note.authorName}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No notes for this shift.
                  </p>
                )}
              </div>
              <div className="mt-auto space-y-3">
                <Textarea
                  placeholder="Leave a note for the next shift..."
                  className="resize-none h-20"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleAddNote}
                  disabled={isSubmittingNote || !newNote.trim()}
                >
                  {isSubmittingNote ? 'Saving...' : 'Add Note'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
