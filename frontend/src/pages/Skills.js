const Skills = () => {
    return (
        <>
            <section id="skills" className="skills bg-gray-100 py-12">
                <div className="container mx-auto">
                    <div className="section-title mb-8">
                        <h2 className="text-3xl font-bold">Skills</h2>
                        <p className="text-gray-600">
                            Proficient in modern development tools and frameworks with a strong focus on building secure, scalable systems and mobile applications.
                        </p>
                    </div>
                    <div className="flex flex-wrap">
                        <div className="w-full lg:w-1/2 mb-8" data-aos="fade-up">
                            <div className="p-4">
                                <span className="block text-sm font-semibold">Python <i className="float-right">90%</i></span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                                </div>
                            </div>
                            <div className="p-4">
                                <span className="block text-sm font-semibold">Docker <i className="float-right">85%</i></span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 mb-8" data-aos="fade-up" data-aos-delay="100">
                            <div className="p-4">
                                <span className="block text-sm font-semibold">JavaScript <i className="float-right">80%</i></span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                            <div className="p-4">
                                <span className="block text-sm font-semibold">Flutter <i className="float-right">85%</i></span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Skills;