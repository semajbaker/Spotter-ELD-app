const Contact = () => {
  return (
    <>
      <section id="contact" className="contact">
        <div className="container mx-auto px-4">
          <div className="section-title">
            <h2>Contact</h2>
            <p>
              Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat sit in iste officiis commodi quidem hic quas.
            </p>
          </div>

          <div className="flex flex-wrap info" data-aos="fade-in">
            <div className="w-full flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 p-4">
                <i className="bi bi-geo-alt"></i>
                <h4>Location:</h4>
                <p>A108 Adam Street, New York, NY 535022</p>
              </div>

              <div className="w-full lg:w-1/3 p-4">
                <i className="bi bi-envelope"></i>
                <h4>Email:</h4>
                <p>info@example.com</p>
              </div>

              <div className="w-full lg:w-1/3 p-4">
                <i className="bi bi-phone"></i>
                <h4>Call:</h4>
                <p>+1 5589 55488 55s</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
