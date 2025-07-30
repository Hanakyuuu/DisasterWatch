import { AdminSidebar } from '@/components/AdminSidebar'; 
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
