
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded bg-brand text-white font-bold">
        HR
      </div>
      <span className="font-bold text-lg">EasyHR</span>
    </Link>
  );
};

export default Logo;
