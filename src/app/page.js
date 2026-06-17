import Image from "next/image";
import navbar from "@/components/Navbar/page";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {navbar()}
      <main className="w-full h-screen">

      </main>
    </div>
  );
}
