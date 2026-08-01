"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle, 
  ArrowRight, 
  Smartphone, 
  Edit3, 
  Zap, 
  MenuSquare,
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  DollarSign,
  ChevronDown,
  Mail,
  Send,
  Star
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSent, setIsSent] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "" });
      setIsSent(false);
    }, 2500);
  };

  return (
    <div className="bg-[#0A0A0C] text-[#EDEDF2] font-sans min-h-screen selection:bg-rose-500 selection:text-white overflow-x-hidden scroll-smooth">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[400px] right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Nav */}
      <nav className="border-b border-[#1E1E24] backdrop-blur-md sticky top-0 z-50 bg-[#0A0A0C]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-rose-400 bg-clip-text text-transparent">
              DIGIDISH
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-rose-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-rose-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-rose-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-rose-400 transition-colors">FAQ</a>
            <a href="#testimonials" className="hover:text-rose-400 transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-rose-400 transition-colors">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/signin" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-medium transition-all text-sm shadow-lg hover:shadow-rose-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/5 text-rose-400 text-xs font-semibold tracking-wider uppercase mb-8 backdrop-blur-sm animate-bounce">
          <Zap className="h-3.5 w-3.5 animate-pulse" />
          <span>Next-Gen OCR Extraction</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight mb-8">
          Digitize physical menus into interactive{" "}
          <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-md">
            Zomato-Style
          </span>{" "}
          layouts in seconds
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 font-light">
          Upload any paper menu photo or PDF. Our high-fidelity visual OCR AI dynamically structures sections, item names, descriptions, pricing, and dietary badges. Customise instantly and publish.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold text-base transition-all shadow-lg hover:shadow-rose-500/20 flex items-center justify-center space-x-2.5 transform hover:-translate-y-0.5"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          
          <Link
            href="/dashboard?demo=true"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#2D2D38] hover:border-slate-550 hover:bg-[#1E1E26] text-slate-200 hover:text-white font-semibold text-base transition-all bg-[#121218]/40 backdrop-blur-sm flex items-center justify-center space-x-2.5"
          >
            <span>Try Free Demo</span>
            <Smartphone className="h-5 w-5 text-slate-400 animate-pulse" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-[#1E1E24] bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Digitization features built for speed</h2>
            <p className="text-slate-450 text-sm">Everything you need to capture, structure, publish, and host clean, responsive menu cards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-2xl border border-[#1E1E24] bg-[#121218]/50 hover:border-rose-500/20 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Multi-Format Upload</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Capture using your phone camera, upload file bundles, or drag & drop PDFs and menu image galleries directly onto the website.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[#1E1E24] bg-[#121218]/50 hover:border-orange-500/20 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Visual Vision OCR</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Powered by OpenAI GPT Vision and Google Gemini models. Scans handwritten or stylised fonts and categorises structure.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[#1E1E24] bg-[#121218]/50 hover:border-amber-500/20 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Edit3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Interactive Live Editor</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Drag and drop sorting, instant stock toggles, inline price revisions, vegetarian/non-vegetarian tags, and real-time auto-saving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-[#0F0F14] border-y border-[#1E1E24]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Digitise in three simple steps</h2>
            <p className="text-slate-450 text-sm">Convert complex physical menus to ready-to-share web pages in less than a minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white font-extrabold text-xl mb-6 shadow-lg shadow-rose-500/10 group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload Files</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Snap a picture of the menu with your mobile camera or drag-and-drop a PDF/image directly into the dashboard.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl mb-6 shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Extraction</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Our vision engine maps items, parses pricing/currencies, automatically detects veg status, and organizes food types.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-white font-extrabold text-xl mb-6 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Publish & Share</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Preview your digital Zomato-style layout, make any manual corrections, generate a custom QR code, and go live instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-450 text-sm">Flexible tiers built for single restaurants, gourmet bistros, and expanding chains.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl border border-[#23232C] bg-[#121218]/40 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-xs font-semibold text-rose-450 uppercase tracking-widest bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/20">Starter</span>
                <div className="flex items-baseline mt-6 mb-2">
                  <span className="text-4xl font-extrabold text-white">Free</span>
                </div>
                <p className="text-slate-455 text-xs">Ideal for trying our AI visual OCR engine.</p>
                
                <ul className="mt-8 space-y-4 text-xs text-slate-300">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Upload up to 3 menus / month</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Local OCR & standard AI parsing</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Zomato-style viewer & editor</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center py-3 rounded-xl border border-[#2D2D38] hover:border-slate-500 text-slate-200 text-xs font-semibold bg-[#111116]/80 hover:bg-[#1E1E26] transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-3xl border-2 border-rose-500 bg-[#121218] flex flex-col justify-between relative shadow-2xl shadow-rose-500/5">
              <span className="absolute top-0 right-8 -translate-y-1/2 text-[10px] font-bold text-white uppercase tracking-wider bg-rose-500 px-3 py-1 rounded-full shadow-md">POPULAR</span>
              <div>
                <span className="text-xs font-semibold text-rose-450 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">Pro Restaurant</span>
                <div className="flex items-baseline mt-6 mb-2">
                  <span className="text-sm font-semibold text-slate-400 mr-1">$</span>
                  <span className="text-4xl font-extrabold text-white">29</span>
                  <span className="text-xs text-slate-400 ml-1">/mo</span>
                </div>
                <p className="text-slate-455 text-xs">For active eateries requiring seamless digitization and live hosting.</p>
                
                <ul className="mt-8 space-y-4 text-xs text-slate-300">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span className="font-semibold text-white">Unlimited menu uploads</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>High-priority GPT-4o visual vision OCR</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Custom vector QR codes (Print ready)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Customer view analytics & scans count</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md">
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="p-8 rounded-3xl border border-[#23232C] bg-[#121218]/40 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-xs font-semibold text-rose-455 uppercase tracking-widest bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/20">Chains</span>
                <div className="flex items-baseline mt-6 mb-2">
                  <span className="text-sm font-semibold text-slate-400 mr-1">$</span>
                  <span className="text-4xl font-extrabold text-white">99</span>
                  <span className="text-xs text-slate-400 ml-1">/mo</span>
                </div>
                <p className="text-slate-455 text-xs">For multi-location food outlets requiring unified panels.</p>
                
                <ul className="mt-8 space-y-4 text-xs text-slate-300">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Up to 15 physical outlet profiles</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Role-based login access controls</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Custom domain binding & theme styles</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center py-3 rounded-xl border border-[#2D2D38] hover:border-slate-500 text-slate-200 text-xs font-semibold bg-[#111116]/80 hover:bg-[#1E1E26] transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#0F0F14] border-y border-[#1E1E24]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Have queries about the visual digitizer pipeline? We have answers.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How accurate is the AI visual OCR menu reader?",
                a: "Our visual OCR is powered by state-of-the-art vision models (GPT-4o & Gemini). It has a 98% accuracy rate on clear scans, identifying numeric pricing, currency formatting, specific menu sections, and item descriptions correctly."
              },
              {
                q: "What file formats does DIGIDISH support?",
                a: "We support PNG, JPEG, WEBP, and PDF documents. You can capture menus using your phone camera directly or upload structured document sheets."
              },
              {
                q: "Do I need a credit card to try DIGIDISH?",
                a: "No credit card is required. You can try our platform out by clicking the 'Try Free Demo' button, which redirects you to a fully populated sandbox dashboard without requiring a registration."
              },
              {
                q: "Are client menus responsive on mobile viewports?",
                a: "Absolutely. Digital menus generated by DIGIDISH feature a Zomato-style horizontal swipe bar for menu categories, inline search filters, veg/non-veg indicator badges, and are optimized for standard iOS and Android layouts."
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-[#23232C] bg-[#121218]/50 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-white text-sm focus:outline-none hover:text-rose-450 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 border-t border-[#23232C] text-xs text-slate-400 leading-relaxed animate-slideDown">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Loved by restaurant owners</h2>
            <p className="text-slate-450 text-sm">Read what chefs, cafe managers, and hospitality directors say about us.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                text: "We used to manually copy-paste or write HTML codes to keep our web menus up to date. With DIGIDISH, we just take a photo of our chalkboard or physical flyer, and the digital site refreshes in 30 seconds. Brilliant!",
                author: "Chef Marcus Lin",
                role: "Founding Partner, Bistro 45"
              },
              {
                text: "The multi-tenant isolation gives our chain restaurants complete security. Generating a custom high-res print-ready QR code that points to a responsive digital reader directly saved us hundreds of dollars.",
                author: "Sarah Jenkins",
                role: "Operations VP, GreenSalad Group"
              },
              {
                text: "I was skeptical about OCR handling script fonts, but the visual parser did not miss a single item or price decimal. The vegetarian badges were instantly mapped! Highly recommend the Pro tier.",
                author: "Rohan Mehra",
                role: "General Manager, Spice Garden"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-8 rounded-3xl border border-[#23232C] bg-[#121218]/30 flex flex-col justify-between hover:border-slate-800 transition-colors">
                <div>
                  <div className="flex space-x-1 text-rose-500 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-slate-300 text-xs italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="mt-8 flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm uppercase">
                    {t.author.substring(5, 7) || "A"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.author}</h4>
                    <p className="text-[10px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#0F0F14] border-t border-[#1E1E24]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl border border-[#262630] bg-[#161620]/80 p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-rose-600/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
              <div className="md:col-span-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Get in Touch</h2>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Have special custom integration requests? Send us a quick query and our engineering support staff will get back to you within 24 hours.
                </p>
                <div className="space-y-3.5 text-xs text-slate-350">
                  <div className="flex items-center space-x-2.5">
                    <Mail className="h-4 w-4 text-rose-500" />
                    <span>support@digidish.com</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3">
                {isSent ? (
                  <div className="h-[250px] flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                      <Send className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-400 text-xs">Thank you for writing. We will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        required
                        placeholder="Your Name" 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-xs placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        required
                        placeholder="Your Email" 
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-xs placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                    <div>
                      <textarea 
                        required
                        rows={4}
                        placeholder="How can we help your restaurant?" 
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-xs placeholder-slate-655 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                    >
                      <span>Send Message</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E24] bg-[#0A0A0C] py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <MenuSquare className="h-4 w-4 text-rose-500" />
            <span className="font-bold text-slate-400">DIGIDISH © 2026</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Security Details</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
