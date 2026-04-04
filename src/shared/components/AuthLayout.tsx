import { Outlet } from 'react-router-dom';
import AuthListener from './AuthListener';

export default function AuthLayout() {
  return (
    <>
      <AuthListener />
      <Outlet />
    </>
  );
}
