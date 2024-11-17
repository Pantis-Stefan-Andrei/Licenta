import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index';
import { AuthContext } from '../AuthContext';

const DefaultLayout = () => {
  const { isAuthenticated } = useContext(AuthContext);

 
  if (!isAuthenticated) {
   
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default DefaultLayout;
