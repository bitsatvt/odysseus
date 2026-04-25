"use client"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import MicrosoftSignInButton from "@/components/MicrosoftSignInButton"
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
            {isHomePage && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                    <MicrosoftSignInButton />
                </div>
            )}
            {!isHomePage && <Header />}
            <main style={{ margin: "15px", flex: 1 }}>
                {children}
            </main>
            <Footer />
        </section>
    )
}