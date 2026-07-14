import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Save, Check, Minus, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeamUsers(data.users || []);
        setInvitations(data.invitations || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role === 'ADMIN') {
          fetchUsers();
        }
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  const bentoCardStyle = "group hover:border-border/80 transition-all duration-300 hover:shadow-md flex flex-col";

  return (
    <>
      <Head>
        <title>Settings | TransitOps</title>
      </Head>
      
      <div className="flex-1 space-y-8 p-1 sm:p-4">
        {/* Classy Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/60">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {user?.role === 'ADMIN' && (
              <TabsTrigger value="team">Team Management</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card className={bentoCardStyle}>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company details and primary depot location.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="TransitOps Logistics Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                    <Input id="taxId" defaultValue="XX-XXXXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Primary Depot Address</Label>
                  <Input id="address" defaultValue="100 Logistics Way, Chicago, IL 60601" />
                </div>
              </CardContent>
            </Card>

            <Card className={bentoCardStyle}>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Configure regional and measurement units.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Distance Unit</Label>
                    <p className="text-sm text-muted-foreground">Use kilometers across the platform.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="font-normal">km</Label>
                    <Switch />
                    <Label className="font-normal text-muted-foreground">mi</Label>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Currency</Label>
                    <p className="text-sm text-muted-foreground">Default currency for all financial records.</p>
                  </div>
                  <select className="flex h-10 w-[120px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="inr">INR (₹)</option>
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                    <option value="gbp">GBP (£)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-6">
            <Card className={bentoCardStyle}>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what updates you want to receive via email.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dispatch Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive an email when a trip is dispatched or delayed.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified when vehicles are due for service.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.role === 'ADMIN' && (
            <TabsContent value="team" className="space-y-6">
              <Card className={bentoCardStyle}>
                <CardHeader>
                  <CardTitle>Invite New User</CardTitle>
                  <CardDescription>Generate a magic link to invite a new employee to TransitOps.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const name = formData.get('name') as string;
                      const email = formData.get('email') as string;
                      const role = formData.get('role') as string;
                      
                      try {
                        const res = await fetch('/api/auth/register', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({ name, email, role })
                        });
                        
                        const data = await res.json();
                        if (res.ok) {
                          toast.success(`Invitation sent successfully to ${email}!`);
                          form.reset();
                          fetchUsers();
                        } else {
                          toast.error(`Error: ${data.message}`);
                        }
                      } catch (error) {
                        toast.error('Failed to invite user');
                      }
                    }}
                    className="space-y-4 max-w-md"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" required placeholder="john@transitops.in" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select id="role" name="role" required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="FLEET_MANAGER">Fleet Manager</option>
                        <option value="DISPATCHER">Dispatcher</option>
                        <option value="SAFETY_OFFICER">Safety Officer</option>
                        <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full">
                      Send Email Invitation
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className={bentoCardStyle}>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>Manage active members of your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamUsers.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.role}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                  try {
                                    const res = await fetch('/api/users', {
                                      method: 'DELETE',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                      },
                                      body: JSON.stringify({ id: u.id })
                                    });
                                    if (res.ok) {
                                      toast.success('User deleted');
                                      fetchUsers();
                                    } else {
                                      const data = await res.json();
                                      toast.error(data.message || 'Failed to delete user');
                                    }
                                  } catch(e) {
                                    toast.error('Error deleting user');
                                  }
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {invitations.length > 0 && (
                <Card className={bentoCardStyle}>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>Users who have been invited but haven't set up their accounts.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Expires</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((inv: any) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium">{inv.name}</TableCell>
                            <TableCell>{inv.email}</TableCell>
                            <TableCell>{inv.role}</TableCell>
                            <TableCell>{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}
