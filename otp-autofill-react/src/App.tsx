import { useState, useEffect } from "react";

import "./App.css";

function App() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(
    "OTPCredential" in globalThis
      ? "Ready to receive OTP via SMS"
      : "WebOTP API not supported - please enter OTP manually"
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  useEffect(() => {
    if ("OTPCredential" in globalThis) {
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

          // Don't show error for expected cases
          if (err.name === "NotAllowedError") {
            setStatus(
              "Manual OTP entry required (API not available on this device)"
            );
          } else if (err.name === "AbortError") {
            setStatus("Ready to receive OTP via SMS");
          } else {
            setStatus("Enter OTP manually");
          }
        });

      // Cleanup on unmount
      return () => {
        ac.abort();
      };
    }
  }, []);

  return (
    <>
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
        </div>
        <p>
          This demo uses the <code>WebOTP API</code> to automatically fill OTP
          codes from SMS
        </p>
      </div>
      <p className="read-the-docs">
        Note: WebOTP API requires HTTPS and works on Android Chrome/Edge
      </p>
    </>
  );
}

export default App;
