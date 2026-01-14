import React, { useState, useEffect } from 'react';
import ChatBot from './ChatBot.jsx';

function Header() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                if (decoded.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (e) {
                // Ignore invalid token
            }
        }
    }, []);

    return (
        <header className=" w-full shadow-md sticky top-0 z-50 bg-white">
            <div className="flex flex-row justify-between items-center px-4 py-2">
                <div className="flex-1 flex justify-start">
                    <ChatBot />
                </div>
                
                <div className="flex-1 flex justify-center">
                    {isAdmin && (
                        <button 
                            className="bg-red-500 px-3 py-1 rounded shadow text-sm font-bold" 
                            onClick={() => window.location.href = '/admin'}
                            title="Panneau Administrateur"
                        >
                            🛡️ Admin
                        </button>
                    )}
                </div>
                
                <div className="flex-1 flex justify-center">
                    <a href="/"><img src="../../media/logo.svg" alt="Logo" className="h-18 w-18 object-cover  " /></a>
                </div>
            </div>
        </header>
    );
}

export default Header;