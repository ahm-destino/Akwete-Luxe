import React from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard } from './AdminDashboard';

export const AdminPanelModal: React.FC = () => {
  const { isAdminOpen } = useApp();
  if (!isAdminOpen) return null;
  return <AdminDashboard />;
};
