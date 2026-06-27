export interface ApiLogParams {
  apiName: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  payload?: any;
  status: number | string;
  responseData?: any;
  durationMs: number;
  error?: any;
}

function generateCurl(method: string, url: string, headers: Record<string, string> = {}, payload?: any): string {
  let curl = `curl -X ${method.toUpperCase()} "${url}" \\\n`;
  
  for (const [key, value] of Object.entries(headers)) {
    // Only mask Authorization headers if present
    const safeValue = key.toLowerCase() === 'authorization' ? 'Bearer ***' : value;
    curl += `-H "${key}: ${safeValue}" \\\n`;
  }
  
  if (payload && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    // Escape single quotes for bash
    const escapedPayload = payloadStr.replace(/'/g, "'\\''");
    curl += `-d '${escapedPayload}'`;
  } else {
    // remove trailing slash-newline if no payload
    curl = curl.replace(/ \\\n$/, '');
  }
  
  return curl;
}

function summarizeResponse(data: any): string {
  if (!data) return 'No data';
  
  const summary: string[] = [];
  
  if (data?.data?.CityList) {
    summary.push(`Total Cities: ${data.data.CityList.length}`);
  }
  if (data?.data?.HotelResult) {
    summary.push(`Total Hotels: ${data.data.HotelResult.length}`);
    if (data.data.traceId) summary.push(`Trace ID: ${data.data.traceId}`);
  }
  if (data?.data?.HotelRoomsDetails) {
    summary.push(`Total Rooms: ${data.data.HotelRoomsDetails.length}`);
  }
  if (data?.data?.BookingId) {
    summary.push(`Booking ID: ${data.data.BookingId}`);
  }
  
  if (summary.length === 0) {
    if (Array.isArray(data?.data)) {
      summary.push(`Array elements: ${data.data.length}`);
    } else if (typeof data === 'object') {
      summary.push(`Keys: ${Object.keys(data).join(', ')}`);
    } else {
      summary.push('Simple response');
    }
  }
  
  return summary.join(' | ');
}

export function logApiRequest(params: ApiLogParams) {
  // Check the env variable. Support both VITE_ and window for flexibility.
  const isEnabled = import.meta.env.VITE_DEBUG_API_LOGS === 'true' || (window as any).DEBUG_API_LOGS === true;
  if (!isEnabled) return;

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:mm:ss
  const durationStr = (params.durationMs / 1000).toFixed(1) + 's';
  
  const curlCmd = generateCurl(params.method, params.url, params.headers, params.payload);
  const summaryStr = params.error ? `Error: ${params.error.message || params.error}` : summarizeResponse(params.responseData);
  
  const payloadStr = params.payload 
    ? JSON.stringify(params.payload, null, 2) 
    : 'None';

  const logLines = [
    '========================================',
    `API: ${params.apiName}`,
    `Timestamp: ${timestamp}`,
    `Method: ${params.method}`,
    `Endpoint: ${params.url}`,
    '',
    'Request Payload:',
    payloadStr,
    '',
    'Response Status:',
    String(params.status),
    '',
    'Response Summary:',
    summaryStr,
    '',
    'Response Time:',
    durationStr,
    '',
    'cURL:',
    curlCmd,
    '========================================'
  ];

const statusCode = Number(params.status);

const isError = params.error || (Number.isFinite(statusCode) && statusCode >= 400);

if (isError) {
  console.error(logLines.join("\n"));
} else {
  console.log("%c" + logLines.join("\n"), "color: #00bcd4;");
}
}
