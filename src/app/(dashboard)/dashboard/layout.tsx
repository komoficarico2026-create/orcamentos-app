import AuthGuard from "@/components/auth/AuthGuard";
import DashboardNav from "@/components/auth/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthGuard> - Temporarily disabled for UI testing
      <div className="flex h-screen bg-background overflow-hidden">
        <DashboardNav />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    // </AuthGuard>
  );
}
