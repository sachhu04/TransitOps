import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Save, Check, Minus, Copy } from "lucide-react";
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
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Settings | TransitOps</title>
      </Head>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
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
            <Card>
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

            <Card>
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
            <Card>
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
              <Card>
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
                          setInviteLink(data.inviteLink);
                          form.reset();
                        } else {
                          alert(`Error: ${data.message}`);
                        }
                      } catch (error) {
                        alert('Failed to invite user');
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
                      Generate Invite Link
                    </Button>
                  </form>
                  
                  {inviteLink && (
                    <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-2">
                      <Label className="text-primary font-semibold">User invited successfully!</Label>
                      <p className="text-sm text-muted-foreground">Copy the magic link below and send it to the employee so they can set up their account and password.</p>
                      <div className="flex gap-2">
                        <Input readOnly value={inviteLink} className="bg-background font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(inviteLink)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reset User Password</CardTitle>
                  <CardDescription>Generate a reset link for an existing user who forgot their password.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const email = formData.get('resetEmail') as string;
                      
                      try {
                        const res = await fetch('/api/auth/generate-reset', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({ email })
                        });
                        
                        const data = await res.json();
                        if (res.ok) {
                          setResetLink(data.resetLink);
                          form.reset();
                        } else {
                          alert(`Error: ${data.message}`);
                        }
                      } catch (error) {
                        alert('Failed to generate reset link');
                      }
                    }}
                    className="space-y-4 max-w-md"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Employee Email Address</Label>
                      <Input id="resetEmail" name="resetEmail" type="email" required placeholder="john@transitops.in" />
                    </div>
                    <Button type="submit" variant="secondary" className="w-full">
                      Generate Reset Link
                    </Button>
                  </form>
                  
                  {resetLink && (
                    <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-2">
                      <Label className="text-primary font-semibold">Reset Link Generated</Label>
                      <p className="text-sm text-muted-foreground">Copy the link below and send it to the employee.</p>
                      <div className="flex gap-2">
                        <Input readOnly value={resetLink} className="bg-background font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(resetLink)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}
