"use client"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function InnerLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <section>
            <Header />
            {children}
            <Footer />
        </section >
    )
}