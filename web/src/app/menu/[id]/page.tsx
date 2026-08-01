"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMenuStore } from "@/store/useMenuStore";
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Trash2, 
  Plus, 
  Eye, 
  Edit3, 
  Check, 
  Save, 
  Globe,
  Loader2,
  ChevronUp,
  ChevronDown,
  AlertTriangle
} from "lucide-react";
import { MenuItem, MenuSection } from "@/lib/api-client";

export default function MenuDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoUrl = searchParams.get("demo") === "true";

  const {
    activeMenu,
    currentRestaurant,
    isDemoMode,
    isLoading,
    isProcessing,
    error,
    checkSession,
    fetchMenuDetails,
    saveMenu,
    publishMenu,
    updateActiveMenuItem,
    deleteActiveMenuItem,
    addActiveMenuItem,
    updateActiveSectionName,
    deleteActiveSection,
    addActiveSection,
    reorderActiveSections,
    reorderActiveItems,
  } = useMenuStore();

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "dirty">("saved");

  const isDirtyRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Verify session on mount
  useEffect(() => {
    checkSession(isDemoUrl);
  }, [checkSession, isDemoUrl]);

  const canEdit = isDemoMode || (currentRestaurant && activeMenu && activeMenu.restaurantId === currentRestaurant.id);

  // Force view mode if user cannot edit
  useEffect(() => {
    if (!canEdit) {
      setMode("view");
    }
  }, [canEdit]);

  // Fetch menu details on mount
  useEffect(() => {
    fetchMenuDetails(id);
  }, [id, fetchMenuDetails]);

  // Set default active tab
  useEffect(() => {
    if (activeMenu && activeMenu.sections.length > 0 && !activeTab) {
      setActiveTab(activeMenu.sections[0].id);
    }
  }, [activeMenu, activeTab]);

  // Debounced auto-save effect
  useEffect(() => {
    if (initialLoadRef.current) {
      if (activeMenu) {
        initialLoadRef.current = false;
      }
      return;
    }

    if (!isDirtyRef.current || !activeMenu) return;

    setAutoSaveStatus("dirty");
    const saveTimeout = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        await saveMenu(activeMenu.id, {
          title: activeMenu.title,
          sections: activeMenu.sections.map((s, sIdx) => ({
            id: s.id.startsWith("temp-") ? undefined : s.id,
            name: s.name,
            displayOrder: sIdx + 1,
            items: s.items.map((i, iIdx) => ({
              id: i.id.startsWith("temp-") ? undefined : i.id,
              name: i.name,
              description: i.description,
              price: i.price,
              currency: i.currency,
              isVeg: i.isVeg,
              isAvailable: i.isAvailable,
              displayOrder: iIdx + 1,
            })),
          })),
        });
        setAutoSaveStatus("saved");
        isDirtyRef.current = false;
      } catch (err) {
        console.error("Auto-save failed:", err);
        setAutoSaveStatus("dirty");
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(saveTimeout);
  }, [activeMenu, saveMenu]);

  // Wrap mutations to set dirty flag
  const markDirty = () => {
    isDirtyRef.current = true;
  };

  const handleUpdateItem = (sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
    markDirty();
    updateActiveMenuItem(sectionId, itemId, updates);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    markDirty();
    deleteActiveMenuItem(sectionId, itemId);
  };

  const handleAddItem = (sectionId: string) => {
    markDirty();
    addActiveMenuItem(sectionId, {
      name: "New Item",
      description: "Enter description",
      price: 150,
      currency: "INR",
      isVeg: true,
      isAvailable: true,
      imageUrl: null,
      displayOrder: 100,
    });
  };

  const handleUpdateSectionName = (sectionId: string, name: string) => {
    markDirty();
    updateActiveSectionName(sectionId, name);
  };

  const handleDeleteSection = (sectionId: string) => {
    markDirty();
    deleteActiveSection(sectionId);
  };

  const handleAddSection = () => {
    markDirty();
    addActiveSection("New Section Category");
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!activeMenu) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= activeMenu.sections.length) return;

    markDirty();
    const updatedSections = [...activeMenu.sections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[nextIndex];
    updatedSections[nextIndex] = temp;
    reorderActiveSections(updatedSections);
  };

  const handleMoveItem = (sectionId: string, index: number, direction: "up" | "down") => {
    if (!activeMenu) return;
    const section = activeMenu.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= section.items.length) return;

    markDirty();
    const updatedItems = [...section.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[nextIndex];
    updatedItems[nextIndex] = temp;
    reorderActiveItems(sectionId, updatedItems);
  };

  const handlePublish = async () => {
    if (!activeMenu) return;
    try {
      await publishMenu(activeMenu.id);
      alert("Menu published successfully! It is now live for diners.");
    } catch (err) {
      alert("Failed to publish: " + (err as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0A0A0C] text-slate-400 min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-rose-500 animate-spin mb-4" />
        <p className="text-sm">Fetching digital menu structure...</p>
      </div>
    );
  }

  if (error || !activeMenu) {
    return (
      <div className="bg-[#0A0A0C] text-slate-400 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-400 font-semibold mb-4">Error loading menu: {error || "Menu not found"}</p>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center space-x-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0C] text-[#EDEDF2] min-h-screen font-sans flex flex-col">
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-b border-orange-500/20 px-6 py-2.5 text-center text-xs font-semibold text-orange-400 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
          <span><strong>Demo Mode:</strong> You are in a sandbox. Changes to this menu are stored in memory only.</span>
        </div>
      )}
      
      {/* Editor Header Bar */}
      <div className="border-b border-[#1E1E24] bg-[#0C0C10] px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 w-full sm:w-auto">
            <Link href="/dashboard" className="p-2 rounded-xl border border-[#2D2D38] hover:border-slate-500 hover:text-white transition-colors bg-[#13131A]/60">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="truncate">
              <input
                type="text"
                disabled={mode === "view"}
                className={`bg-transparent font-bold text-lg md:text-xl text-white outline-none border-b ${
                  mode === "edit" ? "border-rose-500/50 focus:border-rose-500" : "border-transparent"
                } px-1`}
                value={activeMenu.title}
                onChange={(e) => {
                  markDirty();
                  useMenuStore.setState((state) => {
                    if (!state.activeMenu) return {};
                    return { activeMenu: { ...state.activeMenu, title: e.target.value } };
                  });
                }}
              />
              <span className="text-[10px] text-slate-500 block mt-0.5 ml-1">
                Last updated: {new Date(activeMenu.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              {/* Auto save indicator */}
              <div className="text-xs font-semibold mr-2">
                {autoSaveStatus === "saved" && (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>Draft Saved</span>
                  </span>
                )}
                {autoSaveStatus === "saving" && (
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </span>
                )}
                {autoSaveStatus === "dirty" && (
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Save className="h-3.5 w-3.5" />
                    <span>Unsaved changes</span>
                  </span>
                )}
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-[#161622] rounded-xl p-1 border border-[#2A2A38]">
                <button
                  onClick={() => setMode("view")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    mode === "view" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setMode("edit")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    mode === "edit" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editor</span>
                </button>
              </div>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={activeMenu.status === "published"}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  activeMenu.status === "published"
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/15 cursor-pointer"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{activeMenu.status === "published" ? "Published" : "Publish Live"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Sidebar Categories */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-[#121218] border border-[#1E1E24] rounded-2xl p-4 space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider px-2">
              Menu Sections
            </h3>
            
            <nav className="space-y-1">
              {activeMenu.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveTab(sec.id);
                    document.getElementById(`sec-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeTab === sec.id
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "text-slate-400 hover:text-white hover:bg-[#1E1E26]"
                  }`}
                >
                  <span>{sec.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-slate-500 border border-[#2D2D38]">
                    {sec.items.length}
                  </span>
                </button>
              ))}
            </nav>

            {mode === "edit" && (
              <button
                onClick={handleAddSection}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#2D2D38] hover:border-slate-500 hover:text-white text-xs font-bold text-slate-400 transition-all flex items-center justify-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Section</span>
              </button>
            )}

            {/* Original Image View button */}
            {activeMenu.sourceImageUrl && (
              <div className="pt-4 border-t border-[#1E1E24]">
                <a
                  href={activeMenu.sourceImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold block text-center py-2 rounded-xl bg-[#1C1C24]/60 border border-[#2A2A38]"
                >
                  View Uploaded Menu Card
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items List & Details */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Search bar inside preview */}
          {mode === "view" && (
            <div className="relative bg-[#121218] border border-[#1E1E24] rounded-2xl px-4 py-3 flex items-center">
              <Search className="h-5 w-5 text-slate-500 mr-3" />
              <input
                type="text"
                placeholder="Search dishes (e.g. Paneer Tikka, Butter Chicken...)"
                className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Section rendering */}
          {activeMenu.sections.map((section, secIdx) => {
            // Filter items based on search query
            const filteredItems = section.items.filter((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Skip rendering empty sections in view mode if searching
            if (mode === "view" && searchQuery && filteredItems.length === 0) return null;

            return (
              <div 
                key={section.id} 
                id={`sec-${section.id}`} 
                className="scroll-mt-24 p-6 rounded-3xl border border-[#1E1E24] bg-[#121218]/40 space-y-6"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1E1E24]">
                  <div className="flex items-center space-x-3 w-full max-w-md">
                    {mode === "edit" ? (
                      <input
                        type="text"
                        className="bg-[#1C1C24] border border-[#2D2D38] rounded-lg px-3 py-1 text-sm font-bold text-white outline-none focus:border-rose-500 w-full"
                        value={section.name}
                        onChange={(e) => handleUpdateSectionName(section.id, e.target.value)}
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-white relative">
                        {section.name}
                        <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-rose-500" />
                      </h2>
                    )}
                  </div>

                  {mode === "edit" && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleMoveSection(secIdx, "up")}
                        disabled={secIdx === 0}
                        className="p-1.5 rounded-lg border border-[#2D2D38] bg-[#121218] hover:border-slate-500 text-slate-400 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(secIdx, "down")}
                        disabled={secIdx === activeMenu.sections.length - 1}
                        className="p-1.5 rounded-lg border border-[#2D2D38] bg-[#121218] hover:border-slate-500 text-slate-400 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:border-red-500 text-red-400"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        mode === "edit" 
                          ? "border-[#2D2D38] bg-[#161620] hover:border-slate-500" 
                          : "border-[#1E1E24] bg-[#0E0E14] hover:bg-[#12121A]/80"
                      } ${!item.isAvailable ? "opacity-50" : ""}`}
                    >
                      {/* Top Details */}
                      <div>
                        {/* Veg Badging */}
                        <div className="flex items-center justify-between mb-3.5">
                          <span className={`inline-flex items-center space-x-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            item.isVeg === true
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : item.isVeg === false
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              item.isVeg === true ? "bg-emerald-400" : item.isVeg === false ? "bg-rose-400" : "bg-slate-400"
                            }`} />
                            <span>{item.isVeg === true ? "Veg" : item.isVeg === false ? "Non-Veg" : "Unspecified"}</span>
                          </span>

                          {mode === "edit" && (
                            <div className="flex items-center space-x-1.5">
                              {/* Move tools */}
                              <button
                                onClick={() => handleMoveItem(section.id, itemIdx, "up")}
                                disabled={itemIdx === 0}
                                className="p-1 rounded bg-[#1E1E28] border border-[#2D2D38] hover:border-slate-500 disabled:opacity-30"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleMoveItem(section.id, itemIdx, "down")}
                                disabled={itemIdx === section.items.length - 1}
                                className="p-1 rounded bg-[#1E1E28] border border-[#2D2D38] hover:border-slate-500 disabled:opacity-30"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="p-1 rounded bg-red-500/10 border border-red-500/20 hover:border-red-500 text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline fields / Label rendering */}
                        {mode === "edit" ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-2">
                              <input
                                type="text"
                                className="col-span-3 bg-[#1C1C24] border border-[#2D2D38] rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-rose-500 font-bold"
                                value={item.name}
                                placeholder="Item Name"
                                onChange={(e) => handleUpdateItem(section.id, item.id, { name: e.target.value })}
                              />
                              <input
                                type="number"
                                className="col-span-1 bg-[#1C1C24] border border-[#2D2D38] rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-rose-500 font-bold"
                                value={item.price}
                                placeholder="Price"
                                onChange={(e) => handleUpdateItem(section.id, item.id, { price: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <textarea
                              rows={2}
                              className="w-full bg-[#1C1C24] border border-[#2D2D38] rounded-lg px-2.5 py-1 text-[11px] text-slate-300 outline-none focus:border-rose-500 resize-none"
                              value={item.description}
                              placeholder="Item description"
                              onChange={(e) => handleUpdateItem(section.id, item.id, { description: e.target.value })}
                            />
                            
                            {/* Veg toggle & availability */}
                            <div className="flex items-center justify-between text-xs py-1.5 border-t border-[#22222E]">
                              <div className="flex space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(section.id, item.id, { isVeg: true })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.isVeg === true ? "bg-emerald-500/20 text-emerald-400" : "bg-[#1E1E26] text-slate-400"
                                  }`}
                                >
                                  Veg
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(section.id, item.id, { isVeg: false })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.isVeg === false ? "bg-rose-500/20 text-rose-400" : "bg-[#1E1E26] text-slate-400"
                                  }`}
                                >
                                  Non-Veg
                                </button>
                              </div>

                              <label className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.isAvailable}
                                  onChange={(e) => handleUpdateItem(section.id, item.id, { isAvailable: e.target.checked })}
                                  className="accent-rose-500"
                                />
                                <span className="text-[10px] text-slate-300 font-medium">Available</span>
                              </label>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <h4 className="font-extrabold text-white text-sm md:text-base leading-tight">
                                {item.name}
                              </h4>
                              <span className="font-extrabold text-white text-sm whitespace-nowrap">
                                {item.currency === "USD" ? "$" : item.currency === "EUR" ? "€" : "₹"}
                                {item.price}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                              {item.description || "No description provided."}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Item Availability status badge in Preview Mode */}
                      {mode === "view" && (
                        <div className="flex items-center justify-between pt-3 border-t border-[#1E1E24]/60 text-[10px]">
                          <span className={`${item.isAvailable ? "text-emerald-400" : "text-rose-400"} font-medium`}>
                            {item.isAvailable ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Item Trigger */}
                {mode === "edit" && (
                  <button
                    onClick={() => handleAddItem(section.id)}
                    className="w-full py-3.5 rounded-2xl border border-dashed border-[#2D2D38] hover:border-slate-500 hover:text-white text-xs font-bold text-slate-400 transition-all flex items-center justify-center space-x-1.5 bg-[#121218]/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item to {section.name}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
