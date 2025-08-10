// src/pages/NotFoundPage.js
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="mt-4">Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="text-blue-500 mt-4 inline-block">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
