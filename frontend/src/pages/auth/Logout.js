import axios from "axios";
import { useNavigate } from "react-router-dom";
const Logout = ({setToken, setId, setUser, setMessage, setClassName, setShow, setSuperuser}) =>{
    const navigate = useNavigate();
    const LogoutSubmit = () => {
        axios.post('http://localhost:8000/rest-auth/logout/')
            .then(response => {
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
            })
            .catch(err => {
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