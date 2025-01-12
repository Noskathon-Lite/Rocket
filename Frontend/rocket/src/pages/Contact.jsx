function Contact() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4 mt-4 text-black">Contact Us</h1>
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow max-w-md mx-auto">
        <div className="space-y-3 text-black">
          <p>
            <strong>Address:</strong> Balkumari, Lalitpur{" "}
          </p>
          <p>
            <strong>Phone:</strong>
            <a
              href="tel:+97798123345670"
              className="text-blue-500 hover:underline"
            >
              +977 98123345670
            </a>
          </p>
          <p>
            <strong>Email:</strong>
            <a
              href="mailto:info@autoplate.com"
              className="text-blue-500 hover:underline"
            >
              info@autoplate.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
