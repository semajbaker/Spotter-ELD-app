const Resume = () => {
    return (
        <>
            <section id="resume" className="resume">
                <div className="container mx-auto">
                    <div className="section-title">
                        <h2>Resume</h2>
                        <p>Software developer with expertise in full-stack development, mobile applications, and cloud-based solutions. Experienced in building document management systems and implementing AI-powered features.</p>
                    </div>
                    <div className="flex flex-wrap">
                        <div className="w-full lg:w-1/2" data-aos="fade-up">
                            <h3 className="resume-title">Summary</h3>
                            <div className="resume-item pb-0">
                                <h4>James Baker</h4>
                                <p><em>Software developer specializing in full-stack development with Python, JavaScript, Flutter, and Docker. Passionate about creating efficient, scalable solutions with modern technologies and cloud infrastructure.</em></p>
                                <ul className="list-disc list-inside">
                                    <li>Mbabane Zone 4 Lomkiri, Eswatini</li>
                                    <li>76395616 / 76156953 / 79631110</li>
                                    <li>bakersemaj0@gmail.com</li>
                                    <li>Date of Birth: 06/08/2000</li>
                                    <li>Nationality: Swazi</li>
                                </ul>
                            </div>

                            <h3 className="resume-title">Education</h3>
                            <div className="resume-item">
                                <h4>Bachelor of Science in Computer Science</h4>
                                <h5>October 2020 - September 2024</h5>
                                <p><em>Eswatini Medical Christian University, Mbabane, Hhohho Region</em></p>
                                <p>Gained foundational knowledge in programming, algorithms, data structures, and software development principles. This academic background provided the technical foundation for pursuing a career in software engineering and mobile application development.</p>
                            </div>

                            <h3 className="resume-title">Languages</h3>
                            <div className="resume-item pb-0">
                                <ul className="list-disc list-inside">
                                    <li>English (Fluent)</li>
                                    <li>Siswati (Native)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2" data-aos="fade-up" data-aos-delay="100">
                            <h3 className="resume-title">Professional Experience</h3>
                            <div className="resume-item">
                                <h4>Software Developer</h4>
                                <h5>March 2025 - August 2025</h5>
                                <p><em>Docsecure Eswatini, Mbabane, Hhohho Region</em></p>
                                <ul className="list-disc list-inside">
                                    <li>Developed a comprehensive Document Management System for handling invoices, bank statements, pay slips, and receipts</li>
                                    <li>Implemented Google's Document AI and OCR technology for automated text extraction and document processing</li>
                                    <li>Designed and built secure cloud storage integration with Amazon AWS and Google Drive for document archival</li>
                                    <li>Led the digitalization initiative to transform paper-based documents into secure digital formats</li>
                                    <li>Developed robust security measures to ensure document confidentiality and data protection in cloud environments</li>
                                    <li>Created user-friendly interfaces for document upload, retrieval, and management</li>
                                </ul>
                            </div>

                            <h3 className="resume-title">Skills</h3>
                            <div className="resume-item pb-0">
                                <ul className="list-disc list-inside">
                                    <li><strong>Python:</strong> Very Good</li>
                                    <li><strong>JavaScript:</strong> Very Good</li>
                                    <li><strong>Flutter (Dart):</strong> Very Good</li>
                                    <li><strong>Docker:</strong> Very Good</li>
                                    <li><strong>Cloud Services:</strong> AWS, Google Drive</li>
                                    <li><strong>AI/ML:</strong> Google Document AI, OCR</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Resume;