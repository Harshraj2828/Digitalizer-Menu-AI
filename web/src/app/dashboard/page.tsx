"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMenuStore } from "@/store/useMenuStore";
import { 
  Plus, 
  Store, 
  UploadCloud, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  FileText,
  FileImage,
  QrCode,
  Settings,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Grid,
  FileSpreadsheet,
  AlertTriangle,
  Download
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoUrl = searchParams.get("demo") === "true";

  const {
    currentRestaurant,
    isDemoMode,
    menus,
    isLoading,
    isProcessing,
    error,
    checkSession,
    uploadMenu,
    logout,
  } = useMenuStore();

  const [activeTab, setActiveTab] = useState<"menus" | "qr" | "settings" | "profile">("menus");
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    address: "",
    mobileNumber: "",
    ownerName: "",
    gstNumber: ""
  });
  const [settingsStatus, setSettingsStatus] = useState<"idle" | "saving" | "saved">("idle");

  // QR Code State
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Verify Auth on mount
  useEffect(() => {
    checkSession(isDemoUrl).then((isLoggedIn) => {
      if (!isLoggedIn && !isDemoUrl) {
        router.push("/signin");
      }
    });
  }, [checkSession, isDemoUrl, router]);

  // Sync settings form when currentRestaurant is loaded
  useEffect(() => {
    if (currentRestaurant) {
      setSettingsForm({
        name: currentRestaurant.name || "",
        address: currentRestaurant.address || "",
        mobileNumber: currentRestaurant.mobileNumber || currentRestaurant.phone || "",
        ownerName: currentRestaurant.ownerName || "",
        gstNumber: currentRestaurant.gstNumber || ""
      });
    }
  }, [currentRestaurant]);

  // Fetch QR Code when selectedMenuId changes
  useEffect(() => {
    if (selectedMenuId) {
      setQrLoading(true);
      fetch(`/api/menus/${selectedMenuId}/qrcode`)
        .then((res) => res.json())
        .then((data) => {
          if (data.qrCodeUrl) {
            setQrCodeUrl(data.qrCodeUrl);
          }
          setQrLoading(false);
        })
        .catch(() => {
          setQrLoading(false);
        });
    } else {
      setQrCodeUrl(null);
    }
  }, [selectedMenuId]);

  // Set default selected menu for QR code generator once menus load
  useEffect(() => {
    if (menus.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menus[0].id);
    }
  }, [menus, selectedMenuId]);

  // Compute Statistics from menus
  const totalMenus = menus.length;
  let totalCategories = 0;
  let totalItems = 0;

  menus.forEach((m) => {
    if (m.sections) {
      totalCategories += m.sections.length;
      m.sections.forEach((sec) => {
        if (sec.items) {
          totalItems += sec.items.length;
        }
      });
    }
  });

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      setSettingsStatus("saving");
      setTimeout(() => {
        setSettingsStatus("saved");
        setTimeout(() => setSettingsStatus("idle"), 2000);
      }, 1000);
      return;
    }

    setSettingsStatus("saving");
    try {
      const res = await fetch(`/api/restaurants`, {
        method: "POST", // Mock database handles updates internally, or Prisma maps active profile
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        setSettingsStatus("saved");
        checkSession(false); // Reload profile
        setTimeout(() => setSettingsStatus("idle"), 2000);
      } else {
        setSettingsStatus("idle");
      }
    } catch (e) {
      setSettingsStatus("idle");
    }
  };

  // Drag and Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const processAndUploadFile = async (file: File) => {
    if (!currentRestaurant) return;
    setUploadError(null);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const queryStr = isDemoMode ? "?demo=true" : "";
        
        // Simulating processing progress steps
        const resultMenu = await uploadMenu(
          currentRestaurant.id,
          base64Data,
          file.name,
          `${file.name.split(".")[0]} Digitised`
        );
        router.push(`/menu/${resultMenu.id}${queryStr}`);
      } catch (err) {
        setUploadError((err as Error).message);
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#0A0A0C] text-[#EDEDF2] min-h-screen font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* 1. DEMO MODE HEADER BANNER */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-b border-orange-500/20 px-6 py-3 text-center text-xs font-semibold text-orange-400 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-4.5 w-4.5 text-orange-400 shrink-0" />
          <span><strong>Demo Mode:</strong> You are inside an interactive sandbox. Changes will not be saved permanently.</span>
          <Link href="/signup" className="ml-3 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-[10px] uppercase transition-colors shrink-0">
            Sign Up Now
          </Link>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-[#1E1E24] bg-[#0C0C10] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="h-9 w-9 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/10 hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-lg">D</span>
            </Link>
            <span className="font-extrabold text-xl text-white tracking-tight">DIGIDISH</span>
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#2D2D38] text-slate-500 font-semibold bg-[#111116] uppercase tracking-wider hidden sm:inline-block">
              {isDemoMode ? "Sandbox" : "Portal"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {currentRestaurant && (
              <div className="hidden md:flex items-center space-x-2 bg-[#15151E] border border-[#2C2C3A] rounded-xl px-4 py-2 text-xs font-semibold text-slate-200">
                <Store className="h-4 w-4 text-rose-500" />
                <span>{currentRestaurant.name}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-[#2D2D38] hover:border-rose-500/55 hover:text-rose-400 transition-colors bg-[#15151E] flex items-center space-x-2 text-xs font-medium cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow flex flex-col">
        {isLoading && !currentRestaurant ? (
          <div className="flex flex-col items-center justify-center py-20 flex-grow">
            <Loader2 className="h-10 w-10 text-rose-500 animate-spin mb-4" />
            <span className="text-slate-400 text-sm">Loading restaurant instance...</span>
          </div>
        ) : (
          <div className="flex flex-col space-y-8">
            
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border border-[#1E1E24] bg-[#121218]/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Total Menus</span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">{totalMenus}</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-500">
                  <FileText className="h-6 w-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-[#1E1E24] bg-[#121218]/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Categories</span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">{totalCategories}</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center text-orange-500">
                  <Grid className="h-6 w-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-[#1E1E24] bg-[#121218]/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Menu Items</span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">{totalItems}</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-[#1E1E24] bg-[#121218]/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Estimated Scans</span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">
                    {isDemoMode ? "245" : (currentRestaurant?.id ? "0" : "0")}
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Content Tabs switcher */}
            <div className="flex border-b border-[#1E1E24] overflow-x-auto gap-6 scrollbar-none">
              <button 
                onClick={() => setActiveTab("menus")}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors whitespace-nowrap ${activeTab === "menus" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-350"}`}
              >
                Menus & Digitiser
              </button>
              <button 
                onClick={() => setActiveTab("qr")}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors whitespace-nowrap ${activeTab === "qr" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-350"}`}
              >
                QR Code Generator
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors whitespace-nowrap ${activeTab === "settings" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-350"}`}
              >
                Settings
              </button>
              <button 
                onClick={() => setActiveTab("profile")}
                className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors whitespace-nowrap ${activeTab === "profile" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-350"}`}
              >
                Profile & Metadata
              </button>
            </div>

            {/* Dashboard Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* 1. MENUS TAB */}
              {activeTab === "menus" && (
                <>
                  {/* Left digitize new menu uploader */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-[#1E1E24] bg-[#121218]/80">
                      <h2 className="text-base font-bold text-white mb-1.5 flex items-center space-x-2">
                        <Sparkles className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                        <span>Digitise Menu Card</span>
                      </h2>
                      <p className="text-slate-450 text-[11px] leading-relaxed mb-6">
                        Supports camera snap files, JPEG/PNG images, or PDF menu flyers. Visual OCR maps layout.
                      </p>

                      {/* Drag & Drop File Selector */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition-colors relative cursor-pointer ${
                          dragActive 
                            ? "border-rose-500 bg-rose-500/5" 
                            : "border-[#2D2D38] bg-[#0C0C10] hover:border-slate-500"
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex flex-col items-center justify-center p-4">
                            <Loader2 className="h-8 w-8 text-rose-500 animate-spin mb-3" />
                            <span className="text-xs text-rose-400 font-semibold animate-pulse mb-1">
                              Processing Menu Layout
                            </span>
                            <span className="text-[10px] text-slate-500">Executing OCR mapping...</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-10 w-10 text-slate-550 mb-3" />
                            <span className="text-xs font-semibold text-slate-200 mb-1">
                              Drag and drop file here
                            </span>
                            <span className="text-[10px] text-slate-500 mb-4">
                              PNG, JPG, or PDF (Max 10MB)
                            </span>
                            <label className="px-3.5 py-1.5 rounded-lg bg-[#1D1D26] hover:bg-[#252533] border border-[#2D2D3A] text-[10px] font-bold text-slate-200 cursor-pointer transition-colors shadow-sm">
                              Browse Files
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                            </label>
                          </>
                        )}
                      </div>

                      {uploadError && (
                        <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs leading-relaxed">
                          {uploadError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right menu list grid */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-white">Your Digitised Menus</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-lg border border-[#1E1E24] bg-[#0C0C10] font-semibold text-slate-400">
                        {menus.length} menus
                      </span>
                    </div>

                    {isProcessing && (
                      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex items-center space-x-2.5 animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Extracting data elements. The digitized menu card will appear below shortly.</span>
                      </div>
                    )}

                    {menus.length === 0 ? (
                      <div className="text-center py-16 border border-[#1E1E24] rounded-2xl bg-[#121218]/10">
                        <Clock className="h-10 w-10 text-slate-650 mx-auto mb-3" />
                        <h3 className="font-semibold text-slate-450 text-xs">No menus digitised yet</h3>
                        <p className="text-slate-500 text-[10px] mt-1 max-w-xs mx-auto leading-relaxed">
                          Upload your menu files on the left to structure categories, dishes, prices and badges.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                        {menus.map((menu) => {
                          const isReady = menu.status === "ready" || menu.status === "published";
                          const isPublished = menu.status === "published";
                          const queryStr = isDemoMode ? "?demo=true" : "";

                          return (
                            <div
                              key={menu.id}
                              className="rounded-2xl border border-[#1E1E24] bg-[#121218]/70 hover:border-slate-550 transition-colors p-5 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3.5">
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    {new Date(menu.createdAt).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })}
                                  </span>
                                  
                                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                    isPublished 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : isReady
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                                  }`}>
                                    {menu.status}
                                  </span>
                                </div>

                                <h3 className="font-bold text-white text-base mb-1.5 truncate">
                                  {menu.title}
                                </h3>

                                <div className="flex items-center space-x-1.5 text-xs text-slate-450 mb-6">
                                  {menu.sourceImageUrl ? (
                                    <FileImage className="h-3.5 w-3.5 text-slate-550" />
                                  ) : (
                                    <FileText className="h-3.5 w-3.5 text-slate-555" />
                                  )}
                                  <span className="truncate">
                                    {menu.sourceImageUrl ? "Digitised Image File" : "Fallback OCR parser"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-[#1E1E24]">
                                <span className="text-[10px] font-medium text-slate-500">
                                  {menu.sections?.length || 0} categories
                                </span>
                                
                                <Link
                                  href={`/menu/${menu.id}${queryStr}`}
                                  className="text-xs font-bold text-rose-450 hover:text-rose-350 transition-colors flex items-center space-x-1 group"
                                >
                                  <span>{isReady ? "View & Edit" : "Processing"}</span>
                                  <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 2. QR CODE TAB */}
              {activeTab === "qr" && (
                <div className="lg:col-span-3 max-w-2xl mx-auto w-full p-8 rounded-3xl border border-[#1E1E24] bg-[#121218]/80 shadow-xl animate-fadeIn">
                  <div className="text-center max-w-md mx-auto mb-8">
                    <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-500/20">
                      <QrCode className="h-6 w-6 animate-pulse" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1.5">Print-Ready QR Codes</h2>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Choose one of your digitized menu cards below to display or download its high-resolution customer scanning code.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-[#23232C] pt-8">
                    {/* Menu Selector */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Menu Card</label>
                        <select
                          className="w-full bg-[#0C0C10] border border-[#2D2D38] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-rose-550"
                          value={selectedMenuId}
                          onChange={(e) => setSelectedMenuId(e.target.value)}
                        >
                          {menus.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedMenuId && (
                        <div className="p-4 rounded-xl bg-[#0D0D14] border border-[#23232C] text-[11px] text-slate-400 space-y-2">
                          <p><strong>Link:</strong> <span className="text-rose-400 font-mono text-[10px] break-all">{typeof window !== "undefined" ? window.location.origin : ""}/menu/{selectedMenuId}</span></p>
                          <p>Place this QR code on dining tables, standees, or windows. Customers can scan using any smartphone camera to view the menu.</p>
                        </div>
                      )}
                    </div>

                    {/* QR Code Preview */}
                    <div className="flex flex-col items-center justify-center bg-[#0C0C10] border border-[#23232C] rounded-2xl p-6 min-h-[250px] relative">
                      {qrLoading ? (
                        <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
                      ) : qrCodeUrl ? (
                        <>
                          <img 
                            src={qrCodeUrl} 
                            alt="Menu QR Code" 
                            className="w-44 h-44 rounded-xl border border-[#23232C] bg-white p-2 shadow-lg mb-4"
                          />
                          <a 
                            href={qrCodeUrl}
                            download="menu-qrcode.png"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-[#1D1D26] hover:bg-[#252533] border border-[#2D2D3A] text-xs font-bold text-slate-200 flex items-center space-x-2 transition-colors cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Open High-Res Code</span>
                          </a>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">Please select a menu card above</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="lg:col-span-3 max-w-2xl mx-auto w-full p-8 rounded-3xl border border-[#1E1E24] bg-[#121218]/80 animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-white mb-1">Restaurant Profile</h2>
                    <p className="text-slate-450 text-xs">Manage active display info, location details, and business identification numbers.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-5 border-t border-[#23232C] pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Restaurant Name</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                          className="w-full bg-[#0C0C10] border border-[#2D2D38] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Owner Full Name</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.ownerName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                          className="w-full bg-[#0C0C10] border border-[#2D2D38] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mobile Number</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.mobileNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, mobileNumber: e.target.value })}
                          className="w-full bg-[#0C0C10] border border-[#2D2D38] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">GST Number</label>
                        <input
                          type="text"
                          placeholder="GST Number"
                          value={settingsForm.gstNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, gstNumber: e.target.value })}
                          className="w-full bg-[#0C0C10] border border-[#2D2D38] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-rose-500 uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Street Address</label>
                      <textarea
                        required
                        rows={2}
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full bg-[#0C0C10] border border-[#2D2D38] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-rose-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#23232C]">
                      <span className="text-xs text-slate-500 font-medium">
                        {settingsStatus === "saved" && "Saved successfully!"}
                      </span>
                      
                      <button
                        type="submit"
                        disabled={settingsStatus === "saving"}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {settingsStatus === "saving" ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Settings className="h-3.5 w-3.5" />
                            <span>Save Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 4. PROFILE TAB */}
              {activeTab === "profile" && currentRestaurant && (
                <div className="lg:col-span-3 max-w-2xl mx-auto w-full p-8 rounded-3xl border border-[#1E1E24] bg-[#121218]/80 animate-fadeIn">
                  <div className="text-center mb-8 border-b border-[#23232C] pb-6">
                    <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/25 mx-auto mb-4 font-bold text-xl uppercase">
                      {currentRestaurant.name.substring(0, 2)}
                    </div>
                    <h2 className="text-lg font-bold text-white">{currentRestaurant.name}</h2>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Restaurant Identity profile</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#0D0D14] border border-[#1D1D26]">
                      <span className="font-semibold text-slate-450">Unique ID</span>
                      <code className="font-mono text-[10px] bg-[#1C1C24] px-2 py-0.5 rounded text-white">{currentRestaurant.id}</code>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#0D0D14] border border-[#1D1D26]">
                      <span className="font-semibold text-slate-450">Owner/Manager</span>
                      <span className="font-bold text-white">{currentRestaurant.ownerName || "Chef manager"}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#0D0D14] border border-[#1D1D26]">
                      <span className="font-semibold text-slate-450">Contact Email</span>
                      <span className="font-bold text-white">{currentRestaurant.email || "manager@rest.com"}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#0D0D14] border border-[#1D1D26]">
                      <span className="font-semibold text-slate-450">Mobile Contact</span>
                      <span className="font-bold text-white">{currentRestaurant.mobileNumber || currentRestaurant.phone || "No phone added"}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#0D0D14] border border-[#1D1D26]">
                      <span className="font-semibold text-slate-450">Member Since</span>
                      <span className="font-bold text-white">
                        {new Date(currentRestaurant.createdAt).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

    </div>
  );
}
