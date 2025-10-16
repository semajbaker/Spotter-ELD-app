import axios from "axios";
import { useCallback } from "react";

const useGoogleLogin = ({ setToken, setId, setUser, setMessage, setClassName, setShow, setSuperuser }) => {
    const handleGoogleCallback = useCallback(async (code) => {
        try {
            // First request to get the token
            const tokenResponse = await axios.post('https://localhost:443/rest-auth/google/login/', { code });
            const authToken = tokenResponse.data.key;
            localStorage.setItem('token', authToken);
            setToken(authToken);

            // Second request to get the user details using the token
            const userResponse = await axios.get('https://localhost:443/rest-auth/user-request/', {
                headers: {
                    'Authorization': `Token ${authToken}`
                }
            });

            const userData = userResponse.data;
            let authId = localStorage.setItem('user_id', userData[0].id);
            setId(authId);
            let authUser = localStorage.setItem('user', userData[0].username);
            setUser(authUser);
            if (userData[0].is_superuser === true) {
                let authSuperuser = localStorage.setItem('is_superuser', userData[0].is_superuser);
                setSuperuser(authSuperuser);
            } else {
                setSuperuser(false);
            }
            console.log(`
                ${authToken},
                ${authId},
                ${authUser},
                ${userData[0].is_superuser},
            `);
            setShow(true);
            setTimeout(() => setShow(false), 3500); // Hide after 3 seconds
            setClassName(`bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
            setMessage(`Successfully logged in as ${userData[0].username}.`);
        } catch (err) {
            let error = err.response.data;
            console.log(error);
            setShow(true);
            setTimeout(() => setShow(false), 3500); // Hide after 3 seconds
            setClassName(`bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
            if (error.non_field_errors) {
                setMessage(error.non_field_errors);
            }
        }
    }, [setClassName, setId, setMessage, setShow, setSuperuser, setToken, setUser]);

    return { handleGoogleCallback };
};

export { useGoogleLogin };