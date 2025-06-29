// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService.js';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
    user: null,
    token: null,
    loading: true,
    error: null
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
    SET_LOADING: 'SET_LOADING',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
        case AUTH_ACTIONS.REGISTER_START:
            return {
                ...state,
                loading: true,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
        case AUTH_ACTIONS.REGISTER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
        case AUTH_ACTIONS.REGISTER_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: action.payload
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: null
            };

        case AUTH_ACTIONS.UPDATE_PROFILE:
            return {
                ...state,
                user: action.payload,
                error: null
            };

        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('storytelling_token');
                const userData = localStorage.getItem('storytelling_user');

                if (token && userData) {
                    const user = JSON.parse(userData);
                    
                    // Set token for API calls
                    authService.setAuthToken(token);
                    
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: { user, token }
                    });
                } else {
                    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const response = await authService.login(email, password);
            const { user, token } = response.data;

            // Store in localStorage
            localStorage.setItem('storytelling_token', token);
            localStorage.setItem('storytelling_user', JSON.stringify(user));

            // Set token for future API calls
            authService.setAuthToken(token);

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user, token }
            });

            toast.success(`Welcome back, ${user.firstName || user.email}!`);
            return { success: true };

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        dispatch({ type: AUTH_ACTIONS.REGISTER_START });

        try {
            const response = await authService.register(userData);
            const { user, token } = response.data;

            // Store in localStorage
            localStorage.setItem('storytelling_token', token);
            localStorage.setItem('storytelling_user', JSON.stringify(user));

            // Set token for future API calls
            authService.setAuthToken(token);

            dispatch({
                type: AUTH_ACTIONS.REGISTER_SUCCESS,
                payload: { user, token }
            });

            toast.success(`Welcome to Storytelling, ${user.firstName || user.email}!`);
            return { success: true };

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            dispatch({
                type: AUTH_ACTIONS.REGISTER_FAILURE,
                payload: errorMessage
            });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('storytelling_token');
        localStorage.removeItem('storytelling_user');
        authService.setAuthToken(null);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.success('Logged out successfully');
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (!state.user) return '';
        return state.user.firstName 
            ? `${state.user.firstName} ${state.user.lastName || ''}`.trim()
            : state.user.email;
    };

    const value = {
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        getUserDisplayName
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;