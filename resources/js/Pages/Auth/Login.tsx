import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import GridShape from '../../components/common/GridShape';
import ThemeTogglerTwo from '../../components/common/ThemeTogglerTwo';
import { EyeCloseIcon, EyeIcon } from '../../icons';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login.post'));
    };

    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">

                {/* Left Side: Login Form */}
                <div className="flex flex-col flex-1">
                    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div className="mb-5 sm:mb-8">
                                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                    Sign In
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter your email and password to sign in!
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    {/* Email Field */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="info@gmail.com"
                                            required
                                            className="w-full h-11 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent border border-gray-300 rounded-lg outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 dark:placeholder-gray-500 dark:focus:border-brand-500"
                                        />
                                        {errors.email && (
                                            <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter your password"
                                                required
                                                className="w-full h-11 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent border border-gray-300 rounded-lg outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 dark:placeholder-gray-500 dark:focus:border-brand-500"
                                            />
                                            <span
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                            >
                                                {showPassword ? (
                                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                ) : (
                                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                )}
                                            </span>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="block text-sm font-normal text-gray-700 dark:text-gray-400 cursor-pointer"
                                            >
                                                Keep me logged in
                                            </label>
                                        </div>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    {/* Submit Button */}
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center justify-center w-full h-11 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50"
                                        >
                                            {processing ? 'Memproses...' : 'Sign in'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Contact Admin Redirect to WhatsApp */}
                            <div className="mt-5 text-center sm:text-start">
                                <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                                    Belum memiliki akun?{' '}
                                    <a
                                        href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20membuat%20akun%20E-Surat"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium transition-colors"
                                    >
                                        Hubungi Admin
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Split Screen Sidebar */}
                <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
                    <div className="relative flex items-center justify-center z-1">
                        <GridShape />
                        <div className="flex flex-col items-center max-w-xs">
                            <Link href="/" className="block mb-4">
                                <img
                                    className="h-24 w-auto mx-auto"
                                    src="/images/logo/logo-mais-paiton.png"
                                    alt="Logo"
                                />
                            </Link>
                            <p className="text-center text-gray-400 dark:text-white/60">
                                Aplikasi Manajemen Surat Digital<br />
                                Pondok Pesantren Islamiyah Syafiiyah Paiton
                            </p>
                        </div>
                    </div>
                </div>

                {/* Theme Toggler */}
                <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
                    <ThemeTogglerTwo />
                </div>
            </div>
        </div>
    );
}
