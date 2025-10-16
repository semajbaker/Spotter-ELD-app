import axios from "axios";
import * as bi from "react-icons/bi";
import Form from "../../components/Form";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const Authenticate = ({ setToken, setId, setUser, setMessage, setClassName, setShow, setSuperuser, setLoading }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [password2, setPassword2] = useState('');
    const navigate = useNavigate();

    const LoginSubmit = e => {
        e.preventDefault();
        setLoading(true);
        const loginData = { 'username': username, 'password': password };
        axios.post('http://localhost:8000/rest-auth/signin/', loginData)
            .then(response => {
                let authToken = localStorage.setItem('token', response.data.token);
                setToken(authToken);
                let authId = localStorage.setItem('user_id', response.data.user_id);
                setId(authId);
                let authUser = localStorage.setItem('user', username);
                setUser(authUser);
                
                // Set superuser status
                const isSuperuser = response.data.is_superuser === true;
                if (isSuperuser) {
                    let authAdmin = localStorage.setItem('is_superuser', true);
                    setSuperuser(authAdmin);
                } else {
                    localStorage.setItem('is_superuser', false);
                    setSuperuser(false);
                }
                
                setShow(true);
                setTimeout(() => setShow(false), 3500);
                setClassName(`bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                setMessage(`Successfully logged in as ${username}.`);
                
                // Redirect based on user role
                if (isSuperuser) {
                    navigate("/dashboard");
                } else {
                    navigate("/driver-dashboard");
                }
                
                setLoading(false);
            })
            .catch(err => {
                console.log('Login error:', err);
                setLoading(false);
                setClassName(`bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                
                let errorMessage = 'Invalid credentials. Please try again.';
                if (err.response && err.response.data) {
                    const error = err.response.data;
                    if (error.non_field_errors) {
                        errorMessage = Array.isArray(error.non_field_errors) 
                            ? error.non_field_errors[0] 
                            : error.non_field_errors;
                    } else if (error.detail) {
                        errorMessage = error.detail;
                    } else if (error.username) {
                        errorMessage = Array.isArray(error.username) 
                            ? error.username[0] 
                            : error.username;
                    } else if (error.password) {
                        errorMessage = Array.isArray(error.password) 
                            ? error.password[0] 
                            : error.password;
                    }
                }
                
                setMessage(errorMessage);
                setShow(true);
                setTimeout(() => setShow(false), 3500);
            });
    };

    const SignupSubmit = e => {
        e.preventDefault();
        setLoading(true);
        const signupData = { 'username': username, 'email': email, 'password': password, 'password2': password2 };
        axios.post('http://localhost:8000/rest-auth/register/', signupData)
            .then(res => {
                setShow(true);
                setTimeout(() => setShow(false), 3500);
                setClassName(`bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                setMessage(`${username} has been successfully registered.`);
                navigate("/");
                setLoading(false);
            })
            .catch(err => {
                console.log('Signup error:', err);
                setLoading(false);
                setClassName(`bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                
                let errorMessage = 'Registration failed. Please try again.';
                if (err.response && err.response.data) {
                    const error = err.response.data;
                    if (error.username) {
                        errorMessage = Array.isArray(error.username) 
                            ? error.username[0] 
                            : error.username;
                    } else if (error.email) {
                        errorMessage = Array.isArray(error.email) 
                            ? error.email[0] 
                            : error.email;
                    } else if (error.password) {
                        errorMessage = Array.isArray(error.password) 
                            ? error.password[0] 
                            : error.password;
                    } else if (error.non_field_errors) {
                        errorMessage = Array.isArray(error.non_field_errors) 
                            ? error.non_field_errors[0] 
                            : error.non_field_errors;
                    }
                }
                
                setMessage(errorMessage);
                setShow(true);
                setTimeout(() => setShow(false), 3500);
            });
    };

    const ForgotPasswordSubmit = e => {
        e.preventDefault();
        setLoading(true);
        const resetData = { 'email': email };
        axios.post('http://localhost:8000/rest-auth/password-reset/', resetData)
            .then(res => {
                setShow(true);
                setTimeout(() => setShow(false), 3500);
                setClassName(`bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                setMessage(`Password reset link has been sent to ${email}.`);
                setLoading(false);
            })
            .catch(err => {
                console.log("Password reset request failed", err);
                setLoading(false);
                setClassName(`bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                
                let errorMessage = 'Password reset failed. Please try again.';
                if (err.response && err.response.data) {
                    const error = err.response.data;
                    if (error.email) {
                        errorMessage = Array.isArray(error.email) 
                            ? error.email[0] 
                            : error.email;
                    } else if (error.non_field_errors) {
                        errorMessage = Array.isArray(error.non_field_errors) 
                            ? error.non_field_errors[0] 
                            : error.non_field_errors;
                    } else if (error.detail) {
                        errorMessage = error.detail;
                    }
                }
                
                setMessage(errorMessage);
                setShow(true);
                setTimeout(() => setShow(false), 3500);
            });
    };

    const googleAuth = () => {
        localStorage.setItem("socialAuth", "google");
        const clientID = "907362169282-poa8jm8d068c9jbbneoj1qgb0tvjth4j.apps.googleusercontent.com";
        const callBackURI = "http://localhost:8000/";
        window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${callBackURI}&prompt=consent&response_type=code&client_id=${clientID}&scope=openid%20email%20profile&access_type=offline`);
    };

    const githubAuth = () => {
        localStorage.setItem("socialAuth", "github");
        const clientID = "Iv23liCRgSTUBl6MdySH";
        const callBackURI = "http://localhost:8000/";
        window.location.replace(`https://github.com/login/oauth/authorize?redirect_uri=${callBackURI}&client_id=${clientID}&scope=user:email`);
    };

    const facebookAuth = () => {
        localStorage.setItem("socialAuth", "facebook");
        const clientID = "3627927404180303";
        const callBackURI = "http://localhost:8000/";
        window.location.replace(`https://www.facebook.com/v10.0/dialog/oauth?client_id=${clientID}&redirect_uri=${callBackURI}&state={"{st=state123abc,ds=123456789}"}`);
    };

    return (
        <>
            <Form
                method="post"
                className1="w-full max-w-4xl"
                className2={isLogin ? "w-full lg:w-1/2" : "w-full"}
                action="/"
                onSubmit={isLogin ? LoginSubmit : forgotPassword ? ForgotPasswordSubmit : SignupSubmit}
                title={
                    <h4 className="mt-4 mb-6 pb-2">{isLogin ? "Sign In" : forgotPassword ? "Password Reset" : "Sign Up"}</h4>
                }
                signinOptions={
                    isLogin && (
                        <>
                            <div className="flex items-center justify-center lg:justify-center">
                                <button
                                    type="button"
                                    className="btn bg-blue-500 text-white rounded-full p-1 mx-2"
                                    onClick={googleAuth}
                                >
                                    <i><bi.BiLogoGoogle size={32} /></i>
                                </button>
                                <button type="button" className="btn bg-blue-500 text-white rounded-full p-1 mx-2" onClick={facebookAuth}>
                                    <i><bi.BiLogoFacebook size={32} /></i>
                                </button>
                                <button type="button" className="btn bg-blue-500 text-white rounded-full p-1 mx-2" onClick={githubAuth}>
                                    <i><bi.BiLogoGithub size={32} /></i>
                                </button>
                            </div>
                            <div className="flex items-center justify-center my-4">
                                <p className="text-center font-bold mx-3 mb-0">Or</p>
                            </div>
                        </>
                    )
                }
                inputFields={
                    <>
                        {isLogin && (
                            <>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="form-input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        placeholder="Username"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="form-input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                            </>

                        )}

                        {forgotPassword && (
                            <div className="mb-4">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="form-input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    placeholder="Email address"
                                    required
                                />
                            </div>
                        )}
                        {!isLogin && !forgotPassword && (
                            <>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="form-input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        placeholder="Username"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="form-input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        placeholder="Email address"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="form-input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="password"
                                        id="password2"
                                        name="password2"
                                        value={password2}
                                        onChange={e => setPassword2(e.target.value)}
                                        className="form-input w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        placeholder="Verify Password"
                                        required
                                    />
                                </div>

                            </>
                        )}
                    </>
                }
                buttonOptions={
                    <>
                        <div className="text-center pt-1 mb-4 pb-2">
                            <button
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3"
                                type="submit"
                            >
                                {isLogin ? "Log in" : forgotPassword ? "Request reset link" : "Sign Up"}
                            </button>
                            {isLogin ? (<Link className="text-gray-600 pt-2" onClick={(e) => {
                                e.preventDefault();
                                setIsLogin(false);
                                setForgotPassword(true);
                            }}>Forgot password?</Link>) : forgotPassword ? (<Link className="text-gray-600" onClick={(e) => {
                                e.preventDefault();
                                setIsLogin(true);
                                setForgotPassword(false);
                            }}>Go back to login?</Link>) : (<></>)}
                        </div>
                        {isLogin ? (<div className="flex items-center justify-center pb-4">
                            <p className="mb-0 mr-2">{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsLogin(false);
                                }}
                                className="px-4 py-2 border border-b-blue-600 text-gray-600"
                            >
                                {isLogin ? "register here" : "login here"}
                            </button>
                        </div>) : forgotPassword ? (<></>) : (<div className="flex items-center justify-center pb-4">
                            <p className="mb-0 mr-2">{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsLogin(true);
                                }}
                                className="px-4 py-2 border border-b-blue-600 text-gray-600"
                            >
                                {isLogin ? "register here" : "login here"}
                            </button>
                        </div>)}
                    </>
                }
                extraContent={
                    isLogin && (
                        <div className="w-full lg:w-1/2 flex items-center bg-gradient-to-r from-purple-500 to-pink-500">
                            <div className="text-white px-6 py-8 md:p-12">
                                <h4 className="mb-4">We are more than just a company</h4>
                                <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            </div>
                        </div>
                    )
                }
            />
        </>
    );
};

export default Authenticate;