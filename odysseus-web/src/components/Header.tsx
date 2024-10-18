import React from 'react';
import SearchBar from './SearchBar';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header style={styles.header}>
            {/* Logo and Odysseus Text */}
            <div style={styles.logoContainer}>
                <img src="/OfficialOdysseusLogo.png" alt="Odysseus Logo" style={styles.logoImage} />
                <span style={styles.odysseusText}>Odysseus</span>
            </div>

            {/* Virginia Tech Text */}
            <div style={styles.virginiaTechContainer}>
                <Link href={"/vt"}>
                    <span style={styles.virginiaText}>Virginia</span>
                    <span style={styles.techText}>Tech</span>
                </Link>
            </div>
            {/* Search Bar */}
            <div style={styles.searchBar}>
                <SearchBar />
            </div>
        </header>
    );
};

const styles = {
    searchBar: {
        width: "75%",
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5% 2% 0% 2%',
        backgroundColor: '#fff',
    },
    logoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: "7%",
        height: "7%",
        flexShrink: "1",
        margin: "0% 5% 0% 0%",
    },
    logoImage:
    {
        width: "90%",
        height: "90%",
    },
    odysseusText: {
        fontFamily: "'Just Another Hand', cursive",
        lineHeight: "100%",
        fontSize: '150%',
        color: '#000',
        textShadow: '1% 1% 3% rgba(0, 0, 0, 0.4)',
    },
    virginiaTechContainer: {
        display: 'flex',
        alignItems: 'center',
        fontWeight: '550',
        fontSize: '150%',
        textShadow: '0% 4% 4% rgba(0, 0, 0, 0.2)', // Slight shadow for effect
        fontFamily: "Alata",
        margin: "0% 5% 0% 5%",
        flexShrink: "1",
    },
    virginiaText: {
        paddingRight: "5%",
        color: '#eb0000',
    },
    techText: {
        color: '#eb6200',
    },
};

export default Header;