import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function MyProfileRedirect() {
  const member = useAuthStore((s) => s.member);
  if (!member) return null;
  return <Navigate to={`/members/${member.id}`} replace />;
}
