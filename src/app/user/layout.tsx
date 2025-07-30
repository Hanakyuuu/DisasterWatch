import { AppSidebar } from '@/components/AppSidebar'; 
import { SidebarProvider } from '@/components/ui/sidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
