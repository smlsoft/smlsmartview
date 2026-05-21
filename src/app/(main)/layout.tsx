import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { MainScrollArea } from "@/components/layout/MainScrollArea";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

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
    <div className="premium-page-bg fixed inset-0 flex flex-col gap-3 overflow-hidden p-3 text-text-primary md:gap-4 md:p-4">
      <Topbar
        user_name={session.user_name}
        db_name={session.db_name}
        db_code={session.db_code}
      />
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden md:gap-4">
        <Sidebar />
        <MainScrollArea>
          <div className="mx-auto w-full max-w-canvas pb-3 md:pb-4">
            {children}
          </div>
        </MainScrollArea>
      </div>
    </div>
  );
}
