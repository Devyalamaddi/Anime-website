'use client'
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import { FaGoogle, FaGithub, FaApple } from 'react-icons/fa';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

const LoginForm = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [err, setErr] = useState('');

  const onLoginFormSubmit: SubmitHandler<LoginFormData> = async (data) => {
    console.log("Form Data:", data);
    try {
      const res = await axios.post('/api/users/login', data);
      console.log("login success", res.data);
      toast.success("Login successful");
      localStorage.setItem('loginstatus', 'true');
      router.push('/dashboard'); // Redirect to dashboard or any other page after successful login
    } catch (error: any) {
      console.log("Login failed", error.message);
      toast.error("Login failed");
      setErr(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-2xl relative">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 opacity-40 -skew-x-12 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-indigo-800 opacity-40 -skew-y-12 rounded-2xl"></div>
        <div className="p-10 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl relative z-10">
          <h1 className="text-center font-bold text-black text-3xl mb-10">Login</h1>

          {err && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{err}</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit(onLoginFormSubmit)}>
            {/* Email input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-6 w-6 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="pl-12 w-full p-4 border border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-black"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="pl-12 w-full p-4 border border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-black"
                {...register("password", {
                  required: "Password is required"
                })}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-800 rounded"
                  {...register("rememberMe")}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <Link
                href="/help"
                className="text-sm font-semibold text-black hover:text-gray-700 transition duration-200 ease-in-out underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full py-4 px-4 text-white bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transform transition-all duration-200 ease-in-out hover:scale-[1.02] font-medium"
            >
              Sign in
            </button>
          </form>

          {/* Separator */}
          <div className="flex my-4 items-center">
            <div className="flex-1 h-px bg-gray-400 mx-5"></div>
            <span className="text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-400 mx-5"></div>
          </div>

          {/* Social login buttons */}
          <div className="flex justify-center space-x-4">
            <button className="text-black px-10 hover:text-gray-700 transition-colors duration-200">
              <FaGoogle size={36} />
            </button>
            <button className="text-black px-10 hover:text-gray-700 transition-colors duration-200">
              <FaGithub size={36} />
            </button>
            <button className="text-black px-10 hover:text-gray-700 transition-colors duration-200">
              <FaApple size={36} />
            </button>
          </div>

          {/* Sign up link */}
          <hr className="my-5" />
          <p className="text-gray-600 text-center">
            New User?{' '}
            <Link
              href="/signup"
              className="font-semibold text-black hover:text-gray-700 transition duration-200 ease-in-out underline-offset-2 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default LoginForm;
