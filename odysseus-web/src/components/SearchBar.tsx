import { useState } from 'react';
import { SegmentedControl, TextInput, Container } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export default function SearchBar() {
  const [searchType, setSearchType] = useState('course');

  return (
    <Container size={420} px={0} style={containerStyle}>

      <div style={searchBarStyle}>
        <IconSearch style={iconStyle} size={18} />
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
          style={{ marginRight: '1%' }}
        />
        <TextInput
          placeholder={`Enter a ${searchType === 'course' ? 'Course' : 'Instructor'} Name`}
          radius="xl"
          size="sm"
          style={{ flex: 'flex-shrink' }}
        />
      </div>
    </Container>
  );
}

// Styles
const containerStyle = {
  maxWidth: "90%",
  height: "50%",
};

const iconStyle = {
  marginRight: '3%'
};

const searchBarStyle = {
  display: 'flex',
  alignItems: 'center',
  border: '1% solid red',
  borderRadius: '2rem',
  padding: '1% 2%',
  backgroundColor: '#ede9f4',
  paddingLeft: '5%',
  flexShrink: "1",
};
