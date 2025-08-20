import React from 'react';
import { Outlet } from 'react-router';
import './global.css';

export default function App() {
  return (
    <div id="root">
      <Outlet />
    </div>
  );
}
