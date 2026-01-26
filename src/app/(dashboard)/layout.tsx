import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col w-full">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;