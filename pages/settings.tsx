import React from "react";
import Head from "next/head";
import { Save, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
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
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
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
          
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Based Access Control</CardTitle>
                <CardDescription>Manage what each role can view and edit.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">ROLE</TableHead>
                      <TableHead>FLEET</TableHead>
                      <TableHead>DRIVERS</TableHead>
                      <TableHead>TRIPS</TableHead>
                      <TableHead>FUEL/EXP.</TableHead>
                      <TableHead>ANALYTICS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Fleet Manager</TableCell>
                      <TableCell><Check className="h-4 w-4" /></TableCell>
                      <TableCell><Check className="h-4 w-4" /></TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Check className="h-4 w-4" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dispatcher</TableCell>
                      <TableCell>View</TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Check className="h-4 w-4" /></TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Safety Officer</TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Check className="h-4 w-4" /></TableCell>
                      <TableCell>View</TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Financial Analyst</TableCell>
                      <TableCell>View</TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Minus className="h-4 w-4" /></TableCell>
                      <TableCell><Check className="h-4 w-4" /></TableCell>
                      <TableCell><Check className="h-4 w-4" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
