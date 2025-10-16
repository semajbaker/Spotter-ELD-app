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
                        <p className="text-gray-600 mt-4">Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat sit in iste officiis commodi quidem hic quas.</p>
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
                                <p>Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 mt-4 lg:mt-0 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiLogoDocker /></i>
                                    <i><fa.FaLinux /></i>
                                </div>
                                <h3><Link to="">DevOps Engineering</Link></h3>
                                <p>Minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat tarad limino ata</p>
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
                                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>
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
                                <p>Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 mt-4 lg:mt-0 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiLogoPython /></i>
                                    <i><fa.FaRProject /></i>
                                </div>
                                <h3><Link to="">Data Analysis</Link></h3>
                                <p>Minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat tarad limino ata</p>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 mt-4 lg:mt-0 p-2">
                            <div className="icon-box">
                                <div className="flex">
                                    <i><bi.BiWifi /></i>
                                    <i><bi.BiSolidNetworkChart /></i>
                                </div>
                                <h3><Link to="">Networking</Link></h3>
                                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
export default Services