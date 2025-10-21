// src/hooks/useDashboardData.js
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE = process.env.REACT_APP_API_URL;

// Fetch functions
const fetchCurrentUser = async () => {
    const response = await fetch(`${API_BASE}/rest-auth/user/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch current user');
    return response.json();
};

const fetchUsers = async () => {
    const response = await fetch(`${API_BASE}/rest-auth/admin-user/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

const fetchTokens = async () => {
    const response = await fetch(`${API_BASE}/rest-auth/admin-token/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch tokens');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

const fetchEmails = async () => {
    const response = await fetch(`${API_BASE}/rest-auth/admin-email/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch emails');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

const fetchSocialAccounts = async () => {
    const response = await fetch(`${API_BASE}/rest-auth/admin-socialaccount/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch social accounts');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

const fetchTrips = async () => {
    const response = await fetch(`${API_BASE}/api/trips/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch trips');
    const data = await response.json();
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
};

const fetchStops = async () => {
    const response = await fetch(`${API_BASE}/api/stops/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch stops');
    const data = await response.json();
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
};

const fetchDailyLogs = async () => {
    const response = await fetch(`${API_BASE}/api/daily-logs/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch daily logs');
    const data = await response.json();
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
};

// Custom hook that fetches all data
export const useDashboardData = () => {
    const queryClient = useQueryClient();

    // Query for current user
    const currentUserQuery = useQuery({
        queryKey: ['currentUser'],
        queryFn: fetchCurrentUser,
    });

    // Query for users
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    // Query for tokens
    const tokensQuery = useQuery({
        queryKey: ['tokens'],
        queryFn: fetchTokens,
    });

    // Query for emails
    const emailsQuery = useQuery({
        queryKey: ['emails'],
        queryFn: fetchEmails,
    });

    // Query for social accounts
    const socialAccountsQuery = useQuery({
        queryKey: ['socialAccounts'],
        queryFn: fetchSocialAccounts,
    });

    // Query for trips
    const tripsQuery = useQuery({
        queryKey: ['trips'],
        queryFn: fetchTrips,
    });

    // Query for stops
    const stopsQuery = useQuery({
        queryKey: ['stops'],
        queryFn: fetchStops,
    });

    // Query for daily logs
    const dailyLogsQuery = useQuery({
        queryKey: ['dailyLogs'],
        queryFn: fetchDailyLogs,
    });

    // Helper to invalidate all queries (force refresh)
    const invalidateAll = () => {
        queryClient.invalidateQueries(['currentUser']);
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['tokens']);
        queryClient.invalidateQueries(['emails']);
        queryClient.invalidateQueries(['socialAccounts']);
        queryClient.invalidateQueries(['trips']);
        queryClient.invalidateQueries(['stops']);
        queryClient.invalidateQueries(['dailyLogs']);
    };
    const invalidate = () => {
        queryClient.invalidateQueries(['currentUser']);
        queryClient.invalidateQueries(['trips']);
        queryClient.invalidateQueries(['stops']);
        queryClient.invalidateQueries(['dailyLogs']);
    };

    // Helper to invalidate specific queries
    const invalidateQueries = (queryKeys) => {
        queryKeys.forEach(key => {
            queryClient.invalidateQueries([key]);
        });
    };
        // ADD THIS: Helper to refetch current user
    const refetchCurrentUser = () => {
        return queryClient.invalidateQueries(['currentUser']);
    };

    // Check if any query is loading
    const isLoading = 
        currentUserQuery.isLoading ||
        usersQuery.isLoading ||
        tokensQuery.isLoading ||
        emailsQuery.isLoading ||
        socialAccountsQuery.isLoading ||
        tripsQuery.isLoading ||
        stopsQuery.isLoading ||
        dailyLogsQuery.isLoading;

    // Check if any query has error
    const isError = 
        currentUserQuery.isError ||
        usersQuery.isError ||
        tokensQuery.isError ||
        emailsQuery.isError ||
        socialAccountsQuery.isError ||
        tripsQuery.isError ||
        stopsQuery.isError ||
        dailyLogsQuery.isError;

    return {
        // Data
        currentUser: currentUserQuery.data || null,
        users: usersQuery.data || [],
        tokens: tokensQuery.data || [],
        emails: emailsQuery.data || [],
        socialAccounts: socialAccountsQuery.data || [],
        trips: tripsQuery.data || [],
        stops: stopsQuery.data || [],
        dailyLogs: dailyLogsQuery.data || [],
        
        // Loading states
        isLoading,
        isError,
        
        // Individual query states (if you need them)
        queries: {
            currentUser: currentUserQuery,
            users: usersQuery,
            tokens: tokensQuery,
            emails: emailsQuery,
            socialAccounts: socialAccountsQuery,
            trips: tripsQuery,
            stops: stopsQuery,
            dailyLogs: dailyLogsQuery,
        },
        
        // Helper functions
        invalidate,
        invalidateAll,
        invalidateQueries,
        refetchCurrentUser,
    };
};