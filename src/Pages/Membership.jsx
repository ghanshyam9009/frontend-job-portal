import React, { useState } from 'react';
import { Check, Crown, Briefcase, User, Sparkles, ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react';
import HomeNav from '../Components/HomeNav';
import Footer from '../Components/Footer';

export default function Membership() {
  const [activeTab, setActiveTab] = useState('employers');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const employerPlans = [
    {
      name: 'Free Posting',
      description: 'Free basic plan with 15 days trial and first job premium apply free.',
      price: 0,
      duration: '15 Days',
      popular: false,
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      features: [
        'Free job posting',
        '50 applies',
        'Post expiry 15 days',
        'Email support',
        'Basic job postings',
        'Access to candidate profiles'
      ]
    },
    {
      name: 'Employer Plan',
      description: 'Simple per-post payment model for flexible recruitment needs.',
      price: 350,
      duration: 'Per Job Post',
      popular: true,
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      features: [
        'Up to 220 candidate applications',
        '24/7 Customer support',
        'Email support',
        'Experience candidate',
        'Personal HR/Recruiter support',
        'Basic candidate filtering'
      ]
    },
    {
      name: 'Premium Job',
      description: 'Complete recruitment platform with unlimited features.',
      price: 1000,
      duration: '1 Month',
      popular: false,
      icon: <Crown className="w-6 h-6 text-purple-600" />,
      features: [
        'Unlimited applications',
        '24/7 Customer support',
        'Email support',
        'Personal HR/Recruiter support',
        'Post expiry 1 month',
        'Show Premium banner',
        'Candidate filtering',
        'Candidate matching'
      ]
    }
  ];

  const candidatePlans = [
    {
      name: 'Standard',
      description: 'Perfect for beginners starting their job search journey.',
      price: 250,
      duration: '1 Month',
      popular: false,
      icon: <User className="w-6 h-6 text-blue-600" />,
      features: [
        'Search and apply',
        'Save job',
        'Candidate panel',
        'Email support',
        'Free government job access',
        'Access to all job listings',
        'Filter job',
        'Notification of job'
      ]
    },
    {
      name: 'Premium',
      description: 'Go all in — with expert support & complete job search tools.',
      price: 1000,
      duration: '3 Months',
      popular: true,
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      features: [
        'Apply for all premium jobs',
        'Interview guidance',
        'Customer support',
        'Resume improvement suggestion',
        'Instant job alerts',
        'Direct HR connection',
        'Application tracking',
        'Verified job posts only'
      ]
    }
  ];

  const faqs = [
    {
      question: "Can I cancel my membership?",
      answer: "Yes, you can cancel your membership at any time from your account settings. Your plan will remain active until the end of the billing period."
    },
    {
      question: "Is there a free trial available?",
      answer: "We offer a free 15-day trial for employers. For candidates, you can browse limited job listings with a free account."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and UPI payments through our secure payment gateway."
    },
    {
      question: "Can I upgrade my plan later?",
      answer: "Yes, you can upgrade your plan at any time. The remaining balance from your current plan will be credited towards your new plan."
    }
  ];

  const currentPlans = activeTab === 'employers' ? employerPlans : candidatePlans;

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      
     <HomeNav/>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mt-10 lg:mt-20 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
            MEMBERSHIP PLANS
          </span>

          <h1 className={`text-4xl md:text-5xl font-bold mt-4 leading-tight ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Your Perfect Plan
          </h1>

          <p className={`max-w-2xl mx-auto mt-2 text-base ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Select the plan that best fits your needs and start your journey today
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-12">
          <div className={`rounded-xl shadow-lg p-1.5 inline-flex ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              onClick={() => setActiveTab('employers')}
              className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'employers'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              For Employers
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'candidates'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              For Candidates
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-6 max-w-5xl mx-auto mb-16 ${
          currentPlans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-xl'
        }`}>
          {currentPlans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-2 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } ${plan.popular && activeTab === "employers" ? 'ring-4 ring-blue-500 scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 text-xs font-bold">
                  ⭐ MOST POPULAR
                </div>
              )}

              {/* Card Body - FIXED HEIGHT + FLEX COLUMN */}
              <div className="p-6 flex flex-col h-full">

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100'
                      : darkMode ? 'bg-gray-700' : 'bg-blue-50'
                  }`}>
                    {plan.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold text-center mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>

                {/* Description */}
                <p className={`text-center text-xs mb-4 min-h-[32px] ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="text-center mb-5">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                  <div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {plan.duration}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    What's Included
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BUTTON AT BOTTOM */}
                <button 
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : darkMode
                        ? ' mt-auto bg-gray-700 text-white hover:bg-blue-600'
                        : 'bg-gray-100 mt-auto text-gray-900 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className={`text-3xl font-bold text-center mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Frequently Asked Questions
          </h2>

          <p className={`text-center mb-8 text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Got questions? We've got answers.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg shadow-md transition-all ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`w-full px-5 py-4 flex justify-between items-center ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-semibold text-sm ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {faq.question}
                  </span>

                  {expandedFaq === index 
                    ? <ChevronUp className="w-5 h-5 text-blue-600" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {expandedFaq === index && (
                  <div className="px-5 pb-4">
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-10 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            Need a Custom Plan?
          </h3>
          <p className="text-blue-100 mb-5">
            Contact our sales team for enterprise solutions and custom pricing
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
            Contact Sales Team
          </button>
        </div>

        {/* Trust Badge */}
        <div className="mt-10 text-center">
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            🔒 All plans include secure payment processing and data protection
          </p>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
