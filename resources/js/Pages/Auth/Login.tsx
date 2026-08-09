import React, { useState } from 'react';
import AuthLayout from '../../Layouts/AuthLayout';
import Input from '../../components/Forms/Input';
import Label from '../../components/Forms/Label';
import Checkbox from '../../components/Forms/Checkbox';
import Button from '../../components/UI/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Nanti bisa diintegrasikan dengan Inertia.js (useForm) atau Axios
        console.log({ email, password, rememberMe });
    };

    const togglePasswordVisibility = (
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
            {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            )}
        </button>
    );

    return (
        <AuthLayout title="Masuk ke E-Surat" description="Silakan login menggunakan akun Anda">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="email" value="Email" />
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="nama@email.com"
                    />
                </div>

                <div>
                    <Label htmlFor="password" value="Password" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        rightElement={togglePasswordVisibility}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Checkbox
                            id="remember-me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <Label htmlFor="remember-me" className="ml-2 !mb-0 cursor-pointer">
                            Ingat Saya
                        </Label>
                    </div>
                    
                    <div className="text-sm">
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                            Lupa password?
                        </a>
                    </div>
                </div>

                <Button type="submit">
                    Masuk
                </Button>
            </form>
        </AuthLayout>
    );
}
