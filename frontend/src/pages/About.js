import Img from "../images/profile-img.jpg";

const About = () => {
    return (
        <>
            <section id="about" className="about">
                <div className="container mx-auto">
                    <div className="section-title">
                        <h2>About</h2>
                        <p>
                            Software Developer with strong skills in Python, Docker, JavaScript, and Flutter. Passionate about building secure, scalable systems and mobile applications.
                        </p>
                    </div>
                    <div className="flex flex-wrap">
                        <div className="w-full lg:w-1/3 pr-4" data-aos="fade-right">
                            <img src={Img} className="img-fluid" alt="Profile" />
                        </div>
                        <div className="w-full lg:w-2/3 pt-4 lg:pt-0 content" data-aos="fade-left">
                            <h3>Software Developer</h3>
                            <div className="flex flex-wrap">
                                <div className="w-full lg:w-1/2 p-4">
                                    <ul>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Email:</strong> <span>bakersemaj0@gmail.com</span></li>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Phone:</strong> <span>76395616 / 76156953 / 79631110</span></li>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Address:</strong> <span>Mbabane Zone 4 Lomkiri</span></li>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Date of Birth:</strong> <span>06/08/2000</span></li>
                                    </ul>
                                </div>
                                <div className="w-full lg:w-1/2 p-4">
                                    <ul>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Marital Status:</strong> <span>Single</span></li>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Nationality:</strong> <span>Swazi</span></li>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Languages:</strong> <span>English, Siswati</span></li>
                                        <li><i className="bi bi-chevron-right"></i> <strong>Skills:</strong> <span>Python, Docker, JavaScript, Flutter</span></li>
                                    </ul>
                                </div>
                            </div>

                            <h4 className="mt-6">Experience</h4>
                            <p>
                                <strong>Software Developer, Docsecure Eswatini</strong><br />
                                Mbabane, Hhohho Region — March 2025 to August 2025
                            </p>
                            <p>
                                Developed a Document Management System to handle invoices, bank statements, pay slips, and receipts. Integrated Google's Document AI and OCR for text extraction. The system securely stores digitized documents in cloud vaults like Amazon AWS and Google Drive.
                            </p>

                            <h4 className="mt-6">Education</h4>
                            <p>
                                <strong>Bachelor's Degree in Computer Science</strong><br />
                                Eswatini Medical Christian University, Mbabane, Hhohho Region — October 2020 to September 2024
                            </p>
                            <p>
                                Gained foundational knowledge in programming, algorithms, data structures, and software development principles. This academic background laid the groundwork for a career in software engineering and mobile application development.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;