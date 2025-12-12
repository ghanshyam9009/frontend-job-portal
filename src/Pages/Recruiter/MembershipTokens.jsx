import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { Check, Crown, Briefcase, ChevronDown, ChevronUp, ArrowLeft, Loader2, X } from 'lucide-react';

const RecruiterMembership = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  const faqs = [
    {
      question: "Can I cancel my membership?",
      answer: "Yes, you can cancel your membership at any time from your account settings. Your plan will remain active until the end of the billing period."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a free 15-day trial with our Free Posting plan. You can post your first job and receive up to 50 applications at no cost."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI payments, and net banking through our secure Razorpay payment gateway."
    },
    {
      question: "Can I upgrade my plan later?",
      answer: "Yes, you can upgrade your plan at any time. The remaining balance from your current plan will be credited towards your new plan."
    },
    {
      question: "What happens after my job posting expires?",
      answer: "After expiry, your job posting will be archived. You can renew it by purchasing another plan or upgrade to Premium Job for longer duration postings."
    },
    {
      question: "Do I get a refund if I'm not satisfied?",
      answer: "We offer a 7-day money-back guarantee on all paid plans. Contact our support team for assistance with refunds."
    }
  ];

  const handleBuyNow = async (plan) => {
    if (!user) {
      alert('Please login to purchase a plan.');
      navigate('/recruiter/login');
      return;
    }

    // Handle free plan
    if (plan.price === 0) {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
      return;
    }

    // Handle paid plans with Razorpay
    setLoading(true);
    setError(null);

    try {
      const amount = plan.price;

      // Initialize Razorpay checkout
      const options = {
        key: 'rzp_test_RNj6wvo7aRv2Zf', // Replace with your actual Razorpay key
        amount: amount * 100, // Amount in paisa
        currency: 'INR',
        name: 'Bigsources.in',
        description: `${plan.name} - ${plan.duration}`,
        image: '/logo.png', // Add your logo path
        prefill: {
          name: user.company_name || user.name || 'Employer',
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          employer_id: user.employer_id || user.id,
          user_type: 'employer',
          payment_type: 'membership',
          plan_name: plan.name,
          plan_price: amount,
          plan_duration: plan.duration
        },
        theme: {
          color: '#2271B5'
        },
        handler: async function (response) {
          try {
            // Record the payment success
            const paymentResponse = await fetch('https://api.bigsources.in/api/payments/record-job-post-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                employer_id: user.employer_id || user.id,
                payment_id: response.razorpay_payment_id,
                amount: amount,
                currency: 'INR',
                description: `${plan.name} - ${plan.duration}`,
                plan_name: plan.name,
                plan_duration: plan.duration
              })
            });

            if (!paymentResponse.ok) {
              throw new Error('Failed to record payment');
            }

            setSelectedPlan(plan);
            setShowPaymentModal(true);
            setLoading(false);

          } catch (verifyError) {
            console.error('Payment recording failed:', verifyError);
            setError('Payment successful but recording failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    navigate('/recruiter/dashboard');
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 ${textSecondary} hover:${textColor} transition-colors`}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
            RECRUITER MEMBERSHIP PLANS
          </span>

          <h1 className={`text-4xl md:text-5xl font-bold mt-4 leading-tight ${textColor}`}>
            Choose Your Perfect Plan
          </h1>

          <p className={`max-w-2xl mx-auto mt-2 text-base ${textSecondary}`}>
            Select the plan that best fits your recruitment needs and start hiring top talent today
          </p>
        </div>

        {/* User Info */}
        {user && (
          <div className="text-center mb-8">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
            }`}>
              ✓ Logged in as {user.company_name || user.name || 'Recruiter'}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}>
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid gap-6 max-w-5xl mx-auto mb-16 md:grid-cols-3">
          {employerPlans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-2 ${cardBg} ${
                plan.popular ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 text-xs font-bold">
                  ⭐ MOST POPULAR
                </div>
              )}

              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100'
                      : isDark ? 'bg-gray-700' : 'bg-blue-50'
                  }`}>
                    {plan.icon}
                  </div>
                </div>

                <h3 className={`text-xl font-bold text-center mb-2 ${textColor}`}>
                  {plan.name}
                </h3>

                <p className={`text-center text-xs mb-4 min-h-[32px] ${textSecondary}`}>
                  {plan.description}
                </p>

                <div className="text-center mb-5">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                  <div className="mt-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {plan.duration}
                    </span>
                  </div>
                </div>

                <div className="mb-6 flex-grow">
                  <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wide ${textColor}`}>
                    What's Included
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="bg-green-100 rounded-full p-0.5 mr-2 mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className={`text-xs ${textSecondary}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handleBuyNow(plan)}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                      : isDark
                        ? 'bg-gray-700 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Processing...
                    </span>
                  ) : (
                    plan.price === 0 ? 'Start Free' : 'Buy Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className={`${cardBg} rounded-xl shadow-lg p-8 mb-16 border ${borderColor}`}>
          <h2 className={`text-2xl font-bold text-center mb-8 ${textColor}`}>
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-blue-600" size={32} />
              </div>
              <h3 className={`font-bold mb-2 ${textColor}`}>Quality Candidates</h3>
              <p className={`text-sm ${textSecondary}`}>
                Access a pool of verified, skilled candidates actively looking for opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="text-purple-600" size={32} />
              </div>
              <h3 className={`font-bold mb-2 ${textColor}`}>Easy Management</h3>
              <p className={`text-sm ${textSecondary}`}>
                Intuitive dashboard to manage all your job postings and applications in one place
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <h3 className={`font-bold mb-2 ${textColor}`}>Fast Hiring</h3>
              <p className={`text-sm ${textSecondary}`}>
                Reduce time-to-hire with instant notifications and streamlined application process
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-16 border ${borderColor}`}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${textColor}`}>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <span className={`text-sm font-medium ${textColor}`}>Verified Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${textSecondary}`}>Powered by</span>
              <span className={`font-bold ${textColor}`}>Razorpay</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className={`text-3xl font-bold text-center mb-3 ${textColor}`}>
            Frequently Asked Questions
          </h2>

          <p className={`text-center mb-8 text-sm ${textSecondary}`}>
            Got questions? We've got answers.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg shadow-md transition-all ${cardBg} border ${borderColor}`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`w-full px-5 py-4 flex justify-between items-center ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <span className={`font-semibold text-sm text-left ${textColor}`}>
                    {faq.question}
                  </span>

                  {expandedFaq === index 
                    ? <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    : <ChevronDown className={`w-5 h-5 ${textSecondary} flex-shrink-0`} />}
                </button>

                {expandedFaq === index && (
                  <div className="px-5 pb-4">
                    <p className={`text-sm ${textSecondary}`}>
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
          <button 
            onClick={() => navigate('/contact')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Contact Sales Team
          </button>
        </div>

        {/* Trust Badge */}
        <div className="mt-10 text-center">
          <p className={`text-sm ${textSecondary}`}>
            🔒 All plans include secure payment processing and data protection
          </p>
        </div>
      </div>

      {/* Payment Success Modal */}
      {showPaymentModal && selectedPlan && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClosePaymentModal}
        >
          <div 
            className={`${cardBg} rounded-lg shadow-2xl max-w-md w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
              <h2 className={`text-xl font-bold ${textColor}`}>
                {selectedPlan.price === 0 ? 'Plan Activated!' : 'Payment Successful!'}
              </h2>
              <button 
                onClick={handleClosePaymentModal}
                className={`${textSecondary} hover:${textColor} transition-colors`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className={`text-lg font-bold ${textColor} mb-2`}>
                {selectedPlan.name}
              </h3>
              <p className={`${textSecondary} text-sm mb-4`}>
                {selectedPlan.price === 0 
                  ? 'Your free plan has been activated successfully!'
                  : `Your payment of ₹${selectedPlan.price} has been processed successfully.`
                }
              </p>
              <p className={`${textSecondary} text-sm`}>
                You can now start posting jobs and managing applications!
              </p>
            </div>
            
            <div className={`p-4 border-t ${borderColor}`}>
              <button 
                onClick={handleClosePaymentModal}
                className="w-full px-4 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterMembership;