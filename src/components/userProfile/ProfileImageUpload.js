import React, { useState, useRef } from 'react';
import axios from 'axios'; 
import AvatarEditor from '../react-avatar-editor/index.ts';
import { Avatar, Button, ActionIcon, Flex, Stack, Text, Group, Modal, Slider, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import InputFileUpload from './InputFileUpload.js';
import { ROTATE_LEFT_CIRCLE, ROTATE_RIGHT_CIRCLE, AddIcon, MinusIcone } from '../../svgicons/svgicons.js';

const ProfileImageUpload = ({ userFirstName, userLastName, userRole, backgroundStyle }) => {
  const [profileImage, setProfileImage] = useState(`/users/profileimage/${userFirstName}${userLastName}.png`);
  const profileImageQuality = `/users/profileimage/${userFirstName}${userLastName}@2x.png 2x, /users/profileimage/${userFirstName}${userLastName}@3x.png 3x`;
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(`/users/profileimage/${userFirstName}${userLastName}.png`);
  const editorRef = useRef(null); // Create ref with useRef
  const [scale, setScale] = useState(1.2); // State for zoom level
  const [rotation, setRotation] = useState(0); // used for Rotating images

  const [opened, { open, close }] = useDisclosure(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setLoading(false);
      };
      reader.onerror = () => {
        console.error('There was an error reading the file!');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };


  // Handle file upload (save)
  const handleUpload = async (event, blob) => {
    event.preventDefault();
    if (blob) {
      const formData = new FormData();
      formData.append('file', blob, `${userFirstName}${userLastName}.png`);

      try {
        const response = await axios.post(`${process.env.REACT_APP_NODE_EXPRESS_URL}/api/upload-profile-image/${userFirstName}${userLastName}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.filePath) {
          setProfileImage(response.data.filePath);
        }
      } catch (error) {
        console.error('Error uploading the file:', error);
      }
    }
  };

  // Handle the edited image from AvatarEditor
  const handleEditedImage = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob((blob) => {
        if (blob) handleUpload(e, blob);
      });
    }
  };

  // Handle the Rotate image functions
  const rotateLeft = () => {
    setRotation((prevRotation) => prevRotation - 90 );
  };

  const rotateRight = () => {
    setRotation((prevRotation) => prevRotation + 90 );
  };

  return (
    <Flex>
        <Group align="center" justify="flex-start" style={{ width: '100%' }} onClick={open}>
          <ActionIcon>
            <Avatar variant="outline" radius="xl" size="md" alt={userFirstName} src={profileImage} srcSet={profileImageQuality}>
              {userFirstName.substring(0, 1).toUpperCase()}
            </Avatar>
          </ActionIcon>
        
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, padding: 0 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 13.5, color: '#545454', marginBottom: 2 }}>
              {userFirstName} {userLastName}
            </Text>
            <Text style={{ fontSize: 13.5, color: '#545454', marginTop: 0 }}>{userRole}</Text>
          </div>
        </Group>

        {/* Modal fro Upload */ }
        <Modal opened={opened} onClose={close} title="Edit Profile Photo" centered
          styles={{
            header: { background: `${backgroundStyle}`, color: 'white', padding: '10px' },
            title: { color: 'white' }, // Ensure text color is visible
          }}
        >
          <Stack spacing="md" style={{ marginTop: 10}}>
            <InputFileUpload onChangeHandle={handleFileChange} />
            {loading ? (
                <Skeleton height={50} circle mb="xl" />
              ) : (
                previewUrl && (
                  <Group spacing="xs">
                    <AvatarEditor
                      ref={editorRef} // Assign the ref here
                      image={previewUrl}
                      width={300}
                      height={300}
                      border={50}
                      borderRadius={150}
                      //color={[255, 255, 255, 0.6]}
                      scale={scale} // Set the scale value
                      rotate={rotation}
                    />
                  </Group>
                )
              )}
  
              {/* Zoom & Rotate Controls */}
              <Stack spacing="sm">
                <Group position="apart">
                  <Text>Zoom</Text>
                  <Group spacing="xs">
                    <ActionIcon onClick={rotateRight} title='Rotate to right'><ROTATE_RIGHT_CIRCLE /></ActionIcon>
                    <ActionIcon onClick={rotateLeft} title='Rotate to left'><ROTATE_LEFT_CIRCLE /></ActionIcon>
                  </Group>
                </Group>

                <Group spacing={5} align="center">
                  <ActionIcon style={{ marginRight: 0 }}><MinusIcone color="blue" /></ActionIcon>
                  <Slider value={scale} min={0.5} max={4} step={0.1} defaultValue={1.2} onChange={setScale} labelAlwaysOn 
                    style={{ flexGrow: 100 }} // Makes slider take most of the space
                  />
                  <ActionIcon style={{ marginLeft: 0 }}><AddIcon color="blue" /></ActionIcon>
                </Group>
              </Stack>

              {/* Save Button */}
              <Button fullWidth onClick={handleEditedImage} color='blue'>Save Photo</Button>
          </Stack>
        </Modal>
    </Flex>
  );
};

export default ProfileImageUpload;
