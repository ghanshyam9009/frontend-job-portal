import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { Briefcase, Lightbulb, DollarSign, Rocket, Lock, Check, Loader2 } from "lucide-react";
import styles from "../../Styles/RecruiterDashboard.module.css";

const MembershipTokens = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handlePayForJobPost = async () => {
    if (!user) {
      alert('Please login to make a payment.');
      navigate('/recruiter/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amount = 300; // ₹300 for job post

      // Initialize Razorpay checkout directly
      const options = {
        key: 'rzp_test_RNj6wvo7aRv2Zf', // Test Key ID - replace with your actual key
        amount: amount * 100, // Amount in paisa
        currency: 'INR',
        name: 'Job Portal',
        description: 'Job Post Payment - ₹300',
        prefill: {
          name: `${user.firstName || user.name || 'Employer'} ${user.lastName || ''}`,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          employer_id: user.employer_id || user.id,
          user_type: 'employer',
          payment_type: 'job_post',
          description: 'Job Post Payment'
        },
        theme: {
          color: '#3399cc'
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
                description: 'Job Post Payment'
              })
            });

            if (!paymentResponse.ok) {
              throw new Error('Failed to record payment');
            }

            setSuccess(true);
            setShowPaymentModal(true);

          } catch (verifyError) {
            console.error('Payment recording failed:', verifyError);
            alert('Payment successful but recording failed. Please contact support.');
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
        setError('Payment failed. Please try again.');
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
    setSuccess(false);
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <RecruiterSidebar darkMode={theme === 'dark'} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.membershipSection}>
          <div className={styles.sectionHeader}>
            <h1>Employer Plan</h1>
            <p>Simple per-post payment model for flexible recruitment needs</p>
          </div>

          <div className={styles.paymentPlanCard}>
            <div className={styles.planHeader}>
              <div className={styles.planIcon}>
                <div className={styles.jobIcon}><Briefcase size={24} /></div>
              </div>
              <div className={styles.planInfo}>
                <h2>Per Job Post Payment</h2>
                <p className={styles.planDescription}>
                  Pay only for what you use. No monthly commitments, no hidden fees.
                </p>
              </div>
            </div>

            <div className={styles.planDetails}>
              <div className={styles.priceSection}>
                <div className={styles.price}>
                  <span className={styles.currency}>₹</span>
                  <span className={styles.amount}>300</span>
                </div>
                <div className={styles.priceDetails}>
                  <p className={styles.priceLabel}>Per Job Post</p>
                  <p className={styles.validity}>Validity: Per Job Post</p>
                </div>
              </div>

              <div className={styles.featuresList}>
                <h3>What's Included:</h3>
                <ul className={styles.features}>
                  <li><Check size={16} /> Job posting for 30 days</li>
                  <li><Check size={16} /> View all applications</li>
                  <li><Check size={16} /> Candidate management tools</li>
                  <li><Check size={16} /> Resume download access</li>
                  <li><Check size={16} /> Application status updates</li>
                  <li><Check size={16} /> Email notifications</li>
                  <li><Check size={16} /> 24/7 support</li>
                </ul>
              </div>

              <div className={styles.paymentSection}>
                <button
                  className={styles.payButton}
                  onClick={handlePayForJobPost}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} />
                      Processing...
                    </>
                  ) : (
                    "Pay ₹300 for Job Post"
                  )}
                </button>
                <p className={styles.paymentNote}>
                  Secure payment processing. Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.benefitsSection}>
            <h2>Why Choose Our Per-Post Model?</h2>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><Lightbulb size={24} /></div>
                <h3>Pay As You Go</h3>
                <p>No monthly subscriptions. Pay only when you post a job.</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><DollarSign size={24} /></div>
                <h3>Cost Effective</h3>
                <p>Perfect for small businesses and occasional hiring needs.</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><Rocket size={24} /></div>
                <h3>Instant Access</h3>
                <p>Start posting jobs immediately after payment confirmation.</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><Lock size={24} /></div>
                <h3>Secure Payments</h3>
                <p>All payments are processed securely with industry-standard encryption.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
            </div>
          )}
        </section>
      </main>

      {/* Payment Success Modal */}
      {showPaymentModal && (
        <div className={styles.modalOverlay} onClick={handleClosePaymentModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Payment Successful!</h2>
              <button 
                className={styles.closeButton}
                onClick={handleClosePaymentModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.successIcon}><Check size={24} /></div>
              <p className={styles.successMessage}>
                Your payment of ₹300 has been processed successfully. You can now post your job!
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.okButton}
                onClick={handleClosePaymentModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipTokens;
