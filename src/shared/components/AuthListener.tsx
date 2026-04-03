import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, clearAuth, setLoading } from '../../store/auth/authSlice';
import { getSession, onAuthStateChange } from '../services/authService';
import { getProfile } from '../services/profileService';

export default function AuthListener() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        dispatch(setUser(session.user));
      }
      dispatch(setLoading(false));
    });

    const { data: { subscription } } = onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          dispatch(setUser(session.user));
          const profile = await getProfile(session.user.id);
          dispatch(setUser(profile));
        }
        if (event === 'SIGNED_OUT') {
          dispatch(clearAuth());
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}