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
              max-width: 1600px;
              margin: 0 auto;
              padding: 1rem;
            }
            
            @media (max-width: 768px) {
              .container {
                padding: 0.5rem;
              }
            }
            
            .card {
              background: white;
              border-radius: 8px;
              padding: 1rem;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              margin-bottom: 1rem;
            }
            
            .grid {
              display: grid;
              gap: 1rem;
            }
            
            @media (max-width: 768px) {
              .grid {
                gap: 0.75rem;
              }
            }
            
            .grid-2 {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            }
            
            .grid-3 {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            }
            
            @media (min-width: 1024px) {
              .grid-3 {
                grid-template-columns: repeat(3, 1fr);
              }
            }
            
            .grid-4 {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }
            
            .form-group {
              margin-bottom: 0.75rem;
            }
            
            .form-group label {
              display: block;
              margin-bottom: 0.25rem;
              font-weight: 500;
              color: #374151;
              font-size: 0.85rem;
            }
            
            .form-group input {
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              font-size: 0.9rem;
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
              padding: 0.75rem;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              border-radius: 6px;
            }
            
            .metric-value {
              font-size: 1.5rem;
              font-weight: 700;
              margin-bottom: 0.25rem;
              line-height: 1.2;
            }
            
            .metric-label {
              font-size: 0.75rem;
              opacity: 0.9;
              line-height: 1.1;
            }
            
            .chart-container {
              height: 200px;
              width: 100%;
            }
            
            @media (max-width: 768px) {
              .chart-container {
                height: 250px;
              }
            }
            
            h1 {
              text-align: center;
              color: white;
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 1rem;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            @media (max-width: 768px) {
              h1 {
                font-size: 1.5rem;
                margin-bottom: 0.75rem;
              }
            }
            
            h2 {
              color: #374151;
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 0.75rem;
            }
            
            .charts-column {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            
            @media (max-width: 1023px) {
              .charts-column {
                grid-column: 1 / -1;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1rem;
              }
            }
            
            @media (max-width: 768px) {
              .grid-2 {
                grid-template-columns: repeat(2, 1fr);
              }
              
              .metric-card {
                padding: 0.5rem;
              }
              
              .metric-value {
                font-size: 1.25rem;
              }
              
              .metric-label {
                font-size: 0.7rem;
              }
              
              .form-group {
                margin-bottom: 0.5rem;
              }
            }

            .section-header {
              color: #6366f1;
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 0.75rem;
              margin-top: 0;
              text-transform: none;
              letter-spacing: 0.025em;
            }
            
            @media (max-width: 768px) {
              .input-section {
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
              }
              
              .section-header {
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
              }
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
