import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            
            .container {
              max-width: 1400px;
              margin: 0 auto;
              padding: 2rem;
            }
            
            .card {
              background: white;
              border-radius: 12px;
              padding: 2rem;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              margin-bottom: 2rem;
            }
            
            .grid {
              display: grid;
              gap: 2rem;
            }
            
            .grid-2 {
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
            
            .grid-4 {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }
            
            .form-group {
              margin-bottom: 1.5rem;
            }
            
            .form-group label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #374151;
            }
            
            .form-group input {
              width: 100%;
              padding: 0.75rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 1rem;
              transition: border-color 0.2s;
            }
            
            .form-group input:focus {
              outline: none;
              border-color: #667eea;
            }
            
            .btn {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 1rem 2rem;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            }
            
            .btn:hover {
              transform: translateY(-2px);
            }
            
            .metric-card {
              text-align: center;
              padding: 1.5rem;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              border-radius: 12px;
            }
            
            .metric-value {
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            
            .metric-label {
              font-size: 0.9rem;
              opacity: 0.9;
            }
            
            .chart-container {
              height: 400px;
              width: 100%;
            }
            
            h1 {
              text-align: center;
              color: white;
              font-size: 3rem;
              font-weight: 700;
              margin-bottom: 2rem;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            h2 {
              color: #374151;
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 1.5rem;
            }
          `,
          }}
        />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
