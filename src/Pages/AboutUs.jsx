import React, { useState, useEffect } from "react";
import { Building2, TrendingUp, Target, Star, Users, Briefcase, Calculator, FileText, Scale, Globe, Award, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import Footer from "../Components/Footer";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import HomeNav from "../Components/HomeNav";
import { useTheme } from "../Contexts/ThemeContext";
import { useAuth } from "../Contexts/AuthContext";

const AboutUs = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [counters, setCounters] = useState({
    placements: 0,
    companies: 0,
    years: 0,
    satisfaction: 0
  });

  const isDark = theme === 'dark';

  // Animated counter effect
  useEffect(() => {
    const targets = { placements: 89, companies: 100, years: 10, satisfaction: 98 };
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let current = { placements: 0, companies: 0, years: 0, satisfaction: 0 };
    
    const timer = setInterval(() => {
      let allReached = true;
      
      Object.keys(targets).forEach(key => {
        if (current[key] < targets[key]) {
          current[key] = Math.min(current[key] + Math.ceil(targets[key] / steps), targets[key]);
          allReached = false;
        }
      });

      setCounters({ ...current });

      if (allReached) clearInterval(timer);
    }, increment);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    { value: counters.placements, suffix: '+', label: 'Successful Placements' },
    { value: counters.companies, suffix: '+', label: 'Partner Companies' },
    { value: counters.years, suffix: '+', label: 'Years of Excellence' },
    { value: counters.satisfaction, suffix: '%', label: 'Client Satisfaction' }
  ];

  const story = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Our Foundation",
      content: [
        "Bigsources.in is a young, vibrant and fast growing recruitment consultant with offices in Indore, with a prime objective of providing professional and value added services in terms of recruitment of quality manpower.",
        "We have been providing our recruitment services to a large spectrum of reputed companies all across the nation. Our strategy is to provide professionalism of highest standard to our clients."
      ]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Our Evolution",
      content: [
        "Over the years we have evolved into one of the most reputed and reliable name for all aspects of HR Consultancy and Recruitment services in India. Payroll outsourcing is the act of delegating payroll administration to third party having expertise in payroll processes.",
        "Generally companies outsource their payroll functions to cut costs, and to get better services. Moreover such companies can concentrate on core business activities with more time available."
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Our Mission",
      content: [
        "Bigsources.in was established with a mission to provide world class Executive Search and Consulting services to our clients to help them enhance their competitiveness through quality human capital.",
        "At the same time we aim to help candidates achieve their career objectives. We have a highly motivated team of HR consultants with professional skills and proven expertise."
      ]
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Our Vision",
      content: [
        "We were established by a team of dedicated and trained professionals to be the single stop for offshore company formation, business and legal services for clients in India and abroad.",
        "The aim of the company is to provide best quality consultancy service at affordable prices to service the specific requirements of the clients in various spheres of business."
      ]
    }
  ];

  const services = [
    {
      icon: <Users className="w-7 h-7" />,
      title: "Recruitment Services",
      description: "Professional recruitment solutions for identifying, evaluating and successfully hiring the best possible candidates."
    },
    {
      icon: <Briefcase className="w-7 h-7" />,
      title: "Executive Search",
      description: "Specialized executive search services to help you find top-tier leadership talent that drives organizational success."
    },
    {
      icon: <Calculator className="w-7 h-7" />,
      title: "Payroll Outsourcing",
      description: "Complete payroll management services that allow you to focus on core business activities while we handle complexities."
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "HR Consultancy",
      description: "Comprehensive HR consulting services including policy development, compliance, and organizational development."
    },
    {
      icon: <Scale className="w-7 h-7" />,
      title: "Legal Services",
      description: "Business formation, legal compliance, and regulatory services to support your business operations and growth."
    },
    {
      icon: <Globe className="w-7 h-7" />,
      title: "Global Solutions",
      description: "International business services and offshore company formation to help you expand globally."
    }
  ];

  const values = [
    {
      icon: <Award className="w-5 h-5" />,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our service delivery"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Integrity",
      description: "We maintain the highest standards of professional integrity"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge solutions"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Partnership",
      description: "We build long-term partnerships with our clients and candidates"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      
      {/* Navbar - COMPACT */}
      <div className="h-16">
        {isAuthenticated ? <CandidateNavbar /> : <HomeNav />}
      </div>

      {/* Hero Section - COMPACT */}
      <section className={`relative overflow-hidden ${
        isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700'
      }`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
              <Building2 className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-semibold">Leading HR Solutions Provider</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Empowering Businesses Through<br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Innovative HR Solutions
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto mb-6">
              Professional recruitment services connecting exceptional talent with outstanding opportunities across India
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <span>Discover Our Journey</span>
              </button>
              <button className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-bold text-sm hover:bg-white/20 transition-all">
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V80Z" 
                  fill={isDark ? '#111827' : '#ffffff'}/>
          </svg>
        </div>
      </section>

      {/* Stats Section - COMPACT */}
      <section className={`py-10 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center p-4 rounded-lg transition-all hover:shadow-lg ${
                isDark ? 'bg-gray-900' : 'bg-white'
              }`}>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {stat.value}{stat.suffix}
                </div>
                <div className={`text-xs font-semibold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section - COMPACT */}
      <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              OUR STORY
            </span>
            <h2 className={`text-2xl md:text-3xl font-bold mt-3 mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Building Bridges Between Talent and Opportunity
            </h2>
            <p className={`text-sm md:text-base max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Discover how we've grown into one of India's most trusted HR consultancy firms
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {story.map((item, index) => (
              <div key={index} className={`p-5 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'
              }`}>
                <div className={`inline-flex p-3 rounded-lg mb-3 ${
                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-white text-blue-600'
                }`}>
                  {item.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title}
                </h3>
                {item.content.map((paragraph, i) => (
                  <p key={i} className={`mb-2 text-sm leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section - COMPACT */}
      <section className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Our Core Values
            </h2>
            <p className={`text-sm md:text-base ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <div key={index} className={`p-4 rounded-lg text-center transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                isDark ? 'bg-gray-900' : 'bg-white'
              }`}>
                <div className={`inline-flex p-2.5 rounded-full mb-3 ${
                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {value.icon}
                </div>
                <h4 className={`text-base font-bold mb-1.5 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {value.title}
                </h4>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - COMPACT */}
      <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              OUR SERVICES
            </span>
            <h2 className={`text-2xl md:text-3xl font-bold mt-3 mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Comprehensive HR Solutions
            </h2>
            <p className={`text-sm md:text-base max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              End-to-end services designed to meet all your HR and business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <div key={index} className={`p-5 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 group ${
                isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-purple-50'
              }`}>
                <div className={`inline-flex p-3 rounded-lg mb-3 transition-all group-hover:scale-110 ${
                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {service.icon}
                </div>
                <h3 className={`text-base font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {service.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {service.description}
                </p>
                <button className="mt-3 text-blue-600 font-semibold text-xs flex items-center gap-1.5 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - COMPACT */}
      <section className={`py-12 ${
        isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-base md:text-lg text-blue-100 mb-6">
            Let's discuss how we can help you achieve your HR and recruitment goals
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all shadow-lg">
              Schedule a Consultation
            </button>
            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-bold text-sm hover:bg-white/20 transition-all">
              View Our Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className={`py-6  ${isDark ? 'bg-gray-950 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        <Footer />
      </div>
    </div>
  );
};

export default AboutUs;