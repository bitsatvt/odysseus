"use client"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { usePathname } from 'next/navigation'

export default function InnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    return (
        <section style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {!isHomePage && <Header />}
            <main style={{ margin: "15px", flex: 1 }}>
                {children}
            </main>
            <Footer />
        </section>
    )
}