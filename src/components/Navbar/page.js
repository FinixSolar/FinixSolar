// import tailwind from "../../../tailwind.config";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const hasProfileImage = false;

  return (
    <div className="w-full relative">
      <nav className="w-full bg-white border border-gray-200 shadow-sm fixed top-0 z-50">
        <div className="flex w-full items-center justify-between px-10 h-16">

          {/* <!-- Left Section --> */}
          <div className="flex items-center space-x-10">

            {/* <!-- Logo --> */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#1e6cfc] flex items-center justify-center">
                {/* <!-- Solar Icon --> */}
                <svg xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5 text-white">
                  <path strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2m0 14v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              </div>

              <span className="font-semibold text-gray-900 text-2xl">
                Finix Solar
              </span>
            </Link>

            {/* <!-- Navigation Links --> */}
            <div className="hidden md:flex items-center h-16">
              <Link href="/dashboard"
                className="px-4 h-full flex items-center text-lg font-medium text-gray-600 hover:text-gray-900 hover:border-b-2 border-[#1e6cfc]  transition">
                Dashboard
              </Link>

              <Link href="/addClient"
                className="px-4 h-full flex items-center text-lg text-gray-600 hover:text-gray-900 hover:border-b-2 border-[#1e6cfc]  transition">
                Add Client
              </Link>

              <Link href="/bulkUpload"
                className="px-4 h-full flex items-center text-lg text-gray-600 hover:text-gray-900 hover:border-b-2 border-[#1e6cfc] transition">
                Bulk Upload
              </Link>

              <Link href="/members"
                className="px-4 h-full flex items-center text-lg text-gray-600 hover:text-gray-900 hover:border-b-2 border-[#1e6cfc]  transition">
                Members
              </Link>
            </div>
          </div>

          {/* <!-- Right Section --> */}
          <div className="flex items-center gap-6">

            {/* <!-- Notification --> */}
            <button className="text-gray-600 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="w-5 h-5">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.31 6.022 23.848 23.848 0 005.454 1.31m5.713 0a3 3 0 11-5.713 0m5.713 0H9.144" />
              </svg>
            </button>

            {/* <!-- Profile --> */}
            {hasProfileImage ? (
              <Image
                src="/profile.jpg"
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full border border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold">
                <i className="fa-solid fa-circle-user text-[2rem] text-[#1e6cfc]"></i>
              </div>
            )}
          </div>

        </div>
      </nav>
    </div>
  )
}

export default Navbar;