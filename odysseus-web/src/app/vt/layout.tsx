"use client"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { usePathname } from 'next/navigation'

export default function InnerLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    // Specify the route where you don't want the layout to apply
    const excludeRoute = "/vt";  // Replace with the specific route
    if (pathname === excludeRoute) {
        return <>{children}</>; // Return children without the layout
    }

    return (
        <section >
            <Header />
            <main style={{ margin: "15px" }}>
                {children}
            </main>
            <Footer />
        </section>
    )
}