import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Map, Truck, Users, Activity, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().min(1, { message: "Please select a role" }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "",
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, role: data.role })
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        toast.error("Login failed", { description: result.message || "Invalid credentials" });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      toast.success("Login successful", {
        description: "Welcome back to TransitOps."
      });
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error", { description: "Something went wrong" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Head>
        <title>Login | TransitOps</title>
      </Head>
      
      {/* Left Panel - Branding & Stats */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/10 rounded-full blur-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white p-2 rounded-xl">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <span className="font-bold text-3xl tracking-tight">TransitOps</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Smart Transport <br /> Operations Platform
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md mb-12">
            Enterprise-grade logistics management. Track your fleet, manage drivers, and optimize routes from a single unified dashboard.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 gap-6 relative z-10"
        >
          <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <Truck className="w-8 h-8 mb-4 text-white/80" />
            <div className="text-3xl font-bold mb-1">2,400+</div>
            <div className="text-sm text-white/70">Active Vehicles</div>
          </div>
          <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <Users className="w-8 h-8 mb-4 text-white/80" />
            <div className="text-3xl font-bold mb-1">8,500+</div>
            <div className="text-sm text-white/70">Registered Drivers</div>
          </div>
          <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 col-span-2">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold">99.9% Uptime</div>
                <div className="text-sm text-white/70">Enterprise-grade reliability</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="bg-primary p-2 rounded-xl">
              <Map className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">TransitOps</span>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-2 text-center pb-8">
              <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@company.com" 
                      {...register("email")}
                      className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-sm font-medium text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        {...register("password")}
                        className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={watch("role")} onValueChange={(val) => val && setValue("role", val as string)}>
                      <SelectTrigger className={errors.role ? "border-destructive focus-visible:ring-destructive" : ""}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
                        <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
                        <SelectItem value="SAFETY_OFFICER">Safety Officer</SelectItem>
                        <SelectItem value="FINANCIAL_ANALYST">Financial Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-destructive font-medium">{errors.role.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    onCheckedChange={(checked) => setValue("rememberMe", checked === true)} 
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 30 days
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            By signing in, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
