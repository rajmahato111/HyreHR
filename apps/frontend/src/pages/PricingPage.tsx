import { Check, X, ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import HyreHRLogo from '../components/HyreHRLogo';

export default function PricingPage() {
    const plans = [
        {
            name: 'Starter',
            price: '49',
            description: 'Perfect for startups and small teams',
            features: [
                'Up to 10 active jobs',
                '100 candidates per month',
                'Basic ATS features',
                'Email support',
                'Standard analytics',
                'Mobile app access',
            ],
            notIncluded: [
                'Advanced AI matching',
                'Custom workflows',
                'API access',
                'Dedicated support',
            ],
            color: 'purple',
            popular: false,
        },
        {
            name: 'Professional',
            price: '149',
            description: 'For growing companies scaling their hiring',
            features: [
                'Unlimited active jobs',
                'Unlimited candidates',
                'Advanced AI matching',
                'Custom workflows & automation',
                'Advanced analytics & reporting',
                'Calendar integrations',
                'Email sequences',
                'Priority support',
                'API access',
                'Custom branding',
            ],
            notIncluded: [
                'Dedicated account manager',
                'Custom integrations',
                'SLA guarantee',
            ],
            color: 'pink',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For large organizations with complex needs',
            features: [
                'Everything in Professional',
                'Unlimited users',
                'Dedicated account manager',
                'Custom integrations',
                'Advanced security & compliance',
                'SLA guarantee (99.9% uptime)',
                'Custom training & onboarding',
                'White-label options',
                'Multi-region data hosting',
                'Priority feature requests',
            ],
            notIncluded: [],
            color: 'blue',
            popular: false,
        },
    ];

    const addons = [
        {
            name: 'Advanced Analytics',
            price: '29',
            description: 'Deep insights and custom reporting',
            icon: TrendingUp,
        },
        {
            name: 'AI Sourcing Assistant',
            price: '49',
            description: 'AI-powered candidate sourcing and outreach',
            icon: Sparkles,
        },
        {
            name: 'Workflow Automation',
            price: '39',
            description: 'Advanced automation and custom workflows',
            icon: Zap,
        },
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            purple: {
                border: 'border-purple-500/50',
                bg: 'from-purple-500/10',
                text: 'text-purple-400',
                button: 'bg-purple-600 hover:bg-purple-700',
                badge: 'bg-purple-500',
            },
            pink: {
                border: 'border-pink-500/50',
                bg: 'from-pink-500/10',
                text: 'text-pink-400',
                button: 'bg-pink-600 hover:bg-pink-700',
                badge: 'bg-pink-500',
            },
            blue: {
                border: 'border-blue-500/50',
                bg: 'from-blue-500/10',
                text: 'text-blue-400',
                button: 'bg-blue-600 hover:bg-blue-700',
                badge: 'bg-blue-500',
            },
        };
        return colors[color as keyof typeof colors];
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <HyreHRLogo size={32} />
                            <span className="text-xl font-bold text-white">HyreHR</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
                            <a href="/#features" className="text-gray-300 hover:text-white transition-colors text-sm">Features</a>
                            <Link to="/pricing" className="text-white font-medium text-sm">Pricing</Link>
                            <Link to="/jobs" className="px-5 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all text-sm">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                            Simple, transparent
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                pricing
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Choose the plan that fits your team. All plans include a 14-day free trial.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="relative pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => {
                            const colors = getColorClasses(plan.color);
                            return (
                                <div
                                    key={plan.name}
                                    className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border ${plan.popular ? colors.border : 'border-white/10'
                                        } transition-all duration-300 ${plan.popular ? 'scale-105 shadow-2xl' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 ${colors.badge} text-white text-sm font-semibold rounded-full`}>
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                        <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                                        <div className="flex items-baseline mb-6">
                                            {plan.price === 'Custom' ? (
                                                <span className="text-4xl font-bold text-white">Custom</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                                    <span className="text-gray-400 ml-2">/month</span>
                                                </>
                                            )}
                                        </div>

                                        <Link
                                            to="/jobs"
                                            className={`w-full block text-center px-6 py-3 ${colors.button} text-white rounded-xl font-semibold transition-all`}
                                        >
                                            {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                                        </Link>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-sm font-semibold text-white mb-3">What's included:</div>
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-start space-x-3">
                                                <Check className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                                                <span className="text-gray-300 text-sm">{feature}</span>
                                            </div>
                                        ))}

                                        {plan.notIncluded.length > 0 && (
                                            <>
                                                <div className="text-sm font-semibold text-gray-500 mt-6 mb-3">Not included:</div>
                                                {plan.notIncluded.map((feature) => (
                                                    <div key={feature} className="flex items-start space-x-3">
                                                        <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-500 text-sm">{feature}</span>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add-ons Section */}
            <div className="relative py-24 bg-gradient-to-b from-transparent to-[#0F0F14]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Powerful add-ons
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Enhance your plan with additional features
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {addons.map((addon) => {
                            const Icon = addon.icon;
                            return (
                                <div
                                    key={addon.name}
                                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
                                >
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                        <Icon className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{addon.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6">{addon.description}</p>
                                    <div className="flex items-baseline">
                                        <span className="text-3xl font-bold text-white">${addon.price}</span>
                                        <span className="text-gray-400 ml-2">/month</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="relative py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Frequently asked questions
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                q: 'Can I change plans later?',
                                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any differences.',
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit cards (Visa, MasterCard, American Express) and can arrange invoicing for annual Enterprise plans.',
                            },
                            {
                                q: 'Is there a setup fee?',
                                a: 'No setup fees, ever. You only pay for your monthly subscription and any add-ons you choose.',
                            },
                            {
                                q: 'What happens after my trial ends?',
                                a: 'After your 14-day trial, you will be automatically moved to your selected plan. You can cancel anytime during the trial with no charges.',
                            },
                            {
                                q: 'Do you offer discounts for annual billing?',
                                a: 'Yes! Save 20% when you pay annually. Contact our sales team for custom Enterprise pricing.',
                            },
                        ].map((faq, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                                <p className="text-gray-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative py-24">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"></div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Start your 14-day free trial today. No credit card required.
                    </p>
                    <Link
                        to="/jobs"
                        className="inline-flex items-center space-x-2 px-10 py-5 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-2xl text-lg"
                    >
                        <span>Start Free Trial</span>
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <HyreHRLogo size={32} />
                            <span className="text-xl font-bold text-white">HyreHR</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                            © 2025 HyreHR. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
