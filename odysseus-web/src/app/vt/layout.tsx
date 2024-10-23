"use client"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { usePathname } from 'next/navigation'
import { Space } from '@mantine/core';
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
        <section style={{ display: 'flex', flexDirection: 'column', height: '100vh' }} >
            <Header />
            <main style={{ margin: "15px", flex: 1 }}>
                {children}
            </main>
            <Space h="xl" />
            <Space h="xl" />
            <Footer />
        </section>
    )
}