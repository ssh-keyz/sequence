import { io } from "socket.io-client";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Initialize socket connection
export const socket = io();

// Get root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find root element');

// Create root and render app
const root = createRoot(container);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App)
  )
);
