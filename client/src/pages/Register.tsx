import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    SunIcon, 
    MoonIcon, 
    CheckCircleIcon,
    FireIcon,
    TrophyIcon,
    StarIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckIcon,
    XMarkIcon,
    SparklesIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [formProgress, setFormProgress] = useState(0);
    const { register, error, clearError } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Password strength validation
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        const checks = [
            password.length >= 8,
            /[A-Z]/.test(password),
            /[a-z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password)
        ];
        strength = checks.filter(Boolean).length;
        return { strength, checks };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    // Calculate form completion progress
    useEffect(() => {
        const fields = Object.values(formData);
        const completed = fields.filter(field => field.trim() !== '').length;
        setFormProgress((completed / fields.length) * 100);
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        // Only show real-time validation for basic issues, let server handle detailed validation
        const fieldErrors: Record<string, string> = {};
        
        // Only validate basic requirements while typing
        if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            fieldErrors.email = 'Please enter a valid email address';
        }
        
        if (name === 'username' && value && value.length > 0 && value.length < 3) {
            fieldErrors.username = 'Username must be at least 3 characters';
        }
        
        if (name === 'password' && value && value.length > 0 && value.length < 8) {
            fieldErrors.password = 'Password must be at least 8 characters';
        }
        
        if (name === 'confirmPassword' && value && formData.password && value !== formData.password) {
            fieldErrors.confirmPassword = 'Passwords do not match';
        }

        // Clear the field error if validation passes or field is empty
        setValidationErrors(prev => ({
            ...prev,
            [name]: fieldErrors[name] || ''
        }));

        // Re-validate confirm password when password changes
        if (name === 'password' && formData.confirmPassword) {
            if (formData.confirmPassword !== value) {
                setValidationErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Passwords do not match'
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Clear previous validation errors when submitting
        setValidationErrors({});

        // Only do basic client-side validation for completely empty fields
        const basicErrors: Record<string, string> = {};
        
        // Only block submission for completely empty required fields
        if (!formData.email.trim()) {
            basicErrors.email = 'Email is required';
        }
        if (!formData.username.trim()) {
            basicErrors.username = 'Username is required';
        }
        if (!formData.password.trim()) {
            basicErrors.password = 'Password is required';
        }
        if (!formData.confirmPassword.trim()) {
            basicErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            basicErrors.confirmPassword = 'Passwords do not match';
        }

        // Only stop submission if basic required fields are missing
        if (Object.keys(basicErrors).length > 0) {
            setValidationErrors(basicErrors);
            setIsLoading(false);
            return;
        }

        try {
            // Let the server handle detailed validation and show server errors
            await register(formData.email, formData.username, formData.password);
            navigate('/');
        } catch (err) {
            // Server errors will be displayed via the error state from AuthContext
            console.error('Registration failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: RocketLaunchIcon,
            title: "Smart Tracking",
            description: "AI-powered insights for lasting habits"
        },
        {
            icon: FireIcon,
            title: "Streak Power",
            description: "Beautiful visualizations keep you motivated"
        },
        {
            icon: TrophyIcon,
            title: "Level Up",
            description: "Unlock achievements as you progress"
        },
        {
            icon: SparklesIcon,
            title: "Deep Analytics",
            description: "Understand your habit patterns"
        }
    ];

    const getStrengthColor = (strength: number) => {
        if (strength <= 1) return 'bg-red-500';
        if (strength <= 2) return 'bg-orange-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = (strength: number) => {
        if (strength <= 1) return 'Very Weak';
        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Fair';
        if (strength <= 4) return 'Good';
        return 'Strong';
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950 transition-all duration-500 overflow-hidden">
            {/* Seamless Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/30 dark:bg-purple-800/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 dark:bg-blue-800/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-110"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? (
                    <MoonIcon className="w-4 h-4" />
                ) : (
                    <SunIcon className="w-4 h-4" />
                )}
            </button>

            <div className="flex h-screen relative z-10">
                {/* Left Side - Brand Story */}
                <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
                    {/* Dynamic Background based on theme */}
                    <div className={`absolute inset-0 ${theme === 'light' 
                        ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700' 
                        : 'bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900'
                    } transition-all duration-500`}>
                        {/* Animated Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full" 
                                 style={{
                                     backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)`,
                                     backgroundSize: '50px 50px'
                                 }}>
                            </div>
                        </div>
                        
                        {/* Floating Elements */}
                        <div className="absolute top-16 left-16 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-12 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
                        <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-white/10 rounded-full blur-lg animate-pulse animation-delay-3000"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-center px-12 py-8 text-white w-full">
                        {/* Hero Section */}
                        <div className="mb-8 animate-fade-in-up text-center w-full flex flex-col items-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 animate-bounce-subtle">
                                    <CheckCircleIcon className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">
                                    StrideStreak
                                </h1>
                            </div>
                            
                            <div className="w-full">
                                <h2 className="text-2xl font-bold mb-3 leading-tight">
                                    Transform Your Life
                                    <br />
                                    <span className={theme === 'light' ? 'text-white/85' : 'text-gray-200'}>
                                        One Habit at a Time
                                    </span>
                                </h2>
                                
                                <p className={`text-base leading-relaxed ${theme === 'light' ? 'text-white/90' : 'text-gray-300'}`}>
                                    Join thousands building better habits and achieving their dreams.
                                </p>
                            </div>
                        </div>

                        {/* Features with Icons */}
                        <div className="space-y-4 mb-8 w-full">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                const colors = [
                                    'from-orange-400 to-red-500', // Rocket - Orange to Red
                                    'from-yellow-400 to-orange-500', // Fire - Yellow to Orange  
                                    'from-purple-400 to-pink-500', // Trophy - Purple to Pink
                                    'from-blue-400 to-cyan-500', // Analytics - Blue to Cyan
                                ];
                                return (
                                    <div 
                                        key={index} 
                                        className="flex items-center space-x-3 animate-fade-in-left group hover:transform hover:translate-x-2 transition-all duration-300"
                                        style={{ animationDelay: `${index * 150}ms` }}
                                    >
                                        <div className={`flex-shrink-0 w-9 h-9 bg-gradient-to-br ${colors[index]} rounded-lg flex items-center justify-center group-hover:scale-125 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                                            <Icon className="w-4 h-4 text-white drop-shadow-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm mb-0.5">{feature.title}</h3>
                                            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-white/80' : 'text-gray-300'}`}>{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Face Image with Heart */}
                        <div className="flex justify-center mb-6 animate-fade-in-up animation-delay-800 w-full">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                                    <div className="text-2xl">👤</div>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="text-white text-xs">❤️</div>
                                </div>
                            </div>
                        </div>

                        {/* Social Proof */}
                        <div className="grid grid-cols-3 gap-4 animate-fade-in-up animation-delay-1000 w-full justify-items-center">
                            <div className="text-center group">
                                <div className="text-xl font-bold mb-0.5 group-hover:scale-110 transition-transform duration-300">50K+</div>
                                <div className={`text-xs ${theme === 'light' ? 'text-white/75' : 'text-gray-400'}`}>Happy Users</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-xl font-bold mb-0.5 group-hover:scale-110 transition-transform duration-300">5M+</div>
                                <div className={`text-xs ${theme === 'light' ? 'text-white/75' : 'text-gray-400'}`}>Habits Built</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-xl font-bold mb-0.5 group-hover:scale-110 transition-transform duration-300">98%</div>
                                <div className={`text-xs ${theme === 'light' ? 'text-white/75' : 'text-gray-400'}`}>Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className="w-full lg:w-3/5 flex items-center justify-center p-4 lg:p-6 relative">
                    {/* Subtle separator line */}
                    <div className="hidden lg:block absolute left-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-30"></div>
                    
                    <div className="max-w-md w-full space-y-6 animate-fade-in-up">
                        {/* Mobile Logo */}
                        <div className="text-center lg:hidden">
                            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-3 animate-bounce-subtle">
                                <CheckCircleIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">StrideStreak</h1>
                        </div>

                        {/* Form Header */}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Create Account
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    onClick={clearError}
                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${formProgress}%` }}
                            ></div>
                        </div>

                        {/* Registration Form */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl py-6 px-6 shadow-2xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-700 animate-shake">
                                        <div className="flex items-center">
                                            <XMarkIcon className="h-4 w-4 text-red-400 mr-2" />
                                            <div className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Email Field */}
                                    <div className="relative">
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <EnvelopeIcon className={`h-4 w-4 transition-colors duration-200 ${
                                                    focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                                                }`} />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm ${
                                                    validationErrors.email 
                                                        ? 'border-red-300 dark:border-red-600' 
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                                                placeholder="Enter your email"
                                            />
                                            {formData.email && !validationErrors.email && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        {validationErrors.email && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 animate-fade-in">
                                                {validationErrors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Username Field */}
                                    <div className="relative">
                                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon className={`h-4 w-4 transition-colors duration-200 ${
                                                    focusedField === 'username' ? 'text-blue-500' : 'text-gray-400'
                                                }`} />
                                            </div>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                autoComplete="username"
                                                required
                                                value={formData.username}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('username')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm ${
                                                    validationErrors.username 
                                                        ? 'border-red-300 dark:border-red-600' 
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                                                placeholder="Choose a username"
                                            />
                                            {formData.username && !validationErrors.username && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        {validationErrors.username && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 animate-fade-in">
                                                {validationErrors.username}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="relative">
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LockClosedIcon className={`h-4 w-4 transition-colors duration-200 ${
                                                    focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                                                }`} />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('password')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm ${
                                                    validationErrors.password 
                                                        ? 'border-red-300 dark:border-red-600' 
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                                                placeholder="Create a password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        
                                        {/* Password Strength Indicator */}
                                        {formData.password && (
                                            <div className="mt-2 animate-fade-in">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength</span>
                                                    <span className={`text-xs font-medium ${
                                                        passwordStrength.strength <= 2 ? 'text-red-500' :
                                                        passwordStrength.strength <= 3 ? 'text-yellow-500' :
                                                        passwordStrength.strength <= 4 ? 'text-blue-500' : 'text-green-500'
                                                    }`}>
                                                        {getStrengthText(passwordStrength.strength)}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                                level <= passwordStrength.strength
                                                                    ? getStrengthColor(passwordStrength.strength)
                                                                    : 'bg-gray-200 dark:bg-gray-600'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {validationErrors.password && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 animate-fade-in">
                                                {validationErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="relative">
                                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LockClosedIcon className={`h-4 w-4 transition-colors duration-200 ${
                                                    focusedField === 'confirmPassword' ? 'text-blue-500' : 'text-gray-400'
                                                }`} />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('confirmPassword')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm ${
                                                    validationErrors.confirmPassword 
                                                        ? 'border-red-300 dark:border-red-600' 
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                                                placeholder="Confirm your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                            {formData.confirmPassword && !validationErrors.confirmPassword && formData.password === formData.confirmPassword && (
                                                <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        {validationErrors.confirmPassword && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 animate-fade-in">
                                                {validationErrors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading || Object.values(validationErrors).some(error => error)}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating account...
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                Create Account
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Trust Indicators */}
                        <div className="text-center space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Terms</a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</a>
                            </p>
                            <div className="flex items-center justify-center space-x-4 text-gray-400 dark:text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium">SSL Secured</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="w-3 h-3 text-yellow-500" />
                                    <span className="text-xs font-medium">4.9/5</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <CheckIcon className="w-3 h-3 text-blue-500" />
                                    <span className="text-xs font-medium">50K+ Users</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 