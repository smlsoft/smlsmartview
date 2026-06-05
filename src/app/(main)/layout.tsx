import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { MainScrollArea } from "@/components/layout/MainScrollArea";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TopNav } from "@/components/layout/TopNav";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";

export default async function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div className="premium-page-bg fixed inset-0 flex flex-col overflow-hidden p-3 text-text-primary md:p-4">
      <MainLayoutWrapper 
        topbar={
          <Topbar
            user_name={session.user_name}
            db_name={session.db_name}
            db_code={session.db_code}
          />
        }
        sidebar={<Sidebar />}
        topNav={<TopNav />}
        mainContent={
          <MainScrollArea>
            <div className="mx-auto w-full max-w-canvas pb-3 md:pb-4 flex-1 flex flex-col">
              {children}
            </div>
          </MainScrollArea>
        }
      />
    </div>
  );
}
