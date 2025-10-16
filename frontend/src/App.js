import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import * as fa from "react-icons/fa";
import Navbar from "./components/Navbar";
import Alert from "./components/Alert";
import Modal from "./components/Modal";
import LoadingWidget from "./components/LoadingWidget";
import Home from "./pages/Home";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Resume from "./pages/Resume";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Logout from "./pages/auth/Logout";
import Dashboard from "./pages/Dashboard";
import DriverDashboard from "./pages/driver/Dashboard";
import { useGoogleLogin } from "./pages/auth/GoogleLogin";
import { useGithubLogin } from "./pages/auth/GithubLogin";
import { useFacebookLogin } from "./pages/auth/FacebookLogin";
import Authenticate from "./pages/auth/Authenticate";

const App = () => {
    const navigate = useNavigate();

    const [token, setToken] = useState(null);
    const [id, setId] = useState("");
    const [user, setUser] = useState("");
    const [superuser, setSuperuser] = useState(false);
    const [message, setMessage] = useState("");
    const [className, setClassName] = useState("");
    const [show, setShow] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [formShow, setFormShow] = useState(false);
    const [callbackHandled, setCallbackHandled] = useState(false);
    const [loading, setLoading] = useState(false);

    const { handleGoogleCallback } = useGoogleLogin({ setToken, setId, setUser, setMessage, setClassName, setShow, setSuperuser });
    const { handleGithubCallback } = useGithubLogin({ setToken, setId, setUser, setMessage, setClassName, setShow, setSuperuser });
    const { handleFacebookCallback } = useFacebookLogin({ setToken, setId, setUser, setMessage, setClassName, setShow, setSuperuser });

    const checkToken = () => {
        setToken(localStorage.getItem("token"));
    };
    const checkId = () => {
        setId(localStorage.getItem("user_id"));
    };
    const checkUser = () => {
        setUser(localStorage.getItem("user"));
    };
    const checkSuperuser = () => {
        const isSuperuser = localStorage.getItem("is_superuser");
        setSuperuser(isSuperuser === "true" || isSuperuser === true);
    };
    const handleModal = () => {
        setModalShow(!modalShow);
    };
    const handleForm = (event) => {
        event.preventDefault();
        setFormShow((prevFormShow) => !prevFormShow);
    };

    // Create logout component with navigate
    const LogoutComponent = Logout({
        setToken,
        setId,
        setUser,
        setMessage,
        setClassName,
        setShow,
        setSuperuser,
        navigate
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const currentUrl = window.location.href;
        if (code && !callbackHandled) {
            setCallbackHandled(true);
            setLoading(true);
            if (currentUrl.includes("google")) {
                handleGoogleCallback(code).finally(() => setLoading(false));
            } else if (currentUrl.includes("facebook")) {
                handleFacebookCallback(code).finally(() => setLoading(false));
            }
            else {
                handleGithubCallback(code).finally(() => setLoading(false));
            }
        }
        checkToken();
        checkId();
        checkUser();
        checkSuperuser();
        console.log("component refreshed after token has been added or deleted");

        const handleClickOutside = (event) => {
            if (formShow && !event.target.closest('.form-container') && !event.target.closest('.navbar_toggle') && !event.target.closest('.navbar_links.scrollto')) {
                setFormShow(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleGoogleCallback, handleGithubCallback, handleFacebookCallback, token, id, user, superuser, callbackHandled, formShow]);

    return (
        <>
            {token ? (
                superuser ? (
                    <Navbar
                        superuser={true}
                        admin={
                            <li>
                                <Link to="/dashboard" className="navbar_links scrollto">
                                    <i>
                                        <fa.FaTachometerAlt />
                                    </i>{" "}
                                </Link>
                            </li>
                        }
                        auth={
                            <li>
                                <Link onClick={handleModal} className="navbar_links scrollto">
                                    <i>
                                        <fa.FaSignOutAlt />
                                    </i>{" "}
                                </Link>
                            </li>
                        }
                    />
                ) : (
                    <Navbar
                        superuser={false}
                        dashboard={
                            <li>
                                <Link to="/driver-dashboard" className="navbar_links scrollto">
                                    <i>
                                        <fa.FaTachometerAlt />
                                    </i>{" "}
                                </Link>
                            </li>
                        }
                        auth={
                            <li>
                                <Link onClick={handleModal} className="navbar_links scrollto">
                                    <i>
                                        <fa.FaSignOutAlt />
                                    </i>{" "}
                                </Link>
                            </li>
                        }
                    />
                )
            ) : (
                <Navbar
                    superuser={false}
                    auth={
                        <li>
                            <Link onClick={handleForm} className="navbar_links scrollto">
                                <i>
                                    <fa.FaSignInAlt />
                                </i>{" "}

                            </Link>
                        </li>
                    }
                />
            )}
            {show && message && (
                <Alert className={`fixed top-0 left-0 right-0 z-[9999] w-full ${className}`} message={message} icon={<fa.FaInfo />} />
            )}
            {loading ? (
                <>
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <LoadingWidget />
                    </div>
                </>
            ) : (
                <></>
            )}
            {formShow ? (
                <>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
                        <Authenticate
                            setToken={setToken}
                            setId={setId}
                            setUser={setUser}
                            setMessage={setMessage}
                            setClassName={setClassName}
                            setShow={setShow}
                            setSuperuser={setSuperuser}
                            setLoading={setLoading}
                        />
                    </div>
                </>
            ) : (
                <></>
            )}

            {modalShow ? (
                <>
                    <Modal
                        title="Authentication"
                        message="Are you sure you want to logout?"
                        altButton={
                            <button
                                type="submit"
                                onClick={() => {
                                    LogoutComponent.LogoutSubmit();
                                    setModalShow(false);
                                }}
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                            >
                                Log Out
                            </button>
                        }
                        onClick={handleModal}
                    ></Modal>
                </>
            ) : (
                <></>
            )}
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={
                        <>
                            <div id="home">
                                <Home />
                            </div>
                            <div id="about">
                                <About />
                            </div>
                            <div id="skills">
                                <Skills />
                            </div>
                            <div id="resume">
                                <Resume />
                            </div>
                            <div id="services">
                                <Services />
                            </div>
                            <div id="contact">
                                <Contact />
                            </div>
                        </>
                    }
                />

                {/* Superuser Dashboard Route */}
                <Route
                    path="/dashboard"
                    element={
                        superuser ? (
                            <Dashboard handleModal={handleModal} />
                        ) : (
                            <Navigate to="/driver-dashboard" replace />
                        )
                    }
                />

                {/* Driver Dashboard Route */}
                <Route
                    path="/driver-dashboard"
                    element={
                        superuser ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <DriverDashboard onLogout={handleModal} />
                        )
                    }
                />

                {/* Catch-all redirect (optional) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default App;