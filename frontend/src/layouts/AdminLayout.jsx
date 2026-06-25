import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#111', color: '#fff' }}>
      <div className="sidebar" style={{ width: '250px', background: '#222', padding: '20px' }}>
        <h3>YumSaigon Admin</h3>
        <ul className="list-unstyled mt-4">
          <li className="mb-2"><a href="/admin" style={{color: '#ddd', textDecoration: 'none'}}>Dashboard</a></li>
          <li className="mb-2"><a href="/admin/programs" style={{color: '#ddd', textDecoration: 'none'}}>Programs</a></li>
        </ul>
      </div>
      <div className="main-content" style={{ flex: 1, padding: '20px' }}>
        <header className="mb-4 d-flex justify-content-between">
          <h4>Welcome Admin</h4>
          <a href="/" className="btn btn-outline-light btn-sm">View Site</a>
        </header>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
