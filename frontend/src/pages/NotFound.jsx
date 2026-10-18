import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-muted">That screen doesn't exist in this prototype.</p>
      <Link to="/" className="kiosk-btn-secondary mt-8">
        Back to start
      </Link>
    </div>
  );
}
