import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
    RocketLaunchIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const { login, error, clearError } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect path from location state or default to dashboard
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: RocketLaunchIcon,
            title: "Welcome Back",
            description: "Continue your habit journey where you left off"
        },
        {
            icon: FireIcon,
            title: "Your Streaks",
            description: "See your progress and maintain momentum"
        },
        {
            icon: TrophyIcon,
            title: "Achievements",
            description: "View your unlocked badges and milestones"
        },
        {
            icon: SparklesIcon,
            title: "Insights",
            description: "Discover patterns in your habit data"
        }
    ];

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
                {/* Left Side - Welcome Back */}
                <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
                    {/* Dynamic Background based on theme */}
                    <div className={`absolute inset-0 ${theme === 'light' 
                        ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700' 
                        : 'bg-gradient-to-br from-gray-800 via-slate-800 to-gray-900'
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
                        {/* Welcome Section */}
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
                                    Welcome Back!
                                    <br />
                                    <span className={theme === 'light' ? 'text-white/85' : 'text-gray-200'}>
                                        Continue Your Journey
                                    </span>
                                </h2>
                                
                                <p className={`text-base leading-relaxed ${theme === 'light' ? 'text-white/90' : 'text-gray-300'}`}>
                                    Your habits are waiting. Let's keep building your best self.
                                </p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 mb-8 w-full">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                const colors = [
                                    'from-emerald-400 to-teal-500', // Welcome Back - Emerald to Teal
                                    'from-red-400 to-pink-500', // Streaks - Red to Pink
                                    'from-amber-400 to-yellow-500', // Achievements - Amber to Yellow
                                    'from-indigo-400 to-purple-500', // Insights - Indigo to Purple
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

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 animate-fade-in-up animation-delay-1000 w-full justify-items-center">
                            <div className="text-center group">
                                <div className="text-xl font-bold mb-0.5 group-hover:scale-110 transition-transform duration-300">50K+</div>
                                <div className={`text-xs ${theme === 'light' ? 'text-white/75' : 'text-gray-400'}`}>Active Users</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-xl font-bold mb-0.5 group-hover:scale-110 transition-transform duration-300">5M+</div>
                                <div className={`text-xs ${theme === 'light' ? 'text-white/75' : 'text-gray-400'}`}>Daily Habits</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-xl font-bold mb-0.5 group-hover:scale-110 transition-transform duration-300">98%</div>
                                <div className={`text-xs ${theme === 'light' ? 'text-white/75' : 'text-gray-400'}`}>Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
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
                                Welcome Back
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    onClick={clearError}
                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                                >
                                    Create one here
                                </Link>
                            </p>
                        </div>

                        {/* Login Form */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30">
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-700 animate-shake">
                                        <div className="flex items-center">
                                            <XMarkIcon className="h-4 w-4 text-red-400 mr-2" />
                                            <div className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    {/* Email Field */}
                                    <div className="relative">
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm hover:border-gray-400 dark:hover:border-gray-500"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="relative">
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                                                autoComplete="current-password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('password')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm hover:border-gray-400 dark:hover:border-gray-500"
                                                placeholder="Enter your password"
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
                                    </div>
                                </div>

                                {/* Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200">
                                            Forgot your password?
                                        </a>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Signing in...
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <ArrowRightIcon className="h-4 w-4 mr-2" />
                                                Sign In
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Trust Indicators */}
                        <div className="text-center space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Secure login protected by SSL encryption
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
                                    <span className="text-xs font-medium">Trusted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 