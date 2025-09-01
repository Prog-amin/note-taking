import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "@/lib/api";
import { initGoogleOneTap } from "@/lib/google";

export default function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "jonas_kahnwald@gmail.com",
    otp: ""
  });

  const [focusedField, setFocusedField] = useState<string | null>("email");
  const [showOtp, setShowOtp] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initGoogleOneTap(() => navigate("/welcome"));
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async () => {
    setError(null);
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!formData.otp.trim()) {
      setError("Enter the OTP sent to your email, or click Resend OTP.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<{ ok: boolean; accessToken: string }>("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          code: formData.otp,
          flow: "signin",
        }),
      });
      setToken(data.accessToken);
      navigate("/welcome");
    } catch (e: any) {
      setError(e.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Enter a valid email address to receive OTP");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/otp/start", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, flow: "signin" }),
      });
    } catch (e: any) {
      setError(e.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    // Navigate to sign up page
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden">
      {/* Left Column - Form */}
      <div className="flex flex-1 flex-col p-6 sm:p-8 lg:max-w-[591px] lg:p-8">
        {/* Logo */}
        <div className="mb-6 lg:mb-2.5">
          <div className="flex items-center gap-3">
            <svg
              width="79"
              height="32"
              viewBox="0 0 79 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path
                d="M20.1424 0.843087L16.9853 0L14.3248 9.89565L11.9228 0.961791L8.76555 1.80488L11.3608 11.4573L4.8967 5.01518L2.58549 7.31854L9.67576 14.3848L0.845959 12.0269L0 15.1733L9.64767 17.7496C9.53721 17.2748 9.47877 16.7801 9.47877 16.2717C9.47877 12.6737 12.4055 9.75685 16.0159 9.75685C19.6262 9.75685 22.5529 12.6737 22.5529 16.2717C22.5529 16.7768 22.4952 17.2685 22.3861 17.7405L31.1541 20.0818L32 16.9354L22.314 14.3489L31.1444 11.9908L30.2984 8.84437L20.6128 11.4308L27.0768 4.98873L24.7656 2.68538L17.7737 9.65357L20.1424 0.843087Z"
                fill="#367AFF"
              />
              <path
                d="M22.3776 17.7771C22.1069 18.9176 21.5354 19.9421 20.7513 20.763L27.1033 27.0935L29.4145 24.7901L22.3776 17.7771Z"
                fill="#367AFF"
              />
              <path
                d="M20.6871 20.8292C19.8936 21.637 18.8907 22.2398 17.7661 22.5504L20.0775 31.1472L23.2346 30.3041L20.6871 20.8292Z"
                fill="#367AFF"
              />
              <path
                d="M17.6481 22.5819C17.1264 22.7156 16.5795 22.7866 16.0159 22.7866C15.4121 22.7866 14.8273 22.705 14.2723 22.5523L11.9588 31.1569L15.1159 32L17.6481 22.5819Z"
                fill="#367AFF"
              />
              <path
                d="M14.1607 22.5205C13.0533 22.1945 12.0683 21.584 11.2909 20.7739L4.92328 27.1199L7.23448 29.4233L14.1607 22.5205Z"
                fill="#367AFF"
              />
              <path
                d="M11.2378 20.7178C10.4737 19.9026 9.91721 18.8917 9.65231 17.7688L0.855743 20.1179L1.7017 23.2643L11.2378 20.7178Z"
                fill="#367AFF"
              />
              <text
                fill="#232323"
                fontSize="24"
                fontWeight="600"
                letterSpacing="-0.04em"
                fontFamily="Inter"
              >
                <tspan x="44.355" y="24.7273">HD</tspan>
              </text>
            </svg>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-1 flex-col justify-center px-4 sm:px-8 lg:px-16">
          {/* Text Section */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="mb-3 font-inter text-[32px] sm:text-[40px] font-bold leading-[110%] tracking-[-1.28px] sm:tracking-[-1.6px] text-hd-dark">
              Sign in
            </h1>
            <p className="font-inter text-base sm:text-lg font-normal leading-[150%] text-hd-gray text-center sm:text-left">
              Please login to continue to your account.
            </p>
          </div>

          {/* Form */}
          <div className="mb-6 space-y-5 w-full max-w-full sm:max-w-[399px]">
            {/* Email Input - Focused State */}
            <div className="relative">
              <div className="flex w-full items-center gap-1 rounded-[10px] border-[1.5px] border-hd-blue bg-white px-4 py-4 h-[52px]">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full font-inter text-base sm:text-lg font-normal leading-[150%] text-hd-dark outline-none placeholder-transparent"
                  placeholder="jonas_kahnwald@gmail.com"
                />
                {focusedField === "email" && (
                  <span className="font-inter text-base sm:text-lg font-light leading-[150%] text-hd-dark">
                    |
                  </span>
                )}
              </div>
              <div className="absolute left-4 top-[-10.5px] bg-white px-1">
                <span className="font-inter text-sm font-medium leading-[150%] text-hd-blue">
                  Email
                </span>
              </div>
            </div>

            {/* OTP Input */}
            <div className="relative">
              <div className="flex w-full items-center gap-3 rounded-[10px] border border-hd-border bg-white px-4 py-4 h-[52px]">
                <input
                  type={showOtp ? "text" : "password"}
                  value={formData.otp}
                  onChange={(e) => handleInputChange("otp", e.target.value)}
                  onFocus={() => setFocusedField("otp")}
                  onBlur={() => setFocusedField(null)}
                  className="flex-1 font-inter text-base sm:text-lg font-normal leading-[150%] text-hd-dark outline-none placeholder:text-hd-gray-light"
                  placeholder="OTP"
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="flex-shrink-0"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M10.7429 5.59229C11.1494 5.5322 11.5686 5.49997 12.0004 5.49997C17.1054 5.49997 20.4553 10.0048 21.5807 11.7868C21.7169 12.0025 21.785 12.1103 21.8231 12.2766C21.8518 12.4016 21.8517 12.5986 21.8231 12.7235C21.7849 12.8899 21.7164 12.9984 21.5792 13.2155C21.2793 13.6901 20.8222 14.3571 20.2165 15.0804M6.72432 7.21501C4.56225 8.68167 3.09445 10.7193 2.42111 11.7853C2.28428 12.0018 2.21587 12.1101 2.17774 12.2765C2.1491 12.4014 2.14909 12.5984 2.17771 12.7233C2.21583 12.8896 2.28393 12.9975 2.42013 13.2131C3.54554 14.9951 6.89541 19.5 12.0004 19.5C14.0588 19.5 15.8319 18.7676 17.2888 17.7766M3.00042 3.49997L21.0004 21.5M9.8791 10.3786C9.3362 10.9215 9.00042 11.6715 9.00042 12.5C9.00042 14.1568 10.3436 15.5 12.0004 15.5C12.8288 15.5 13.5788 15.1642 14.1217 14.6213"
                      stroke="#9A9A9A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Resend OTP Link */}
            <div className="flex justify-start">
              <button
                onClick={handleResendOtp}
                className="font-inter text-sm sm:text-base font-medium leading-[150%] text-hd-blue underline transition-colors hover:text-blue-600"
              >
                Resend OTP
              </button>
            </div>

            {/* Keep me logged in checkbox */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="sr-only"
                />
                <div
                  onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border-2 border-hd-dark bg-white"
                >
                  {keepLoggedIn && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                        stroke="#232323"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <label
                htmlFor="keepLoggedIn"
                className="cursor-pointer font-inter text-sm sm:text-base font-medium leading-[150%] text-hd-dark"
              >
                Keep me logged in
              </label>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              className="w-full rounded-[10px] bg-hd-blue px-2 py-4 h-[52px] text-center font-inter text-base sm:text-lg font-bold leading-[120%] tracking-[-0.16px] sm:tracking-[-0.18px] text-white transition-all hover:bg-blue-600"
            >
              {loading ? "Please wait..." : "Sign in"}
            </button>
            {error && (
              <div className="text-red-600 text-sm mt-2 text-center">{error}</div>
            )}
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <span className="font-inter text-sm sm:text-lg font-normal leading-[150%] text-hd-text">
              Need an account?{" "}
            </span>
            <button 
              onClick={handleCreateAccount}
              className="font-inter text-sm sm:text-lg font-bold leading-[150%] text-hd-blue underline transition-colors hover:text-blue-600"
            >
              Create one
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Background Image */}
      <div className="hidden w-[849px] flex-shrink-0 p-3 xl:block">
        <div
          className="h-full w-full rounded-3xl bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://api.builder.io/api/v1/image/assets/TEMP/a71c1fc4b0a832d077836e88f6588d9b854f8c93?width=1650')`
          }}
        />
      </div>
    </div>
  );
}
