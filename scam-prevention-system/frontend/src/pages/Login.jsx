import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const loginEndpoint = useMemo(
    () => `${apiBaseUrl}/api/auth/login`,
    [apiBaseUrl],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed. Please try again.");
      }

      if (rememberMe) {
        localStorage.setItem("authUser", JSON.stringify(result.user || {}));
        sessionStorage.removeItem("authUser");
      } else {
        sessionStorage.setItem("authUser", JSON.stringify(result.user || {}));
        localStorage.removeItem("authUser");
      }

      setSuccessMessage(result.message || "Login successful");
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "Unable to login right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGoogleLogin = () => {
    window.location.href = `${apiBaseUrl}/api/auth/google/login`;
  };

  const startFacebookLogin = () => {
    window.location.href = `${apiBaseUrl}/api/auth/facebook/login`;
  };

  return (
    <>
      <main className="relative flex min-h-screen flex-grow items-center justify-center overflow-hidden bg-surface px-4 py-12 text-on-surface selection:bg-primary-fixed">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-fixed/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary-container/20 blur-3xl"></div>
        </div>

        <div className="z-10 w-full max-w-lg">
          <div className="mb-8 flex flex-col items-center">
            <div className="signature-gradient mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl">
              <span
                className="material-symbols-outlined text-4xl text-white"
                data-icon="shield_lock"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                shield_lock
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-primary">
              Fraud Scanner AI
            </h1>
            <p className="mt-1 font-body text-lg text-on-surface-variant">
              Your secure digital concierge.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_40px_80px_-15px_rgba(0,40,142,0.06)]">
            <div className="m-4 flex rounded-xl bg-surface-container-low p-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-surface-container-lowest px-4 py-3 text-lg font-bold text-primary shadow-sm transition-all duration-200"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex-1 rounded-lg px-4 py-3 text-lg font-bold text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high"
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block px-1 text-sm font-semibold text-on-surface-variant"
                  >
                    Email Address
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span
                        className="material-symbols-outlined text-outline"
                        data-icon="mail"
                      >
                        mail
                      </span>
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-16 w-full rounded-lg border-none bg-surface-container-highest pl-12 pr-4 text-lg transition-all focus:ring-[3px] focus:ring-primary-fixed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block px-1 text-sm font-semibold text-on-surface-variant"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span
                        className="material-symbols-outlined text-outline"
                        data-icon="lock"
                      >
                        lock
                      </span>
                    </div>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-16 w-full rounded-lg border-none bg-surface-container-highest pl-12 pr-12 text-lg transition-all focus:ring-[3px] focus:ring-primary-fixed"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prevState) => !prevState)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline hover:text-primary"
                    >
                      <span
                        className="material-symbols-outlined"
                        data-icon={showPassword ? "visibility_off" : "visibility"}
                      >
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="group flex cursor-pointer items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-6 w-6 rounded border-outline-variant text-primary focus:ring-primary-fixed"
                    />
                    <span className="text-lg text-on-surface-variant transition-colors group-hover:text-on-surface">
                      Remember me
                    </span>
                  </label>

                  <a
                    href="#"
                    className="text-lg font-semibold text-primary decoration-2 underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                {errorMessage && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
                    {errorMessage}
                  </p>
                )}

                {successMessage && (
                  <p className="rounded-lg bg-green-50 px-4 py-3 text-base font-semibold text-green-700">
                    {successMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="signature-gradient flex h-16 w-full items-center justify-center gap-3 rounded-xl text-xl font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                  <span
                    className="material-symbols-outlined"
                    data-icon="arrow_forward"
                  >
                    arrow_forward
                  </span>
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-container-highest"></div>
                </div>

                <div className="relative flex justify-center text-lg">
                  <span className="bg-surface-container-lowest px-4 text-on-surface-variant">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={startGoogleLogin}
                  className="flex h-16 items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container text-lg font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png"
                    alt="Google"
                    className="h-6 w-6"
                  />
                  Google
                </button>

                <button
                  type="button"
                  onClick={startFacebookLogin}
                  className="flex h-16 items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container text-lg font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png"
                    alt="Facebook"
                    className="h-6 w-6"
                  />
                  Facebook
                </button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center font-body text-lg text-on-surface-variant">
            Need help with your account?{" "}
            <a href="#" className="font-semibold text-primary hover:underline">
              Contact our digital desk
            </a>
          </p>
        </div>
      </main>

      <footer className="mt-auto flex w-full flex-col items-center justify-center space-y-6 bg-slate-50 px-6 py-12 text-center dark:bg-slate-950">
        <div className="flex flex-wrap justify-center gap-8">
          <a
            href="#"
            className="font-lexend text-lg text-slate-500 opacity-100 transition-opacity hover:text-blue-900 hover:opacity-80 dark:text-slate-400 dark:hover:text-blue-200"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-lexend text-lg text-slate-500 opacity-100 transition-opacity hover:text-blue-900 hover:opacity-80 dark:text-slate-400 dark:hover:text-blue-200"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="font-lexend text-lg text-slate-500 opacity-100 transition-opacity hover:text-blue-900 hover:opacity-80 dark:text-slate-400 dark:hover:text-blue-200"
          >
            Accessibility Statement
          </a>
          <a
            href="#"
            className="font-lexend text-lg text-slate-500 opacity-100 transition-opacity hover:text-blue-900 hover:opacity-80 dark:text-slate-400 dark:hover:text-blue-200"
          >
            Help Center
          </a>
        </div>

        <p className="max-w-2xl font-lexend text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          © 2026 Fraud Scanner AI. All rights reserved. Secure protection for
          the digital age.
        </p>
      </footer>
    </>
  );
}

export default Login;