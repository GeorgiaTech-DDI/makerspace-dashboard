"use client";

import Sidebar from "./src/ui/navigation/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          {/* Hero Section */}
          <header className="relative h-[60vh] bg-cover bg-center bg-[url('https://inventionstudio.gatech.edu/files/2024/08/IS-SM24-24.jpg')] text-white">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 flex h-full flex-col justify-center px-8">
              <h1 className="text-4xl font-extrabold md:text-6xl">
                Georgia Tech Invention Studio Dashboard
              </h1>
              <p className="mt-4 text-lg md:text-xl max-w-2xl">
                Access real-time data, track attendance, monitor machine usage,
                and explore insights for the Invention Studio.
              </p>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-8 bg-gray-50">
            {/* Section: Dashboard Access */}
            <section className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white shadow-md rounded-lg backdrop-blur-md backdrop-opacity-80">
                <CardHeader className="p-4">
                  <CardTitle className="text-3xl font-semibold text-gray-800">
                    Main Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-gray-600">
                  <p>
                    Access the main dashboard to view analytics and monitor the
                    overall usage of tools and resources within the Invention
                    Studio.
                  </p>
                  <Button
                    asChild
                    className="mt-6 w-full bg-primary hover:bg-[#003057] active:bg-[#003057] transform transition duration-200 ease-in-out hover:scale-105"
                  >
                    <Link href="/dashboard">Enter Main Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md rounded-lg backdrop-blur-md backdrop-opacity-80">
                <CardHeader className="p-4">
                  <CardTitle className="text-3xl font-semibold text-gray-800">
                    PI Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-gray-600">
                  <p>
                    Monitor the status of PI devices, manage networked tools,
                    and access data specifically related to the PI network in
                    the studio.
                  </p>
                  <Button
                    asChild
                    className="mt-6 w-full bg-primary hover:bg-[#003057] active:bg-[#003057] transform transition duration-200 ease-in-out hover:scale-105"
                  >
                    <Link href="/pi">Enter Pi Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Section: About the Invention Studio */}
            <section className="grid md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-semibold text-gray-800">
                  Learn More About the Invention Studio
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  The Invention Studio is Georgia Tech’s premier makerspace,
                  where students have free access to a wide range of tools,
                  including 3D printers, laser cutters, and CNC machines, to
                  bring their ideas to life.
                </p>
                <Button
                  asChild
                  className="mt-6 w-max bg-primary hover:bg-[#003057] active:bg-[#003057] transform transition duration-200 ease-in-out hover:scale-105"
                >
                  <Link
                    href="https://inventionstudio.gatech.edu/"
                    target="_blank"
                  >
                    Visit the Official Website
                  </Link>
                </Button>
              </div>
              <div className="bg-gray-300 h-64 rounded-md overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/p/AF1QipPtRNRd6901olELv6rrqgd3RlAXjHoljs8Ki_fu=s680-w680-h510"
                  alt="Invention Studio"
                  className="h-64 w-full object-cover rounded-md transform transition duration-500 ease-in-out hover:scale-105 hover:brightness-110"
                />
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="flex justify-center items-center p-4 bg-gray-100 text-gray-500">
            <p>
              Designed by Smart<sup>3</sup> Makerspaces
            </p>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
