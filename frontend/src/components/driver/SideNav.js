// frontend/src/components/driver/SideNav.js

import { Link as ScrollLink } from 'react-scroll';
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Img from "../../images/james.jpg";
import * as fa from 'react-icons/fa';
import * as bs from 'react-icons/bs';
import * as bi from 'react-icons/bi';
import * as md from 'react-icons/md';
import * as io from 'react-icons/io5';

const DriverSideNav = (props) => {
    const [active, setActive] = useState(true);
    const [nav, setNav] = useState('');
    const [activeSection, setActiveSection] = useState('driver-overview');

    const navigate = useNavigate();
    
    useEffect(() => {
        document.body.className = nav;
        const handleScroll = () => {
            const sections = ['driver-overview', 'trip-planning', 'my-trips', 'my-stops', 'my-logs'];
            let currentSection = 'driver-overview';

            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element && window.scrollY >= element.offsetTop - 100) {
                    currentSection = section;
                }
            });

            setActiveSection(currentSection);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [nav]);

    const handleNavToggle = () => {
        setActive(!active);
        setNav(active ? 'mobile-nav-active' : '');
    };
    
    const handleClick = (section) => {
        navigate('/driver-dashboard');
        setTimeout(() => {
            const element = document.getElementById(section);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <>
            <i className="bi mobile-nav-toggle xl:hidden" onClick={handleNavToggle}>
                {active ? <bs.BsList /> : <bs.BsX />}
            </i>
            <header id="header">
                <div className="flex flex-col">
                    <div className="profile">
                        <img src={Img} alt="img" className="w-full h-auto rounded-full" />
                        <h1 className="text-light"><Link to="/">Driver Portal</Link></h1>
                        <div className="social-links mt-3 text-center">
                            <Link to="#" className="github"><bs.BsGithub /></Link>
                            <Link to="#" className="facebook"><fa.FaFacebookF /></Link>
                            <Link to="#" className="gmail"><bi.BiLogoGmail /></Link>
                            <Link to="#" className="instagram"><bs.BsInstagram /></Link>
                            <Link to="#" className="linkedin"><fa.FaLinkedinIn /></Link>
                        </div>
                    </div>
                    <nav id="nav" className="nav-menu nav">
                        <ul>
                            {/* Driver Dashboard Section */}
                            <li className="nav-section-header">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
                                    My Dashboard
                                </span>
                            </li>
                            <li>
                                <ScrollLink
                                    onClick={() => handleClick('driver-overview')}
                                    onMouseDown={(e) => e.preventDefault()}
                                    to="driver-overview"
                                    smooth={true}
                                    duration={500}
                                    offset={-50}
                                    className={`nav-link scrollto ${activeSection === 'driver-overview' ? 'active' : ''}`}
                                >
                                    <i><io.IoSpeedometerOutline /></i><span>Overview</span>
                                </ScrollLink>
                            </li>
                            <li>
                                <ScrollLink
                                    onClick={() => handleClick('trip-planning')}
                                    onMouseDown={(e) => e.preventDefault()}
                                    to="trip-planning"
                                    smooth={true}
                                    duration={500}
                                    offset={-50}
                                    className={`nav-link scrollto ${activeSection === 'trip-planning' ? 'active' : ''}`}
                                >
                                    <i><md.MdAddCircleOutline /></i><span>Create Trip</span>
                                </ScrollLink>
                            </li>
                            <li>
                                <ScrollLink
                                    onClick={() => handleClick('my-trips')}
                                    onMouseDown={(e) => e.preventDefault()}
                                    to="my-trips"
                                    smooth={true}
                                    duration={500}
                                    offset={-50}
                                    className={`nav-link scrollto ${activeSection === 'my-trips' ? 'active' : ''}`}
                                >
                                    <i><md.MdLocalShipping /></i><span>My Trips</span>
                                </ScrollLink>
                            </li>
                            <li>
                                <ScrollLink
                                    onClick={() => handleClick('my-stops')}
                                    onMouseDown={(e) => e.preventDefault()}
                                    to="my-stops"
                                    smooth={true}
                                    duration={500}
                                    offset={-50}
                                    className={`nav-link scrollto ${activeSection === 'my-stops' ? 'active' : ''}`}
                                >
                                    <i><io.IoLocationSharp /></i><span>My Stops</span>
                                </ScrollLink>
                            </li>
                            <li>
                                <ScrollLink
                                    onClick={() => handleClick('my-logs')}
                                    onMouseDown={(e) => e.preventDefault()}
                                    to="my-logs"
                                    smooth={true}
                                    duration={500}
                                    offset={-50}
                                    className={`nav-link scrollto ${activeSection === 'my-logs' ? 'active' : ''}`}
                                >
                                    <i><bs.BsClipboardData /></i><span>My Logs</span>
                                </ScrollLink>
                            </li>
                            
                            {/* Divider */}
                            <li className="nav-divider">
                                <hr className="my-2 mx-4 border-gray-700" />
                            </li>

                            {/* Navigation Section */}
                            <li className="nav-section-header">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
                                    Navigation
                                </span>
                            </li>
                            
                            {/* Portfolio/Home Button */}
                            <li>
                                <Link
                                    to="/"
                                    className="nav-link"
                                >
                                    <i><fa.FaHome /></i><span>Home</span>
                                </Link>
                            </li>
                            
                            {/* Logout Button */}
                            {props.onLogout && (
                                <li>
                                    <Link
                                        onClick={props.onLogout}
                                        className="nav-link"
                                    >
                                        <i><fa.FaSignOutAlt /></i><span>Logout</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default DriverSideNav;