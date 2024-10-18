import React from 'react';

const BrownBox: React.FC = () => {
    return (
        <div style={styles.brownBox}>
            {/* You can add content here if needed */}
        </div>
    );
};

const styles = {
    brownBox: {
        backgroundColor: '#971515', // Brown color
        width: '100%',
        height: '3rem', // Adjust the height as needed
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
};

export default BrownBox;
