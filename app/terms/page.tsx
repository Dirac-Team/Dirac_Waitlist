"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/mini-navbar";

export default function TermsPage() {
  const [isEmbedded, setIsEmbedded] = useState(false);
  
  useEffect(() => {
    // Check if we're in an iframe (embedded in onboarding)
    setIsEmbedded(window.self !== window.top);
  }, []);
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {!isEmbedded && <Navbar />}
      
      <section className={`${isEmbedded ? 'pt-8' : 'pt-32'} pb-20 px-6 md:px-8 max-w-4xl mx-auto`}>
        <div className="prose dark:prose-invert max-w-none">
          <h1>Terms of Service</h1>
          <p><strong>Last Updated: December 29, 2025</strong></p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By downloading, installing, or using Dirac ("the App"), you agree to be bound by these Terms of Service ("Terms"). 
            If you do not agree to these Terms, do not use the App.
          </p>
          <p>
            Dirac is provided by Dirac AI ("we," "us," or "our"), and these Terms constitute a legal agreement between you and Dirac AI.
          </p>

          <h2>2. Description of Service</h2>
          <p>Dirac is a desktop productivity application that:</p>
          <ul>
            <li>Navigates to user-specified applications and websites</li>
            <li>Captures screenshots of specified content</li>
            <li>Analyzes screenshots using artificial intelligence</li>
            <li>Provides summarized information to help users start their day efficiently</li>
          </ul>

          <h2>3. License and Subscription</h2>
          
          <h3>3.1 License Grant</h3>
          <p>
            Upon payment of the applicable fees and subject to your compliance with these Terms, we grant you a limited, 
            non-exclusive, non-transferable, revocable license to use the App for your personal or internal business purposes.
          </p>

          <h3>3.2 Free Trial</h3>
          <p>
            New users receive a 10-day free trial. No payment is required during the trial period. If you want to keep using Dirac
            after the trial, you can upgrade at any time.
          </p>

          <h3>3.3 Subscription Fees</h3>
          <p>
            After the trial period, continued use of the App requires an active paid subscription. Subscription fees are charged 
            as specified at the time of purchase. All fees are non-refundable except as required by law.
          </p>

          <h3>3.4 License Key</h3>
          <p>Access to the App requires a valid license key. License keys are:</p>
          <ul>
            <li>Non-transferable</li>
            <li>Valid only for the device which made the purchase</li>
            <li>Subject to verification through our servers</li>
            <li>Will be revoked if these Terms are violated</li>
          </ul>

          <h3>3.5 Automatic Renewal</h3>
          <p>Subscriptions automatically renew at the end of each billing period unless cancelled before the renewal date.</p>

          <h2>4. Permitted Use</h2>
          <p>You may use the App for lawful purposes only. You agree NOT to:</p>
          <ul>
            <li>Use the App to access, capture, or analyze content you do not have permission to access</li>
            <li>Circumvent, disable, or interfere with security features or license verification</li>
            <li>Reverse engineer, decompile, or disassemble the App</li>
            <li>Share, resell, or distribute your license key</li>
            <li>Use the App in any way that violates applicable laws or regulations</li>
            <li>Access others' private information without consent</li>
            <li>Use the App to create competing products or services</li>
          </ul>

          <h2>5. User Responsibilities</h2>
          
          <h3>5.1 System Requirements</h3>
          <p>
            You are responsible for ensuring your device meets the App's system requirements and maintaining necessary system permissions.
          </p>

          <h3>5.2 Content Access</h3>
          <p>You are solely responsible for:</p>
          <ul>
            <li>Ensuring you have authorization to access all applications and websites you configure in the App</li>
            <li>Complying with terms of service of third-party applications and websites</li>
            <li>The accuracy of URLs and application paths you provide</li>
            <li>Any consequences of accessing unauthorized content</li>
          </ul>

          <h3>5.3 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your license key and for all activities that occur under your account.
          </p>

          <h2>6. AI Analysis Disclaimer</h2>
          
          <h3>6.1 No Warranty of Accuracy</h3>
          <p>
            Dirac uses artificial intelligence (AI) to analyze screenshots and generate summaries of information from your applications. 
            While we strive for accuracy, <strong>AI-generated content may contain errors, omissions, or inaccuracies</strong>.
          </p>
          
          <h3>6.2 Not a Substitute for Direct Review</h3>
          <p>
            AI summaries are provided for convenience only and should not be relied upon as the sole source of information for critical decisions. 
            You should verify important information by reviewing the original applications directly.
          </p>
          
          <h3>6.3 Limitation of Liability for AI Errors</h3>
          <p>
            We make no warranties regarding the accuracy, completeness, or reliability of AI-generated summaries. 
            <strong>You use AI-generated content at your own risk.</strong> Dirac AI shall not be liable for any decisions made, 
            actions taken, or losses incurred based on AI-generated summaries, including but not limited to:
          </p>
          <ul>
            <li>Missed notifications or alerts</li>
            <li>Misinterpreted data or metrics</li>
            <li>Incomplete information summaries</li>
            <li>Errors in analyzing screenshots</li>
            <li>Failure to capture or summarize important information</li>
          </ul>
          
          <h3>6.4 Third-Party AI Services</h3>
          <p>
            The App relies on third-party AI services for processing. We are not responsible for the accuracy, 
            availability, or performance of these third-party AI services.
          </p>

          <h2>7. Contact Information</h2>
          <p>For questions about these Terms, please contact us at:</p>
          <p><strong>Email:</strong> peter@dirac.app</p>

          <h2>8. Acknowledgment</h2>
          <p>
            BY USING DIRAC, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. 
            You specifically acknowledge and accept that AI-generated summaries may contain errors and should not be solely relied upon for critical decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

