import * as fa from 'react-icons/fa';
import * as bi from 'react-icons/bi';
import { Link } from "react-router-dom";

const Services = () => {
    return (
        <>
            <section id="featured" className="featured">
                <div className="container mx-auto">
                    <div className="section-title mb-8">
                        <h2 className="text-4xl font-bold">Services</h2>
                        <p className="text-gray-600 mt-4">Offering comprehensive software development services with expertise in modern web technologies, mobile applications, cloud infrastructure, and data solutions. Committed to delivering scalable, efficient, and user-friendly solutions tailored to your business needs.</p>
                    </div>
                    <div className="flex flex-wrap">
                        <div className="w-full lg:w-1/3 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiLogoReact /></i>
                                    <i><bi.BiLogoTailwindCss /></i>
                                    <i><bi.BiLogoPython /></i>
                                </div>
                                <h3><Link to="">Web Development</Link></h3>
                                <p>Building responsive and dynamic web applications using React, Tailwind CSS, and Python frameworks. Specializing in full-stack development with modern UI/UX principles and RESTful API integration.</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 mt-4 lg:mt-0 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiLogoDocker /></i>
                                    <i><fa.FaLinux /></i>
                                </div>
                                <h3><Link to="">DevOps Engineering</Link></h3>
                                <p>Implementing containerized applications with Docker, managing Linux servers, and setting up CI/CD pipelines. Experienced in automating deployment processes and optimizing infrastructure for scalability.</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 mt-4 lg:mt-0 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiLogoPostgresql /></i>
                                    <i><bi.BiLogoMongodb /></i>
                                    <i><bi.BiLogoFirebase /></i>
                                </div>
                                <h3><Link to="">Database Management</Link></h3>
                                <p>Designing and managing relational and NoSQL databases including PostgreSQL, MongoDB, and Firebase. Expertise in database optimization, data modeling, and implementing secure data storage solutions.</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiLogoAndroid /></i>
                                    <i><bi.BiLogoWindows /></i>
                                    <i><bi.BiLogoApple /></i>
                                </div>
                                <h3><Link to="">Cross Platform Development</Link></h3>
                                <p>Creating native-quality mobile applications using Flutter that run seamlessly on Android, iOS, and Windows. Developing feature-rich apps with beautiful interfaces and optimal performance across all platforms.</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 mt-4 lg:mt-0 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiLogoPython /></i>
                                    <i><fa.FaRProject /></i>
                                </div>
                                <h3><Link to="">Data Analysis</Link></h3>
                                <p>Leveraging Python and R for data analysis, visualization, and processing. Experienced in working with large datasets, implementing machine learning models, and extracting meaningful insights from complex data.</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 mt-4 lg:mt-0 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiWifi /></i>
                                    <i><bi.BiSolidNetworkChart /></i>
                                </div>
                                <h3><Link to="">Networking</Link></h3>
                                <p>Configuring network infrastructure, implementing secure communication protocols, and managing cloud-based networking solutions. Ensuring reliable connectivity and data transfer across distributed systems.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Services;