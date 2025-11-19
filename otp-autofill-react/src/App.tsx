import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [otp, setOtp] = useState("");

  // Detect platform on initialization
  const detectPlatform = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const hasWebOTP = "OTPCredential" in window;

    if (isIOS || isSafari) {
      return "iOS/Safari";
    } else if (hasWebOTP) {
      return "Android Chrome/Edge";
    } else {
      return "Desktop/Other";
    }
  };

  const getInitialStatus = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const hasWebOTP = "OTPCredential" in window;

    if (isIOS || isSafari) {
      return "Ready to autofill OTP (iOS autocomplete enabled)";
    } else if (hasWebOTP) {
      return "Ready to receive OTP via SMS (WebOTP API)";
    } else {
      return "Manual OTP entry (autofill not available on this device)";
    }
  };

  const [platform] = useState<string>(detectPlatform());
  const [status, setStatus] = useState(getInitialStatus());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  useEffect(() => {
    const hasWebOTP = "OTPCredential" in window;

    if (hasWebOTP) {
      // WebOTP API for Android
      const ac = new AbortController();

      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: ac.signal,
        } as CredentialRequestOptions)
        .then((otpCredential) => {
          const code = (otpCredential as { code?: string })?.code;
          console.log("OTP received:", code);
          if (code) {
            setOtp(code);
            setStatus("OTP auto-filled successfully!");
          }
          ac.abort();
        })
        .catch((err) => {
          ac.abort();
          console.log("OTP API info:", err.name);

          if (err.name === "NotAllowedError") {
            setStatus("Manual OTP entry required");
          } else if (err.name === "AbortError") {
            setStatus("Ready to receive OTP via SMS");
          } else {
            setStatus("Enter OTP manually");
          }
        });

      return () => {
        ac.abort();
      };
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>OTP AutoFill POC</h1>
      <div className="card">
        <div className="otp-container">
          <label htmlFor="otp-input">
            <strong>Enter OTP Code:</strong>
          </label>
          <input
            id="otp-input"
            type="text"
            value={otp}
            onChange={handleChange}
            placeholder="123456"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            className="otp-input"
          />
          <p className="status-message">{status}</p>
          {platform && (
            <p className="platform-info">
              <small>Detected: {platform}</small>
            </p>
          )}
        </div>
        <div className="info-section">
          <h3>How it works:</h3>
          <ul>
            <li>
              <strong>iOS/Safari:</strong> Uses{" "}
              <code>autocomplete="one-time-code"</code>
              <br />
              <small>iOS will suggest OTP from Messages automatically</small>
            </li>
            <li>
              <strong>Android Chrome/Edge:</strong> Uses <code>WebOTP API</code>
              <br />
              <small>SMS format: @yourdomain.com #123456</small>
            </li>
            <li>
              <strong>Desktop:</strong> Manual entry required
            </li>
          </ul>
        </div>
      </div>
      <p className="read-the-docs">Both platforms require HTTPS for security</p>
    </>
  );
}

export default App;
