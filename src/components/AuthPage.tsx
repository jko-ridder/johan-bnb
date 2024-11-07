"use client";
import { useState } from 'react';
import Login from '../app/(auth)/login/page';
import Register from '../app/(auth)/register/page';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <button
                    onClick={toggleAuthMode}
                    className="w-full px-4 py-2 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {isLogin ? 'Switch to Register' : 'Switch to Login'}
                </button>
                {isLogin ? <Login /> : <Register />}
            </div>
        </div>
    );
};

export default AuthPage;