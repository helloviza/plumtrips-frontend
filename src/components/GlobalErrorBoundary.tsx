import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalErrorBoundary() {
  const error = useRouteError();
  console.error("ErrorBoundary caught:", error);

  let errorMessage = 'An unexpected error occurred.';
  let errorDetails = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetails = error.data || 'The page you requested could not be found.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
        <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-red-900">Oops! Something went wrong</h1>
            <p className="text-red-700 text-sm mt-1">
              We encountered an unexpected error while loading this page.
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800 overflow-x-auto mb-6">
            <div className="font-bold mb-2 text-slate-900">Error: {errorMessage}</div>
            {errorDetails && (
              <pre className="whitespace-pre-wrap text-slate-600 mt-2">{errorDetails}</pre>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#003580] hover:bg-[#00224f] text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
