'use client'
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { User, Mail, Lock } from 'lucide-react';
import { FaGoogle, FaGithub, FaApple } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

type SignUpFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function SignupForm() {
  const router = useRouter();
  const { register, handleSubmit, watch } = useForm<SignUpFormData>();
  const [err, setErr] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const onSignUpFormSubmit = async (data: SignUpFormData) => {
    console.log("Form Data:", data);
    try {
      const response = await axios.post('/api/users/signup', data)
      console.log('Signup successful:', response.data)
      toast.success("Signup successful!")
      router.push("/login")
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.response?.data?.message || "Signup failed")
    }
    setErr('');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black"
      onMouseMove={handleMouseMove}
    >
      <div className="w-full max-w-2xl relative">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent)`,
            animation: 'pulse 5s ease-in-out infinite',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-800 opacity-40 -skew-x-12 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-indigo-800 opacity-40 -skew-y-12 rounded-2xl"></div>
        <div className="p-10 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl relative z-10">
          <h1 className="text-center font-bold text-black text-3xl mb-10">Register</h1>

          {err && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{err}</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit(onSignUpFormSubmit)}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="Username"
                className="pl-12 w-full p-4 border border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-black"
                {...register("username", { required: "Username is required" })}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-6 w-6 text-gray-400" />
              </div>
              <input
                id="email-address"
                type="email"
                placeholder="Email address"
                className="pl-12 w-full p-4 border border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-black"
                {...register("email", { required: "Email is required" })}
              />
            </div>

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
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
                className="pl-12 w-full p-4 border border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-black"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) => value === watch('password', '') || "Passwords do not match"
                })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 text-white bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transform transition-all duration-200 ease-in-out hover:scale-[1.02] font-medium"
            >
              Create Account
            </button>
          </form>
          <div className='flex my-4 items-center'>
            <div className="flex-1 h-px bg-gray-400 mx-5"></div>
            <span className='text-gray-500'>OR</span>
            <div className="flex-1 h-px bg-gray-400 mx-5"></div>
          </div>
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
          <hr className='my-5'></hr>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-black hover:text-gray-700 transition duration-200 ease-in-out underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default SignupForm;
