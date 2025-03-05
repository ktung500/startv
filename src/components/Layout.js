// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import './Layout.css';
function Layout() {
  return (
    <>
      <Header />
      <main className="content">
        <Outlet /> {/* This is where your page content will render */}
      </main>
    </>
  );
}

export default Layout;