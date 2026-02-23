import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../features/auth/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import API from '../features/auth/services/api';

export default function OAuthSuccess() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('auth_token', token);

            // Fetch user profile with the new token
            API.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    dispatch(loginSuccess({
                        user: res.data.data.user,
                        token,
                    }));
                    navigate('/dashboard');
                })
                .catch(() => {
                    // Even if profile fetch fails, store token and proceed
                    dispatch(loginSuccess({ user: null, token }));
                    navigate('/dashboard');
                });
        } else {
            navigate('/login');
        }
    }, [dispatch, navigate]);

    return <p>Logging you in...</p>;
}