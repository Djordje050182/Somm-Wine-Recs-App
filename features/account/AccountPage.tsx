import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserAccount from '../../components/UserAccount';
import { useAuth } from '../../contexts/AuthContext';
import { useRegion } from '../../contexts/RegionContext';

const AccountPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { regionId } = useRegion();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(`/${regionId}`);
  };

  return (
    <UserAccount
      user={user as any}
      onLogout={handleLogout}
      onNavigateToPortal={() => navigate(`/${regionId}/portal`)}
    />
  );
};

export default AccountPage;
