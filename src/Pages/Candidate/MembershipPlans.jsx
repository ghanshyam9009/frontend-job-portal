import React, { useState } from "react";
import { Check, Crown, Sparkles, User, ChevronDown, ChevronUp, Loader2, Rocket, MessageCircle, BarChart3, Shield } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import Footer from "../../Components/Footer";


const MembershipPlans = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const isDark = theme === 'dark';

  const candidatePlans = [

    { id:'standard',
      name: 'Standard',
          description: 'Perfect for beginners starting their job search journey.',
          price: "₹250",
          priceValue:250,
          validity: '1 Month',
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
      id: 'preium',
     name: 'Premium',
           description: 'Go all in — with expert support & complete job search tools.',
           price: "₹1000",
 priceValue:1000,
          validity: '3 Months',
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

  const benefits = [
    {
      icon: <Rocket className="w-12 h-12" />,
      title: "Unlimited Applications",
      description: "Apply to as many jobs as you want without restrictions"
    },
    {
      icon: <Crown className="w-12 h-12" />,
      title: "Priority Visibility",
      description: "Your profile appears higher in employer searches"
    },
    {
      icon: <MessageCircle className="w-12 h-12" />,
      title: "Direct Messaging",
      description: "Communicate directly with hiring managers"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Advanced Analytics",
      description: "Track your application success and profile views"
    }
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 7-day free trial for all premium plans. No credit card required to start your trial."
    },
    {
      question: "Can I change plans later?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
    }
  ];

  const handleUpgrade = async (plan) => {
    if (!user) {
      alert('Please login to upgrade your plan.');
      // navigate('/candidate/login');
      return;
    }

    setProcessingPlan(plan.id);
    setLoading(true);

    try {
      const amount = plan.priceValue;

      if (isNaN(amount)) {
        throw new Error('Invalid plan price');
      }

      // Initialize Razorpay checkout
      const options = {
        key: 'rzp_live_SaAoyjTJuO8TWo',
        amount: amount * 100,
        currency: 'INR',
        name: 'Job Portal',
        description: `${plan.name} Plan - ${plan.validity}`,
        prefill: {
          name: `${user.firstName || 'User'} ${user.lastName || ''}`,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          user_id: user.id,
          user_type: 'candidate',
          plan_type: plan.id,
          plan_name: plan.name
        },
        theme: {
          color: '#3399cc'
        },
        handler: async function (response) {
          try {
            const membershipResponse = await fetch('https://api.bigsources.in/api/premium/mark-student-premium', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                is_premium: true,
                plan: plan.id,
                payment_id: response.razorpay_payment_id,
                user_type: 'candidate'
              })
            });

            if (!membershipResponse.ok) {
              throw new Error('Failed to update membership');
            }

            alert(`Successfully upgraded to ${plan.name} plan! Welcome to premium.`);
            // navigate('/candidate/dashboard');

          } catch (verifyError) {
            console.error('Membership update failed:', verifyError);
            alert('Payment successful but membership update failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPlan(null);
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert('Payment failed. Please try again.');
        setProcessingPlan(null);
        setLoading(false);
      });

      rzp.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
      setProcessingPlan(null);
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      
      {/* Navbar Placeholder - Add CandidateNavbar here */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
            CANDIDATE MEMBERSHIP PLANS
          </span>

          <h1 className={`text-4xl md:text-5xl font-bold mt-4 leading-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Your Career Growth Plan
          </h1>

          <p className={`max-w-2xl mx-auto mt-2 text-base ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Unlock premium features and accelerate your job search journey
          </p>
        </div>

        {/* Pricing Cards */}
        

        <div className={`grid gap-6 max-w-5xl mx-auto mb-16 ${
                'md:grid-cols-2 max-w-xl'
                }`}>
                  {candidatePlans.map((plan, index) => (
                    <div
                      key={index}
                      className={`rounded-xl shadow-lg overflow-hidden  transition-all hover:shadow-xl hover:-translate-y-2 ${
                       isDark ? 'bg-gray-800' : 'bg-white'
                      } ${plan.popular === "employers" ? 'ring-4 ring-blue-500 scale-105' : ''}`}
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
                              :isDark ? 'bg-gray-700' : 'bg-blue-50'
                          }`}>
                            {plan.icon}
                          </div>
                        </div>
        
                        {/* Title */}
                        <h3 className={`text-xl font-bold text-center mb-2 ${
                         isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {plan.name}
                        </h3>
        
                        {/* Description */}
                        <p className={`text-center text-xs mb-4 min-h-[32px] ${
                         isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {plan.description}
                        </p>
        
                        {/* Price */}
                        <div className="text-center mb-5">
                          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {plan.price === 0 ? 'Free' : `${plan.price}`}
                          </span>
                          <div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                             isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {plan.validity}
                            </span>
                          </div>
                        </div>
        
                        {/* Features */}
                        <div className="mb-6">
                          <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wide ${
                           isDark ? 'text-gray-300' : 'text-gray-900'
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
                                 isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
        
                         {/* Button */}
                <button 
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading || processingPlan === plan.id}
                   className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : isDark
                        ? ' mt-auto bg-gray-700 text-white hover:bg-blue-600'
                        : 'bg-gray-100 mt-auto text-gray-900 hover:bg-blue-600 hover:text-white'
                  } ${(loading || processingPlan === plan.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </button>
                      </div>
                    </div>
                  ))}
                </div>

        {/* Benefits Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className={`text-3xl font-bold text-center mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Why Upgrade?
          </h2>
          <p className={`text-center mb-10 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Unlock powerful features to accelerate your career growth
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl shadow-lg text-center transition-all hover:shadow-xl hover:-translate-y-1 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className={`inline-flex p-4 rounded-full mb-4 ${
                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {benefit.icon}
                </div>
                <h4 className={`font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {benefit.title}
                </h4>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className={`text-3xl font-bold text-center mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Frequently Asked Questions
          </h2>

          <p className={`text-center mb-8 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Got questions? We've got answers.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg shadow-md transition-all ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`w-full px-5 py-4 flex justify-between items-center ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-semibold text-sm text-left ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {faq.question}
                  </span>

                  {expandedFaq === index 
                    ? <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>

                {expandedFaq === index && (
                  <div className="px-5 pb-4">
                    <p className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-semibold">
              All plans include secure payment processing and data protection
            </span>
          </div>
        </div>
      </div>
      <Footer/>
    </div>

  );
};

export default MembershipPlans;
