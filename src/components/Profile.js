import React from 'react';
import { useUser } from './contexts/UserContext';
import { LogoutButton } from '../auth/LogoutButton';
import ProfileImageUpload from './userProfile/ProfileImageUpload';

import { useQuery } from '@tanstack/react-query';
import { FetchAPI } from '../api';
import useClient from './hooks/useClient';

import { Text, ActionIcon, Switch, Avatar, Menu, Group } from '@mantine/core';
import { PRO2_USERMENU_PROFILE, PRO2_USERMENU_OPEN_IN_NEW, PRO2_USERMENU_DARKTHEME, CORE2_LINK, IconSun, IconMoonStars, PRO2_USERMENU_LOGOUT } from '../svgicons/svgicons';
import { MaterialIcon } from '../google-api-MSO/MaterialIcon';

const Profile = ({ darkMode, onToggle, onBackgroundStyle }) => {
    const { userData } = useUser();
    const { userid } = userData;
    const client = useClient();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State to control dialog visibility
    //------------------------------------------------------------------------------------------
    // Get user details
    //------------------------------------------------------------------------------------------
    const userInfoUri = `IBIF_ex=FRAPI_GetTable_FRPUSER` +
                `&USER_ID=${userid}`+
                `&&CLIENT=${client}`; // Relative URL

    const {data: userDetails} = useQuery({
      queryKey: ['userDetail', userInfoUri, userid],
      queryFn: () => FetchAPI(userInfoUri),
      enabled: !!userid, 
    });

    // console.log("userDetails :: ", userDetails);
    const userFirstName = userDetails?.sort_keys?.[0]?.verbs?.[0]?.USER_FNAME || '';
    const userLastName = userDetails?.sort_keys?.[0]?.verbs?.[0]?.USER_LNAME || '';

    const sanitizedFirstName = userFirstName.replace(/\s+/g, ''); // Remove all spaces
    const profileImage = `/users/profileimage/${sanitizedFirstName}${userLastName}.png`;
    const profileImageQuality = `/users/profileimage/${sanitizedFirstName}${userLastName}@2x.png 2x, /users/profileimage/${sanitizedFirstName}${userLastName}@3x.png 3x`;

    //------------------------------------------------------------------------------------------
    // Get user Role
    //------------------------------------------------------------------------------------------
    const userRoleUri = `IBIF_ex=FRAPI_GetTable_FRPUSROB` +
                `&USER_ID=${userid}` +
                '&OBJECT_ID=1000'+
                `&&CLIENT=${client}` ; // Relative URL

    const { data: userRoleData } = useQuery({
      queryKey: ['userRole', userRoleUri, userid],  // Include URI for better caching
      queryFn: () => FetchAPI(userRoleUri), // Pass a function reference
      enabled: !!userid, // Trigger only if userRoleUri is valid
    });
    
    // console.log("data :: ", userRoleData?.[0]?.OBJECT_ID);
    const objectId = userRoleData?.[0]?.OBJECT_ID;
    // Determine User Role
    const userRole = objectId === 1000 ? 'Administrator' : 'User';

    return (
        <>
          {/* Dropdown Menu */}
          <Menu position="bottom-end" offset={-4} withArrow arrowPosition="center" closeOnItemClick={false} closeOnClickOutside={!isDialogOpen}>  
            <Menu.Target component="div">
              <ActionIcon>
                { profileImage.trim() === ".png" ? (
                  <MaterialIcon iconName="person" color="black" size={33.4} filled={false} weight={200} grade={0} opticalSize={20} className="material-icons-outlined" style={{ fontSize: 33.4, color: 'black' }} />
                ) : (
                  <Avatar variant="outline" radius="xl" size="sm" alt={sanitizedFirstName} src={profileImage} srcSet={profileImageQuality}>{sanitizedFirstName.substring(0, 1).toUpperCase()}</Avatar>
                )}
                
              </ActionIcon>
            </Menu.Target> 
                 
            <Menu.Dropdown>
              <Menu.Item onClick={() => setIsDialogOpen(true)} component="div">
               <ProfileImageUpload userFirstName={sanitizedFirstName} userLastName={userLastName} userRole={userRole} backgroundStyle={onBackgroundStyle}/> {/* User Profile Image editor */}
              </Menu.Item>
              <Menu.Item icon={<ActionIcon color="inherit" style={{ height: 30, width: 30, paddingBottom: 4 }}><PRO2_USERMENU_PROFILE /></ActionIcon>} component="div">
                <Text style={{ textAlign: 'left', fontSize: 13.5, color: '#545454', marginLeft: 5 }}>Profile</Text>
              </Menu.Item>
              <Menu.Item  component="div"
                icon={<ActionIcon color="inherit" style={{ height: 30, width: 30, paddingBottom: 4 }}><PRO2_USERMENU_DARKTHEME /></ActionIcon>}
              >
                <Group justify="space-between" style={{ width: '100%' }}>
                  <Text style={{ textAlign: 'left', fontSize: 13.5, color: '#545454', marginLeft: 5 }}>Dark Theme</Text>
                  <Switch 
                    size="md"
                    color="dark.4"
                    onLabel={<IconSun size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
                    offLabel={<IconMoonStars size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}  
                    checked={darkMode} 
                    onChange={onToggle} 
                  />
                </Group>
              </Menu.Item>
              <Menu.Divider></Menu.Divider>
              <Menu.Item icon={<ActionIcon style={{ height: 30, width: 30, pb: 2}}><PRO2_USERMENU_LOGOUT /></ActionIcon>}>
                <LogoutButton />
              </Menu.Item>
              <Menu.Divider></Menu.Divider>
              <Menu.Item  component="div"
                onClick={() => window.open(process.env.REACT_APP_CORE2_URL)}
                icon={<ActionIcon style={{ height: 30, width: 30, paddingBottom: 2, marginRight: 10}}><PRO2_USERMENU_OPEN_IN_NEW /></ActionIcon>}>
                <ActionIcon style={{ marginLeft: 32}}><CORE2_LINK /></ActionIcon>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </>
      );
};

export default Profile;
