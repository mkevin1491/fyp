"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const withAuth = (WrappedComponent: React.ComponentType) => {
    const AuthComponent = (props: any) => {
        const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
        const [loading, setLoading] = useState<boolean>(true);
        const router = useRouter();

        useEffect(() => {
            const checkAuth = async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                // Set the token in default axios headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                try {
                    await axios.get('https://sea-lion-app-3l29g.ondigitalocean.app/auth/protected', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error verifying user:', error);
                    router.push('/login');
                } finally {
                    setLoading(false);
                }
            };
            checkAuth();
        }, [router]);

        if (loading) {
            return <div>Loading...</div>;
        }

        if (!isAuthenticated) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
