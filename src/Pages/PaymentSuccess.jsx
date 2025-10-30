import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useTheme } from "../Contexts/ThemeContext";
import { paymentService } from "../services/paymentService";
import HomeNav from "../Components/HomeNav";
import styles from "./PaymentSuccess.module.css";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [paymentStatus, setPaymentStatus] = useState('loading'); // 'loading', 'success', 'failed'
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment parameters from URL
        const paymentId = searchParams.get('razorpay_payment_id');
        const orderId = searchParams.get('razorpay_order_id');
        const signature = searchParams.get('razorpay_signature');

        if (!paymentId || !orderId || !signature) {
          setPaymentStatus('failed');
          setError('Payment parameters missing');
          return;
        }

        // If we have signature, it means payment was successful
        // The actual verification happens in the handler callback
        // But we can show success page here

        setPaymentStatus('success');
        setPaymentDetails({
          paymentId,
          orderId,
          signature
        });

        // Auto redirect after 5 seconds
        setTimeout(() => {
          if (user) {
            navigate('/candidate/dashboard'); // or recruiter dashboard based on user type
          } else {
            navigate('/');
          }
        }, 5000);

      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('failed');
        setError('Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, navigate, user]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoDashboard = () => {
    if (user) {
      // Determine dashboard based on user role
      if (user.role === 'candidate' || user.role === 'student') {
        navigate('/candidate/dashboard');
      } else if (user.role === 'recruiter' || user.role === 'employer') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />

      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          {paymentStatus === 'loading' && (
            <div className={styles.statusSection}>
              <Loader2 size={64} className={styles.loadingIcon} />
              <h2>Verifying Payment...</h2>
              <p>Please wait while we confirm your payment.</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className={styles.statusSection}>
              <CheckCircle size={64} className={styles.successIcon} />
              <h2>Payment Successful!</h2>
              <p>Thank you for your payment. Your membership has been upgraded successfully.</p>

              {paymentDetails && (
                <div className={styles.paymentDetails}>
                  <p><strong>Payment ID:</strong> {paymentDetails.paymentId}</p>
                  <p><strong>Order ID:</strong> {paymentDetails.orderId}</p>
                </div>
              )}

              <div className={styles.actionButtons}>
                <button onClick={handleGoDashboard} className={styles.primaryButton}>
                  Go to Dashboard
                </button>
                <button onClick={handleGoHome} className={styles.secondaryButton}>
                  Back to Home
                </button>
              </div>

              <p className={styles.redirectText}>
                You will be automatically redirected in 5 seconds...
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className={styles.statusSection}>
              <XCircle size={64} className={styles.errorIcon} />
              <h2>Payment Failed</h2>
              <p>Unfortunately, your payment could not be processed.</p>

              {error && (
                <div className={styles.errorDetails}>
                  <p><strong>Error:</strong> {error}</p>
                </div>
              )}

              <div className={styles.actionButtons}>
                <button onClick={() => navigate(-1)} className={styles.primaryButton}>
                  Try Again
                </button>
                <button onClick={handleGoHome} className={styles.secondaryButton}>
                  Go Home
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.helpSection}>
          <h3>Need Help?</h3>
          <p>If you have any questions about your payment or membership, please contact our support team.</p>
          <p>Email: support@bigsources.in</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
