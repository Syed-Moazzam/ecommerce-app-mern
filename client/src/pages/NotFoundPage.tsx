import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => (
  <div className="container-content flex flex-col items-center py-24 text-center">
    <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
    <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
    <p className="mt-2 text-ink-muted">The page you're looking for doesn't exist or was moved.</p>
    <Link to="/" className="mt-6"><Button size="lg">Back to home</Button></Link>
  </div>
);
