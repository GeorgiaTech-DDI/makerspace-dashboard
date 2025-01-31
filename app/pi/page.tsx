"use client";

import React, { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/ui/mode-toggle";

import Sidebar from "../src/ui/navigation/sidebar";
import EquipmentUsageCard from "../src/ui/visuals/header-visuals/equipment-usage";
import MetricCard from "../src/ui/visuals/metric-cards/metric-card";
import CurrentCapacity from "../src/ui/visuals/header-visuals/current-capacity";
import DashboardSettingsDrawer from "../src/ui/navigation/drawer";
import componentRegistry from "./piComponentsList";
import withSourceIcon from "../src/ui/visuals/wrappers/withSourceIcon";

const PiPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Load saved preferences from localStorage on initial render
  const loadSavedPreferences = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("piPreferences");
      if (saved) {
        try {
          const { selectedComponents, componentOrder } = JSON.parse(saved);
          return {
            selectedComponents:
              selectedComponents || Object.keys(componentRegistry),
            componentOrder: componentOrder || Object.keys(componentRegistry),
          };
        } catch (e) {
          console.error("Error loading saved preferences:", e);
        }
      }
    }
    return {
      selectedComponents: Object.keys(componentRegistry),
      componentOrder: Object.keys(componentRegistry),
    };
  };

  const [selectedComponents, setSelectedComponents] = useState(
    Object.keys(componentRegistry),
  );
  const [componentOrder, setComponentOrder] = useState(
    Object.keys(componentRegistry),
  );

  // Load preferences after mount
  useEffect(() => {
    const { selectedComponents: savedSelected, componentOrder: savedOrder } =
      loadSavedPreferences();
    setSelectedComponents(savedSelected);
    setComponentOrder(savedOrder);
    setIsMounted(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "piPreferences",
        JSON.stringify({
          selectedComponents,
          componentOrder,
        }),
      );
    }
  }, [selectedComponents, componentOrder, isMounted]);

  const handleSettingsSubmit = (data: { components: string[] }) => {
    setSelectedComponents(data.components);
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    const newOrder = [...componentOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setComponentOrder(newOrder);
  };

  const renderComponents = () => {
    // If not mounted yet, render in default order to match SSR
    const orderToUse = isMounted
      ? componentOrder
      : Object.keys(componentRegistry);
    const selectedToUse = isMounted
      ? selectedComponents
      : Object.keys(componentRegistry);

    const fullWidthComponents = [];
    const halfWidthComponents = [];

    orderToUse.forEach((componentId) => {
      if (!selectedToUse.includes(componentId)) return;

      const config = componentRegistry[componentId];
      if (config.defaultSize === "full") {
        fullWidthComponents.push(config);
      } else {
        halfWidthComponents.push(config);
      }
    });

    return (
      <>
        <div className="grid md:grid-cols-2 gap-4">
          {halfWidthComponents.map((config) => {
            const Component = config.component;
            const WrappedComponent = withSourceIcon(Component, config.source);
            return (
              <div key={config.id} className="transition-opacity duration-200">
                <WrappedComponent />
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          {fullWidthComponents.map((config) => {
            const Component = config.component;
            const WrappedComponent = withSourceIcon(Component, config.source);
            return (
              <div key={config.id} className="transition-opacity duration-200">
                <WrappedComponent />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold flex-1">
              Prototyping Instructors Dashboard
            </h1>
            <DashboardSettingsDrawer
              selectedComponents={selectedComponents}
              componentOrder={componentOrder}
              onSettingsSubmit={handleSettingsSubmit}
              onOrderChange={moveComponent}
              componentRegistry={componentRegistry}
            />
            <ModeToggle />
          </header>

          <main className="flex-1 p-4 space-y-4">
            {/* Fixed metric cards row */}
            {/* <div className="grid md:grid-cols-4 gap-4">
              <EquipmentUsageCard />
              {metricData.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={parseInt(metric.value)}
                  change={metric.change}
                  trend={metric.trend}
                />
              ))}
              <CurrentCapacity />
            </div> */}

            {/* Dynamic components */}
            {renderComponents()}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PiPage;
