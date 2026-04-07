import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const registerEndpoint = useMemo(
    () => `${apiBaseUrl}/api/auth/register`,
    [apiBaseUrl],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(registerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed. Please try again.");
      }

      setSuccessMessage(result.message || "Registration successful");
    } catch (error) {
      setErrorMessage(error.message || "Unable to register right now.");
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
                onClick={() => navigate('/login')}
                className="flex-1 rounded-lg px-4 py-3 text-lg font-bold text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high"
              >
                Sign In
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-surface-container-lowest px-4 py-3 text-lg font-bold text-primary shadow-sm transition-all duration-200"
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block px-1 text-sm font-semibold text-on-surface-variant"
                  >
                    Username
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span
                        className="material-symbols-outlined text-outline"
                        data-icon="person"
                      >
                        person
                      </span>
                    </div>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      placeholder="Username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="h-16 w-full rounded-lg border-none bg-surface-container-highest pl-12 pr-4 text-lg transition-all focus:ring-[3px] focus:ring-primary-fixed"
                    />
                  </div>
                </div>

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

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block px-1 text-sm font-semibold text-on-surface-variant"
                  >
                    Confirm Password
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
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="h-16 w-full rounded-lg border-none bg-surface-container-highest pl-12 pr-12 text-lg transition-all focus:ring-[3px] focus:ring-primary-fixed"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prevState) => !prevState)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline hover:text-primary"
                    >
                      <span
                        className="material-symbols-outlined"
                        data-icon={showConfirmPassword ? "visibility_off" : "visibility"}
                      >
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
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
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
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
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU0jNk9LbUcQCljl1pU1tiHJIw9X5BmLnYV0n7cB8p5drH_au3lfVkqqfXw_2LWF1XSlomCL7LXnDMUmZ5mVDGUXieIk8nLkiqUqz5rLTMirBTXCWgclQeVsYk4mLYlMq5gjlqSFp0xlMwHfbnoynktTwvTk8NN3F9Rb28Zxtg5BRkSbTUUo43ta8kW9tSSBLn2H-T8IyxMJlcFwshG7SphOxiZUGKkRrUWX3jmCa03zaWczMaJo0hB8wnQbGO-0pbC9bBcluJfAI"
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
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAE49k0Qevpyfh1E7EcoPhZBa1lpdy7W0kQ7InmFHUiJVuHNmWu7JLgBW0G6eRsqQYsEgrx1lyBuvlELXWOje15-vOM8FuC1gWiWNRIXnljBXcwfFGlhSyVvvnBmGOTlEn96P0O1M5qt89fCoisLMRfZ-DIAn1s6mErQ2JIUed9OpqjLFNSwf-06Ve2icXac7k7lW2y7UdAPyge7MChXtlUfo4rvls5cTGv6qQw5aZbAp1lXvSWwh9Laeq1_9P8UpIkdIemTOv8Rw"
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
          © 2024 Fraud Scanner AI. All rights reserved. Secure protection for
          the digital age.
        </p>
      </footer>
    </>
  );
}

export default Register;
