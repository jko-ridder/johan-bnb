"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isLoggedIn: boolean;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    role?: string;
    login: (username: string, firstName: string, lastName: string, profilePicture: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [role, setRole] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const fetchUserData = async () => {
                try {
                    const response = await fetch('/api/auth/me', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUsername(data.username);
                        setFirstName(data.firstName || '');
                        setLastName(data.lastName || '');
                        setProfilePicture(data.profilePicture || '');
                        setRole(data.role || '');
                        setIsLoggedIn(true);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    logout();
                }
            };

            fetchUserData();
        }
    }, []);

    const login = (username: string, firstName: string, lastName: string, profilePicture: string, role: string) => {
        setUsername(username);
        setFirstName(firstName);
        setLastName(lastName);
        setProfilePicture(profilePicture);
        setRole(role);
        setIsLoggedIn(true);
    };

    const logout = () => {
        setUsername('');
        setFirstName('');
        setLastName('');
        setProfilePicture('');
        setRole('');
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, firstName, lastName, profilePicture, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};