"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 opacity-90" />
      
      {/* Floating orbs - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-10 left-10 w-64 h-64 md:w-72 md:h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" />
      <div className="hidden md:block absolute bottom-10 right-10 w-72 h-72 md:w-96 md:h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 md:w-80 md:h-80 bg-blue-500/20 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10 md:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg px-4 sm:px-6 py-6 md:py-8">
        <div className="glass rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Image
                src="/logo.png"
                alt="WayNueng Media"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-1 md:mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-purple-200 text-sm md:text-base mb-6 md:mb-8">
            Sign in to your invoicing dashboard
          </p>

          {error && (
            <div className="mb-4 md:mb-6 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-xs md:text-sm font-medium text-purple-200 mb-1.5 md:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-purple-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm md:text-base placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-purple-200 mb-1.5 md:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-purple-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm md:text-base placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 md:py-3 mt-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 text-white text-sm md:text-base font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 md:mt-6 text-center">
            <p className="text-purple-200 text-sm">
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup" 
                className="text-pink-300 hover:text-pink-200 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-purple-300/60 text-xs mt-4 md:mt-6">
          WayNueng Small Business Media
        </p>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}