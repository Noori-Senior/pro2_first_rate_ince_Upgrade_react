import React from "react";
import { useAuth } from "../components/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Text,  } from "@mantine/core";

export const LogoutButton = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout(); // Assuming logout function handles clearing auth tokens or session
            navigate('/login', { state: {logout:true }}); // Navigate to login page after logout
        } catch (error) {
            console.error("Logout failed", error);
            // Handle logout failure, if needed
        }
    };

    return (
        <Text onClick={handleLogout} style={{ textAlign: 'left', fontSize: 13.5, color: '#545454', marginLeft: 1 }}>Logout</Text>
    );
};
