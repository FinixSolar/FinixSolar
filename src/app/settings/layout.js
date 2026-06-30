import Navbar from "@/components/Navbar/page";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default function SettingsLayout({ children }) {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            <aside>
              <SettingsSidebar />
            </aside>

            <main className="lg:col-span-3">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
