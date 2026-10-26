import MicrosoftSession from "./components/auth/MicrosoftSession";
import { createQueryClient } from './lib/queryClient';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

// Create a Query Client instance
const queryClient = createQueryClient();
const router = createBrowserRouter([{ path: "*", element: <App /> }]);
// Get the root element
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MicrosoftSession><RouterProvider router={router} /></MicrosoftSession>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
