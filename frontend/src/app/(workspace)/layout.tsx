import { CyMedSidebar } from "@/components/layout/CyMedSidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div
        className="flex h-screen w-full overflow-hidden font-sans"
        style={{ background: "#080d18" }}
      >
        <CyMedSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
