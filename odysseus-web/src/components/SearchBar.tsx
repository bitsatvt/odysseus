import { useState } from 'react';
import { SegmentedControl, TextInput, Container } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export default function SearchBar() {
  const [searchType, setSearchType] = useState('course');

  return (
    <Container size={420} px={0} style={{ marginTop: '2rem', position: 'relative', maxWidth: "800px" }}>
      <IconSearch style={{
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
      }} size={18} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid red',
        borderRadius: '50px',
        padding: '0.5rem 1rem',
        backgroundColor: '#ede9f4',
        paddingLeft: '40px'
      }}>
        <SegmentedControl
          value={searchType}
          onChange={setSearchType}
          data={[
            { label: 'Course', value: 'course' },
            { label: 'Instructor', value: 'instructor' },
          ]}
          size="sm"
          radius="xl"
          color="orange"
          style={{ marginRight: '8px' }}
        />
        <TextInput
          placeholder={`Enter a ${searchType === 'course' ? 'Course' : 'Instructor'} Name`}
          radius="xl"
          size="sm"
          style={{ flex: 1 }}
        />
      </div>
    </Container>
  );
}