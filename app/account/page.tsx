"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";
import Sidebar from "../src/ui/navigation/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const isProduction = process.env.NODE_ENV === "production";
const BYPASS_CAS =
  process.env.NEXT_PUBLIC_BYPASS_CAS !== undefined
    ? process.env.NEXT_PUBLIC_BYPASS_CAS === "true"
    : isProduction;

const CAS_CONFIG = {
  protocol: "https",
  hostname: "sso.gatech.edu",
  port: 443,
  uri: "/cas",
};

const AccountPage = () => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to check session:", error);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleLogin = () => {
    const baseUrl = window.location.origin;
    const serviceUrl = `${baseUrl}/account`;

    if (BYPASS_CAS) {
      const mockTicket = `ST-MOCK-${Date.now()}-gburdell3`;
      window.location.href = `${serviceUrl}?ticket=${mockTicket}`;
    } else {
      window.location.href = `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}${CAS_CONFIG.uri}/login?service=${encodeURIComponent(serviceUrl)}`;
    }
  };

  const handleLogout = () => {
    const baseUrl = window.location.origin;
    const serviceUrl = `${baseUrl}/account`;
    window.location.href = `/api/auth/logout?service=${encodeURIComponent(serviceUrl)}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-pulse text-muted-foreground">
              Loading...
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your GT account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user ? (
            <>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {user.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user}</h3>
                  <p className="text-sm text-muted-foreground">
                    Georgia Tech Account
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span>{user}@gatech.edu</span>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Sign in with your GT account to access dashboard features
                </p>
              </div>
              <Button className="w-full" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with GT Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold flex-1">Account Settings</h1>
          </header>
          <main className="flex-1 p-4 flex items-center justify-center">
            {renderContent()}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AccountPage;
