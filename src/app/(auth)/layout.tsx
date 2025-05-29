import { Geist } from "next/font/google";
import "../globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "Login - Audioboom",
  description: "Access your audiobook manager",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${geist.className} min-h-screen bg-background`}>
      {children}
    </div>
  );
}
