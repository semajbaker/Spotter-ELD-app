import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_BASE = process.env.REACT_APP_API_URL;

const Logout = ({setToken, setId, setUser, setMessage, setClassName, setShow, setSuperuser, setLoading}) =>{
    const navigate = useNavigate();
    const LogoutSubmit = () => {
        axios.post(`${API_BASE}/rest-auth/logout/`)
            .then(response => {
                setLoading(true);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("user_id");
                localStorage.removeItem("is_superuser");
                setToken(null);
                setId("");
                setUser("");
                setSuperuser(false);
                setShow(true);
                setTimeout(() => setShow(false), 3500); // Hide after 3 seconds
                setClassName(`bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                setMessage(`You have successfully logged out`);
                navigate("/");
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
                setShow(true);
                setTimeout(() => setShow(false), 3500); // Hide after 3 seconds
                setClassName(`bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md transition duration-300 ease-in-out`);
                setMessage(`Error logging out. Please try again.`);
            });
    };

    return { LogoutSubmit };
}
export default Logout