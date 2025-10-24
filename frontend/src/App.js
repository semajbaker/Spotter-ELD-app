import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Cache persists for 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Retry failed requests once
    },
  },
});

const ProtectedRoute = ({ token, superuser, redirectTo, setClassName, setMessage, setShow, children }) => {
  // fallback to localStorage token to avoid flashes when state hasn't synced yet
  const effectiveToken = token || localStorage.getItem("token");
  const effectiveSuperuser = superuser || (localStorage.getItem("is_superuser") === true);

  useEffect(() => {
    // only show the "must be logged in" alert when there is absolutely no token anywhere
    if (!effectiveToken) {
      setClassName(
        `bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`
      );
      setMessage("You must be logged in to access the dashboard.");
      setShow(true);
      setTimeout(() => setShow(false), 3500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveToken]); // only depends on effectiveToken

  // No token → show alert and redirect to home
  if (!effectiveToken) return <Navigate to="/" replace />;

  // If logged in, redirect to correct dashboard based on role (silent redirect)
  if (effectiveSuperuser && redirectTo === "driver") return <Navigate to="/dashboard" replace />;
  if (!effectiveSuperuser && redirectTo === "admin") return <Navigate to="/driver-dashboard" replace />;

  // Otherwise, allow access
  return children;
};

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

  const { handleGoogleCallback } = useGoogleLogin({
    setToken,
    setId,
    setUser,
    setMessage,
    setClassName,
    setShow,
    setSuperuser,
  });
  const { handleGithubCallback } = useGithubLogin({
    setToken,
    setId,
    setUser,
    setMessage,
    setClassName,
    setShow,
    setSuperuser,
  });
  const { handleFacebookCallback } = useFacebookLogin({
    setToken,
    setId,
    setUser,
    setMessage,
    setClassName,
    setShow,
    setSuperuser,
  });

  const checkToken = () => setToken(localStorage.getItem("token"));
  const checkId = () => setId(localStorage.getItem("user_id"));
  const checkUser = () => setUser(localStorage.getItem("user"));
  const checkSuperuser = () => {
    const isSuperuser = localStorage.getItem("is_superuser");
    setSuperuser(isSuperuser === "true" || isSuperuser === true);
  };

  const handleModal = () => setModalShow(!modalShow);

  const handleForm = (event) => {
    event.preventDefault();
    setFormShow((prev) => !prev);
  };

  // Logout component instance
  const LogoutComponent = Logout({
    setToken,
    setId,
    setUser,
    setMessage,
    setClassName,
    setShow,
    setSuperuser,
    navigate,
    setLoading,
  });

  // Prevent scrolling when modal, form, or loading widget is visible
  useEffect(() => {
    if (modalShow || formShow || loading) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scrolling
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [modalShow, formShow, loading]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const socialAuth = localStorage.getItem("socialAuth"); // Check which provider we're using

    if (code && !callbackHandled) {
      setCallbackHandled(true);
      setLoading(true);

      // Use localStorage to determine which provider
      if (socialAuth === "google") {
        handleGoogleCallback(code).finally(() => {
          setLoading(false);
          localStorage.removeItem("socialAuth"); // Clean up
        });
      } else if (socialAuth === "facebook") {
        handleFacebookCallback(code).finally(() => {
          setLoading(false);
          localStorage.removeItem("socialAuth"); // Clean up
        });
      } else if (socialAuth === "github") {
        handleGithubCallback(code).finally(() => {
          setLoading(false);
          localStorage.removeItem("socialAuth"); // Clean up
        });
      }
    }

    checkToken();
    checkId();
    checkUser();
    checkSuperuser();

    console.log("component refreshed after token has been added or deleted");

    const handleClickOutside = (event) => {
      if (
        formShow &&
        !event.target.closest(".form-container") &&
        !event.target.closest(".navbar_toggle") &&
        !event.target.closest(".navbar_links.scrollto")
      ) {
        setFormShow(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [
    handleGoogleCallback,
    handleGithubCallback,
    handleFacebookCallback,
    token,
    id,
    user,
    superuser,
    callbackHandled,
    formShow,
  ]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        {token ? (
          superuser ? (
            <Navbar
              superuser={true}
              admin={
                <li>
                  <Link to="/dashboard" className="navbar_links scrollto">
                    <i>
                      <fa.FaTachometerAlt />
                    </i>
                  </Link>
                </li>
              }
              auth={
                <li>
                  <Link onClick={handleModal} className="navbar_links scrollto">
                    <i>
                      <fa.FaSignOutAlt />
                    </i>
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
                    </i>
                  </Link>
                </li>
              }
              auth={
                <li>
                  <Link onClick={handleModal} className="navbar_links scrollto">
                    <i>
                      <fa.FaSignOutAlt />
                    </i>
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
                  </i>
                </Link>
              </li>
            }
          />
        )}

        {show && message && (
          <Alert
            className={`fixed top-0 left-0 right-0 z-[9999] w-full ${className}`}
            message={message}
            icon={<fa.FaInfo />}
          />
        )}

        {loading && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <LoadingWidget />
          </div>
        )}

        {formShow && (
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
              setFormShow={setFormShow}
            />
          </div>
        )}

        {modalShow && (
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
          />
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

          {/* Superuser Dashboard - Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                token={token}
                superuser={superuser}
                redirectTo="admin"
                setClassName={setClassName}
                setMessage={setMessage}
                setShow={setShow}
              >
                <Dashboard handleModal={handleModal} />
              </ProtectedRoute>
            }
          />

          {/* Driver Dashboard - Protected */}
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute
                token={token}
                superuser={superuser}
                redirectTo="driver"
                setClassName={setClassName}
                setMessage={setMessage}
                setShow={setShow}
              >
                <DriverDashboard onLogout={handleModal} />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QueryClientProvider>
    </>
  );
};

export default App;