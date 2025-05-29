import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import "../globals.css";
import TabNavigation from "@/components/TabNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audioboom",
  description: "Your personal audiobook manager",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen items-center">
      <div className="flex flex-col rounded-lg m-8 p-5 items-center w-full md:w-3/4">
        <Card className="w-full m-2">
          <CardHeader>
            <CardTitle>Audioboom</CardTitle>
            <CardDescription>Download thousands of audiobooks</CardDescription>
          </CardHeader>
        </Card>
        <TabNavigation />
        <div className="pb-2" />
        {children}
      </div>
    </div>
  );
}
