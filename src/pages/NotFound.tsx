import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-zinc-600">
        The page you’re looking for doesn’t exist. Go back to{" "}
        <Link to="/" className="text-blue-600 underline">Home</Link>.
      </p>
    </div>
  );
}
