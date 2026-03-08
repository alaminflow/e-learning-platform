import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-2 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-xs sm:text-sm">
          Developed by{' '}
          <a 
            href="https://github.com/developerasf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            developerasf
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
