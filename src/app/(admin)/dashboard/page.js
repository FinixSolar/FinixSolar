import Navbar from "@/components/Navbar/page";
import Link from "next/link";

export default function Dashboard() {
    const products = [
        {
            id: 1,
            name: 'Apple MacBook Pro 17"',
            color: "Silver",
            category: "Laptop",
            price: "$2999",
        },
        {
            id: 2,
            name: "Microsoft Surface Pro",
            color: "White",
            category: "Laptop PC",
            price: "$1999",
        },
        {
            id: 3,
            name: "Magic Mouse 2",
            color: "Black",
            category: "Accessories",
            price: "$99",
        },
    ];

    return (
        <div >
            <Navbar />
            <main className="flex flex-col w-full h-screen pt-25 px-10 pb-10 bg-gray-100">
                <div>
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <p className="mt-4 text-gray-600">Welcome to the admin dashboard. Here you can manage Clients.</p>
                </div>
                {/*search bar */}
                <div className="mt-6 flex py-6 flex-1 justify-between w-full max-h-max">
                    <div className="flex items-center w-full max-w-2xl">
                        <input type="text" placeholder="Search by Name/CIN/Consumer No...." className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button className="ml-4 px-4 py-3 bg-[#1e96fc] text-white rounded-md hover:bg-[#072ac8] focus:outline-none focus:ring-2 focus:ring-blue-500">Search</button>
                    </div>
                    <div className="flex items-center">
                        <Link href="/addClient"><button className="px-4 py-3 flex gap-2 bg-[#ffc600] text-black rounded-md hover:bg-[#ffc600] focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h48₀v-32q₀₋₁₁₋₅₋₂₀T58₀₋₃₀₆q₋₅₄₋₂₇₋₁₀₉₋₄₀.₅T36₀₋₃₆₀q₋₅₆ ₀₋₁₁₁ ₁₃.₅T₁₄₀₋₃₀₆q₋₉ ₅₋₁₄.₅ ₁₄t₋₅.伍 ₂₀v³²Zm₂⁹⁶.⁵₋³⁴³.⁵Q⁴⁴₀₋⁶⁰⁷ ⁴⁴₀₋⁶⁴⁰t⁻²³.⁵⁻⁵⁶.⁵Q³⁹³₋７²₀ ³⁶₀₋７²₀t⁻⁵⁶.⁵ ₂³.⁵Q²八十₋６７³ ²八十₋６４⁰t²³.៥ ៥６.៥Q³²７₋５６₀ ³六十₋５六十t fifty-six point five minus twenty-three point five ZM三百 sixty minus six hundred forty Zm zero four hundred Z" /></svg>
                            Add Client
                        </button></Link>
                    </div>
                </div>


                {/* list of clients */}
                <div className="mt-6 flex flex-1 flex-col w-full bg-white rounded-lg shadow-md p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900">Clients</h2>
                        <span className="text-lg text-gray-500">{products.length} clients</span>
                    </div>
                    <div className="rounded-xl  border border-gray-300">
                        <table className="w-full text-sm text-left ">

                            {/* Head */}
                            <thead className="bg-gray-200 text-gray-700 border-b ">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">ID</th>
                                    <th className="px-6 py-3 font-semibold">CIN</th>
                                    <th className="px-6 py-3 font-semibold">Name</th>
                                    <th className="px-6 py-3 font-semibold">Consumer No</th>
                                    <th className="px-6 py-3 font-semibold">Contact No</th>
                                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                                    <th className="px-6 py-3 font-semibold text-right">Delete</th>
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody className="divide-y divide-gray-200">
                                {products.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">

                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {item.id}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {item.color}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {item.category}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {item.price}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {item.price}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href="#"
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Edit
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href="#"
                                                className="text-blue-600 font-medium flex items-center justify-end hover:text-red-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                            </a>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
