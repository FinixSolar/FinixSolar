/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",     // For App Router projects
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",   // For Pages Router projects
        "./components/**/*.{js,ts,jsx,tsx,mdx}", // For Shared Components folder],
    ],
    theme: {
        extend: {
            // colors: {            }
        },
    },
    plugins: [],
}
