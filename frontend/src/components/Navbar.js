import { Link as ScrollLink } from 'react-scroll';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../images/logo.svg';
import * as fa from 'react-icons/fa';
import * as bs from 'react-icons/bs';

const Navbar = (props) => {
  const [display, setDisplay] = useState(false);
  const [nav, setNav] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on any dashboard page
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/driver-dashboard';

  useEffect(() => {
    document.body.className = nav;
    const handleScroll = () => {
      const sections = ['home', 'about', 'resume', 'services', 'contact'];
      let currentSection = 'home';

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 50) {
          currentSection = section;
        }
      });

      setActiveSection(currentSection);
    };
    const handleClickOutside = (event) => {
      if (display && !event.target.closest('.navbar_toggle')) {
        setDisplay(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [nav, display]);

  const handleNavToggle = (event) => {
    event.stopPropagation();
    setNav(display ? '' : 'mobile-nav-active');
    setDisplay(!display);
  };

  const handleClick = (section) => {
    navigate('/');
    setTimeout(() => {
      document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // If on any dashboard, don't render the navbar (TopBar/SideNav will handle it)
  if (isDashboard) {
    return null;
  }

  return (
    <nav className="navbar" style={{ zIndex: 9999, position: 'fixed', width: '100%', top: 0 }}>
      <div className="navbar_container">
        <div className="logo_container">
          <ScrollLink className="logo_link" to="home" smooth={true} duration={500}>
            <img src={Logo} className="logo" alt="logo"></img>
          </ScrollLink>
        </div>
        <div className="navbar_toggle" onClick={handleNavToggle}>
          {display ? <fa.FaRegWindowClose /> : <fa.FaBars />}
        </div>
        <ul className={display ? "navbar_menu activated" : "navbar_menu"}>
          <li className="menu_items">
            <ScrollLink
              className={`navbar_links scrollto ${activeSection === 'home' ? 'active' : ''}`}
              to="home"
              smooth={true}
              duration={500}
              onClick={() => handleClick('home')}
            >
              <i><fa.FaHome /></i>
            </ScrollLink>
          </li>
          <li className="menu_items">
            <ScrollLink
              className={`navbar_links scrollto ${activeSection === 'about' ? 'active' : ''}`}
              to="about"
              smooth={true}
              duration={500}
              onClick={() => handleClick('about')}
            >
              <i><fa.FaQuestionCircle /></i>
            </ScrollLink>
          </li>
          <li className="menu_items">
            <ScrollLink
              className={`navbar_links scrollto ${activeSection === 'resume' ? 'active' : ''}`}
              to="resume"
              smooth={true}
              duration={500}
              onClick={() => handleClick('resume')}
            >
              <i><bs.BsFilePdf /></i>
            </ScrollLink>
          </li>
          <li className="menu_items">
            <ScrollLink
              className={`navbar_links scrollto ${activeSection === 'services' ? 'active' : ''}`}
              to="services"
              smooth={true}
              duration={500}
              onClick={() => handleClick('services')}
            >
              <i><fa.FaServer /></i>
            </ScrollLink>
          </li>
          <li className="menu_items">
            <ScrollLink
              className={`navbar_links scrollto ${activeSection === 'contact' ? 'active' : ''}`}
              to="contact"
              smooth={true}
              duration={500}
              onClick={() => handleClick('contact')}
            >
              <i><fa.FaAddressBook /></i>
            </ScrollLink>
          </li>
          {/* Show admin dashboard icon for superusers */}
          {props.admin}
          {/* Show driver dashboard icon for regular users */}
          {props.dashboard}
          {/* Show auth (login/logout) icon */}
          {props.auth}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;