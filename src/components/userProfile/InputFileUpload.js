import React, { useRef } from 'react';
import { Button } from '@mantine/core';
import { CloudeUpload } from '../../svgicons/svgicons.js';

const InputFileUpload = ({ onChangeHandle }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Button
      leftIcon={<CloudeUpload />}
      styles={{ root: { textTransform: 'none' } }}
      onClick={handleClick}
    >
      Upload Profile Photo
      <input
        ref={fileInputRef}
        type="file"
        onChange={onChangeHandle}
        multiple
        style={{ display: 'none' }}
      />
    </Button>
  );
};

export default InputFileUpload;
