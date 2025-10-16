import * as bi from 'react-icons/bi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Contact = () => {
  const position = [-26.33950136561176, 31.11967034288951];
  return (
    <>
      <section id="contact" className="contact">
        <div className="container mx-auto px-4">
          <div className="section-title">
            <h2>Contact</h2>
            <p>
              Ready to bring your project to life? Get in touch to discuss how I can help with your software development needs. Whether you need a web application, mobile app, or cloud solution, I'm here to collaborate and deliver quality results.
            </p>
          </div>

          <div className="flex flex-wrap info" data-aos="fade-in">
            <div className="w-full flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 p-4">
                <i className="text-2xl"><bi.BiMap /></i>
                <h4>Location:</h4>
                <p>Mbabane Zone 4 Lomkiri, Eswatini</p>
              </div>

              <div className="w-full lg:w-1/3 p-4">
                <i className="text-2xl"><bi.BiEnvelope /></i>
                <h4>Email:</h4>
                <p>bakersemaj0@gmail.com</p>
              </div>

              <div className="w-full lg:w-1/3 p-4">
                <i className="text-2xl"><bi.BiPhone /></i>
                <h4>Call:</h4>
                <p>+268 76395616</p>
                <p>+268 76156953</p>
                <p>+268 79631110</p>
              </div>
            </div>

            <div className="w-full flex flex-col lg:flex-row mt-4">
              <div className="w-full lg:w-1/3 p-4">
                <i className="text-2xl"><bi.BiLogoGithub /></i>
                <h4>GitHub:</h4>
                <p>
                  <a 
                    href="https://github.com/semajbaker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    github.com/semajbaker
                  </a>
                </p>
              </div>

              <div className="w-full lg:w-1/3 p-4">
                <i className="text-2xl"><bi.BiLogoLinkedin /></i>
                <h4>LinkedIn:</h4>
                <p>
                  <a 
                    href="https://www.linkedin.com/in/james-baker-75515732b/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    James Baker
                  </a>
                </p>
              </div>

              <div className="w-full lg:w-1/3 p-4">
                <i className="text-2xl"><bi.BiLogoMedium /></i>
                <h4>Medium:</h4>
                <p>
                  <a 
                    href="https://medium.com/@bakersemaj0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    @bakersemaj0
                  </a>
                </p>
              </div>
            </div>

            <div className="w-full mt-8 p-4">
              <h4 className="mb-4">Find Me Here:</h4>
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer 
                  center={position} 
                  zoom={15} 
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>
                      Mbabane Zone 4 Lomkiri, Eswatini
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;