import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone, FaClock, FaPaperPlane } from "react-icons/fa";
import { validateForm } from "../utils/errorHandler";
import { toast } from "react-toastify";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { useAuth } from "../Contexts/AuthContext";

const ContactUs = () => {
  const [theme, setTheme] = useState('light');
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    userType: "candidate",
    phone: "",
    subject: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Validate on blur
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    const fieldErrors = {};
    
    if (name === 'name' && (!value || value.trim() === '')) {
      fieldErrors.name = 'Name is required';
    } else if (name === 'name' && value.length < 2) {
      fieldErrors.name = 'Name must be at least 2 characters';
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || value.trim() === '') {
        fieldErrors.email = 'Email is required';
      } else if (!emailRegex.test(value)) {
        fieldErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (name === 'subject' && (!value || value.trim() === '')) {
      fieldErrors.subject = 'Subject is required';
    }
    
    if (name === 'message' && (!value || value.trim() === '')) {
      fieldErrors.message = 'Message is required';
    } else if (name === 'message' && value.length < 10) {
      fieldErrors.message = 'Message must be at least 10 characters';
    }
    
    if (name === 'phone' && value && value.trim() !== '') {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        fieldErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    setErrors(prev => ({ ...prev, ...fieldErrors }));
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      name: true,
      email: true,
      subject: true,
      message: true
    };
    setTouched(allTouched);
    
    // Validate all required fields
    const validationRules = {
      name: { required: true, minLength: 2, label: 'Name' },
      email: { required: true, type: 'email', label: 'Email' },
      subject: { required: true, label: 'Subject' },
      message: { required: true, minLength: 10, label: 'Message' }
    };
    
    const validationErrors = validateForm(formData, validationRules);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Form submitted:", formData);
      setSubmitStatus('success');
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: "", email: "", message: "", userType: "candidate", phone: "", subject: "" });
      setTouched({});
      
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
          
    <div className="lg:h-20 h-15">
         {user ? <CandidateNavbar/> : <HomeNav/>}
      </div>
{console.log(user)}

      {/* Compact Hero Section */}
      <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-gray-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'} text-white py-8`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Get in Touch</h1>
          <p className="text-sm text-blue-100 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content - Compact */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Contact Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-5`}>
              <div className="mb-4">
                <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Send us a Message
                </h2>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {submitStatus === 'success' && (
                <div className="mb-4 p-2.5 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center text-xs">
                  <FaPaperPlane className="mr-2 text-sm" />
                  <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              <div className="space-y-3.5">
                {/* User Type Selection */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    I am a *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'userType', value: 'candidate' } })}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        formData.userType === 'candidate'
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'userType', value: 'recruiter' } })}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        formData.userType === 'recruiter'
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Recruiter
                    </button>
                  </div>
                </div>

                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="name" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        errors.name && touched.name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      } focus:outline-none focus:ring-1`}
                    />
                    {errors.name && touched.name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="john@example.com"
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        errors.email && touched.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      } focus:outline-none focus:ring-1`}
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="phone" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="+91 98765 43210"
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        errors.phone && touched.phone
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      } focus:outline-none focus:ring-1`}
                    />
                    {errors.phone && touched.phone && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="How can we help?"
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        errors.subject && touched.subject
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      } focus:outline-none focus:ring-1`}
                    />
                    {errors.subject && touched.subject && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.subject}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Tell us more about your inquiry..."
                    rows="4"
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                      errors.message && touched.message
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                    } focus:outline-none focus:ring-1 resize-none`}
                  ></textarea>
                  {errors.message && touched.message && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaPaperPlane className="mr-1.5 text-sm" />
                      Send Message
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information Sidebar - Compact */}
          <div className="space-y-4">
            {/* Contact Details Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
              <h3 className={`text-base font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-2 rounded-lg mr-2.5 flex-shrink-0`}>
                    <FaMapMarkerAlt className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm`} />
                  </div>
                  <div>
                    <p className={`font-semibold text-xs mb-0.5 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Office Address</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      A 32 Chandra Nagar, Near Barfani Dham, Vijay Nagar, Indore - 452010
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-2 rounded-lg mr-2.5 flex-shrink-0`}>
                    <FaPhone className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm`} />
                  </div>
                  <div>
                    <p className={`font-semibold text-xs mb-0.5 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Phone</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5`}>
                      BDM: Siddharth Sharma<br />
                      <a href="tel:9755556617" className="text-blue-600 hover:underline">+91 97555 56617</a>
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Parul Sharma<br />
                      <a href="tel:9993588502" className="text-blue-600 hover:underline">+91 99935 88502</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-2 rounded-lg mr-2.5 flex-shrink-0`}>
                    <FaEnvelope className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm`} />
                  </div>
                  <div>
                    <p className={`font-semibold text-xs mb-0.5 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Email</p>
                    <a href="mailto:HR@bigsources.in" className={`text-xs text-blue-600 hover:underline block`}>
                      HR@bigsources.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} p-2 rounded-lg mr-2.5 flex-shrink-0`}>
                    <FaClock className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm`} />
                  </div>
                  <div>
                    <p className={`font-semibold text-xs mb-0.5 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Business Hours</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Card - Compact */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
              <h3 className={`text-base font-bold mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Follow Us
              </h3>
              <div className="flex space-x-2">
                <a href="#" className={`${isDark ? 'bg-gray-700 hover:bg-blue-600' : 'bg-gray-100 hover:bg-blue-600'} p-2 rounded-lg transition-all hover:text-white group`}>
                  <FaFacebook className={`text-base ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'}`} />
                </a>
                <a href="#" className={`${isDark ? 'bg-gray-700 hover:bg-blue-400' : 'bg-gray-100 hover:bg-blue-400'} p-2 rounded-lg transition-all hover:text-white group`}>
                  <FaTwitter className={`text-base ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'}`} />
                </a>
                <a href="#" className={`${isDark ? 'bg-gray-700 hover:bg-blue-700' : 'bg-gray-100 hover:bg-blue-700'} p-2 rounded-lg transition-all hover:text-white group`}>
                  <FaLinkedin className={`text-base ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'}`} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section - Compact */}
        <div className="mt-6">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-5`}>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Find Us on Map
            </h3>
            <div className="rounded-lg overflow-hidden h-64">
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