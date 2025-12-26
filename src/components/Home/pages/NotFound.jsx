import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <h1 className="text-9xl font-extrabold mb-4 animate-bounce">404</h1>
      <h2 className="text-3xl md:text-4xl font-bold mb-2">Page Not Found</h2>
      <p className="mb-6 text-center max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
