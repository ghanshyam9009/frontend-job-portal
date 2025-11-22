import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone, FaClock, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../Contexts/AuthContext";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
<<<<<<< HEAD
=======
import logo from "../assets/logo2.png";
import { contactService } from "../services/contactService";
import { withErrorHandling } from "../utils/errorHandler";
>>>>>>> 0511b222a738b17461c4ac79900835018cdf629f

const ContactUs = () => {
  const [theme, setTheme] = useState('light');
   const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    userType: "candidate",
    phone: "",
    subject: ""
  });
<<<<<<< HEAD
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
=======
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
>>>>>>> 0511b222a738b17461c4ac79900835018cdf629f

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setSubmitStatus('success');
      setFormData({ name: "", email: "", message: "", userType: "candidate", phone: "", subject: "" });
      setIsSubmitting(false);
      
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
=======
    setLoading(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      // Submit contact form to API
      const response = await contactService.submitContact(formData);

      if (response.success) {
        setSubmitMessage("Your message has been sent successfully! We'll get back to you soon.");
        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
          userType: "candidate"
        });
      } else {
        setSubmitError("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmitError(error?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
>>>>>>> 0511b222a738b17461c4ac79900835018cdf629f
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      
    <div className="lg:h-20 h-15">
         {isAuthenticated ? <CandidateNavbar /> : <HomeNav />}
      </div>

    
      {/* Hero Section */}
      <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-gray-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Send us a Message
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                  <FaPaperPlane className="mr-3" />
                  <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              <div className="space-y-6">
                {/* User Type Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    I am a *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'userType', value: 'candidate' } })}
                      className={`py-3 px-6 rounded-lg font-medium transition-all ${
                        formData.userType === 'candidate'
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'userType', value: 'recruiter' } })}
                      className={`py-3 px-6 rounded-lg font-medium transition-all ${
                        formData.userType === 'recruiter'
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Recruiter
                    </button>
                  </div>
                </div>

                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                  </div>
                </div>

                {/* Phone and Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="How can we help?"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    rows="6"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none`}
                  ></textarea>
                </div>
<<<<<<< HEAD

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaPaperPlane className="mr-2" />
                      Send Message
                    </span>
                  )}
=======
                
                {submitMessage && (
                  <div className={styles.successMessage}>
                    {submitMessage}
                  </div>
                )}

                {submitError && (
                  <div className={styles.errorMessage}>
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"}
>>>>>>> 0511b222a738b17461c4ac79900835018cdf629f
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-8">
            {/* Contact Details Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Contact Information
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-3 rounded-lg mr-4 flex-shrink-0`}>
                    <FaMapMarkerAlt className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xl`} />
                  </div>
                  <div>
                    <p className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Office Address</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      A 32 Chandra Nagar, Near Barfani Dham, Vijay Nagar, Indore - 452010
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-3 rounded-lg mr-4 flex-shrink-0`}>
                    <FaPhone className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xl`} />
                  </div>
                  <div>
                    <p className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Phone</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      BDM: Siddharth Sharma<br />
                      <a href="tel:9755556617" className="text-blue-600 hover:underline">+91 97555 56617</a>
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Parul Sharma<br />
                      <a href="tel:9993588502" className="text-blue-600 hover:underline">+91 99935 88502</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-3 rounded-lg mr-4 flex-shrink-0`}>
                    <FaEnvelope className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xl`} />
                  </div>
                  <div>
                    <p className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Email</p>
                    <a href="mailto:HR@bigsources.in" className={`text-sm text-blue-600 hover:underline block`}>
                      HR@bigsources.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-3 rounded-lg mr-4 flex-shrink-0`}>
                    <FaClock className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xl`} />
                  </div>
                  <div>
                    <p className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Business Hours</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Follow Us
              </h3>
              <div className="flex space-x-3">
                <a href="#" className={`${isDark ? 'bg-gray-700 hover:bg-blue-600' : 'bg-gray-100 hover:bg-blue-600'} p-3 rounded-lg transition-all hover:text-white group`}>
                  <FaFacebook className={`text-xl ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'}`} />
                </a>
                <a href="#" className={`${isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-100 hover:bg-blue-400'} p-3 rounded-lg transition-all hover:text-white group`}>
                  <FaTwitter className={`text-xl ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'}`} />
                </a>
                <a href="#" className={`${isDark ? 'bg-gray-700 hover:bg-blue-700' : 'bg-gray-100 hover:bg-blue-700'} p-3 rounded-lg transition-all hover:text-white group`}>
                  <FaLinkedin className={`text-xl ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'}`} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Find Us on Map
            </h3>
            <div className="rounded-xl overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.923476612451!2d75.8942173149622!3d22.73099098510019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd40048c29cd%3A0x24c2a428b7d7e5b6!2sMR%209%20Rd%2C%20near%20canara%20bank%2C%20Vijay%20Nagar%2C%20Sector%20A%2C%20Chandra%20Nagar%2C%20Indore%2C%20Madhya%20Pradesh%20452007%2C%20India!5e0!3m2!1sen!2sus!4v1633020431628!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="grayscale-0"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

       <Footer/>
      
    </div>
  );
};

export default ContactUs;