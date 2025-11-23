import { ArrowRight, Users, BarChart3, Calendar, Sparkles, Zap, Shield, TrendingUp, CheckCircle2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import HyreHRLogo from '../components/HyreHRLogo';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <HyreHRLogo size={32} />
                            <span className="text-xl font-bold text-white">HyreHR</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#products" className="text-gray-300 hover:text-white transition-colors text-sm">Product</a>
                            <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">Features</a>
                            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link>
                            <Link to="/jobs" className="px-5 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all text-sm">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>


            {/* Hero Section */}
            <div className="relative pt-40 pb-24 overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30"></div>

                {/* Gradient Orbs - Enhanced */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-5xl mx-auto">
                        <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm text-purple-300 mb-10 border border-white/10 hover:border-purple-500/50 transition-colors">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium">AI-Powered Recruiting Platform</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                            What an ATS
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                                should be.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-14 max-w-4xl mx-auto leading-relaxed font-light">
                            All-in-one recruiting software with AI embedded in every layer.
                            <br className="hidden md:block" />
                            Built for scale with the foundations to make AI meaningful, not just decorative.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
                            <Link
                                to="/jobs"
                                className="group px-10 py-5 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-purple-500/25 flex items-center space-x-2 hover:scale-105 transform"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-10 py-5 bg-white/5 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 hover:border-purple-500/50 flex items-center space-x-2">
                                <span>Watch Demo</span>
                            </button>
                        </div>

                        {/* Social Proof - Enhanced */}
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="text-gray-300 font-medium">4.9/5 on G2</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                <span className="text-gray-300 font-medium">SOC 2 Certified</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                                <Users className="w-5 h-5 text-purple-400" />
                                <span className="text-gray-300 font-medium">10,000+ Companies</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div id="products" className="relative py-24 bg-gradient-to-b from-transparent to-[#0F0F14]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Products designed to help you excel at hiring
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            No matter your company stage
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Startup Card */}
                        <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="text-sm text-purple-400 mb-2">For Startups</div>
                                <h3 className="text-2xl font-bold text-white mb-2">1–100 employees</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Get a head start on recruiting with an all-in-one product that is easy to use and will scale with you.
                                </p>
                                <Link to="/jobs" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors">
                                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Growth Card */}
                        <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-pink-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="text-sm text-pink-400 mb-2">For Growth</div>
                                <h3 className="text-2xl font-bold text-white mb-2">101-1000 employees</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    A powerful all-in-one recruiting product that will help your scaling organization excel at hiring.
                                </p>
                                <Link to="/jobs" className="inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors">
                                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Enterprise Card */}
                        <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="text-sm text-blue-400 mb-2">For Enterprise</div>
                                <h3 className="text-2xl font-bold text-white mb-2">1000+ employees</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    A proven all-in-one recruiting solution that supports large organizations with sophisticated hiring needs.
                                </p>
                                <Link to="/jobs" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Analytics Card */}
                        <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="text-sm text-green-400 mb-2">Analytics</div>
                                <h3 className="text-2xl font-bold text-white mb-2">For your existing ATS</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Advanced recruiting analytics that work on top of your existing recruiting tools.
                                </p>
                                <Link to="/jobs" className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors">
                                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            How HyreHR enables hiring excellence
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Hiring has changed and so should your tools. Companies that excel at hiring have a strategic advantage.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Easy to get started with, powerful when you're ready</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Start recruiting immediately with intuitive workflows that scale as your needs grow.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-500/50 transition-all">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Enable structured hiring end-to-end</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Standardize your hiring process for more accurate and fair candidate assessments.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Sparkles className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Automate with a human touch</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Save time on repetitive tasks while maintaining personalized candidate experiences.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                                <BarChart3 className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Provide instant visibility and reduce clicks</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Access critical information at a glance with streamlined, intuitive interfaces.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Enable custom reporting to unlock real insights</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Build custom reports and dashboards to track the metrics that matter most to you.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-indigo-500/50 transition-all">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">One integrated system for your entire hiring process</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Consolidate your ATS, CRM, scheduling, and analytics in one powerful platform.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative py-32">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"></div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Hiring excellence is one
                        <br />
                        conversation away.
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Join thousands of companies using HyreHR to build amazing teams
                    </p>
                    <Link
                        to="/jobs"
                        className="inline-flex items-center space-x-2 px-10 py-5 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-2xl text-lg"
                    >
                        <span>Get Started Free</span>
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <HyreHRLogo size={32} />
                                <span className="text-xl font-bold text-white">HyreHR</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Hire smarter with AI-powered recruiting.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                                <li><Link to="/careers/hyrehr" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2025 HyreHR. All rights reserved.
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
