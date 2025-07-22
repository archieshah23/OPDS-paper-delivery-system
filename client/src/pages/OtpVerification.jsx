import { useEffect, useRef } from "react";

// OtpVerification.jsx
export const OtpVerification = ({ otpValue, setOtpValue }) => {
  const refArr = useRef([]);

  useEffect(() => {
    refArr.current[0]?.focus();
  }, []);

  const handleOnchange = (value, index) => {
    if (isNaN(value)) return;

    const newValue = value.trim();
    const updatedOtp = [...otpValue];
    updatedOtp[index] = newValue.slice(-1); // Always take latest input
    setOtpValue(updatedOtp);

    if (newValue) {
      refArr.current[index + 1]?.focus();
    }
  };

  const handleOnkey = (e, index) => {
    if (!e.target.value && e.key === "Backspace") {
      refArr.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      {otpValue.map((digit, index) => (
        <input
          key={index}
          className="otp-input"
          style={{
            margin: "5px",
            width: "30px",
            height: "30px",
            fontSize: "20px",
          }}
          type="text"
          value={digit}
          ref={(input) => (refArr.current[index] = input)}
          onChange={(e) => handleOnchange(e.target.value, index)}
          onKeyDown={(e) => handleOnkey(e, index)}
        />
      ))}
    </div>
  );
};
