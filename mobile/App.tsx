import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert,
  Dimensions,
  Platform,
  StatusBar
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { DigiDishClient, Restaurant, Menu, MenuSection, MenuItem } from "./src/api-client";

const { width } = Dimensions.get("window");

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://192.168.1.100:3000"); // Update with your local IP
  const [client, setClient] = useState<DigiDishClient | null>(null);

  // App navigation state
  const [currentScreen, setCurrentScreen] = useState<"home" | "camera" | "processing" | "viewer">("home");

  // Domain states
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [activeMenu, setActiveMenu] = useState<(Menu & { sections: MenuSection[] }) | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showConfigModal, setShowConfigModal] = useState(false);

  const cameraRef = useRef<any>(null);

  // Initialize client on baseUrl change
  useEffect(() => {
    setClient(new DigiDishClient(apiBaseUrl));
  }, [apiBaseUrl]);

  // Load initial data
  useEffect(() => {
    if (client) {
      loadRestaurants();
    }
  }, [client]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await client!.getRestaurants();
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestId(data[0].id);
        loadMenus(data[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.warn("Could not load restaurants. BaseURL might be incorrect:", err);
      setIsLoading(false);
    }
  };

  const loadMenus = async (restId: string) => {
    setIsLoading(true);
    try {
      const data = await client!.getRestaurantMenus(restId);
      setMenus(data);
    } catch (err) {
      console.warn("Could not load menus:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRestaurant = (restId: string) => {
    setSelectedRestId(restId);
    loadMenus(restId);
  };

  // Launch gallery picker
  const pickImage = async () => {
    if (!selectedRestId) {
      Alert.alert("Required", "Please select a restaurant first.");
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "We need access to your photos to upload menus.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      const asset = result.assets[0];
      const base64Data = `data:image/jpeg;base64,${asset.base64}`;
      const fileName = asset.uri.split("/").pop() || "menu.jpg";
      uploadAndProcessMenu(base64Data, fileName);
    }
  };

  // Launch Camera Screen
  const openCamera = async () => {
    if (!selectedRestId) {
      Alert.alert("Required", "Please select a restaurant first.");
      return;
    }

    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert("Permission Required", "Camera permission is needed to snap menu photos.");
        return;
      }
    }
    setCurrentScreen("camera");
  };

  // Snap photo
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setProcessingStep("Capturing high-res image...");
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo.base64) {
          setCurrentScreen("processing");
          const base64Data = `data:image/jpeg;base64,${photo.base64}`;
          uploadAndProcessMenu(base64Data, "camera_capture.jpg");
        }
      } catch (err) {
        Alert.alert("Camera Error", "Failed to take photo: " + (err as Error).message);
        setCurrentScreen("home");
      }
    }
  };

  // Connects base64 to Next.js API
  const uploadAndProcessMenu = async (base64Data: string, fileName: string) => {
    setCurrentScreen("processing");
    
    // Simulate mobile progress logs
    const progressLogs = [
      "Uploading document buffer to Server...",
      "Analyzing layout via GPT Vision...",
      "Extracting structured sections & items...",
      "Validating output contract...",
      "Syncing relations with Database..."
    ];

    let logIdx = 0;
    setProcessingStep(progressLogs[0]);
    const timer = setInterval(() => {
      if (logIdx < progressLogs.length - 1) {
        logIdx++;
        setProcessingStep(progressLogs[logIdx]);
      }
    }, 900);

    try {
      const result = await client!.uploadMenu(
        selectedRestId!,
        base64Data,
        fileName,
        "Mobile Scan Menu"
      );
      
      clearInterval(timer);
      
      // Load menu details directly
      viewMenuDetails(result.menu.id);
    } catch (err) {
      clearInterval(timer);
      console.error(err);
      Alert.alert("Upload Failed", "API pipeline failed. Check server logs.");
      setCurrentScreen("home");
      if (selectedRestId) loadMenus(selectedRestId);
    }
  };

  const viewMenuDetails = async (menuId: string) => {
    setIsLoading(true);
    try {
      const menu = await client!.getMenu(menuId);
      setActiveMenu(menu as any);
      if (menu.sections.length > 0) {
        setActiveTab(menu.sections[0].id);
      }
      setCurrentScreen("viewer");
    } catch (err) {
      Alert.alert("Error", "Could not retrieve menu details: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      {/* Screen Router */}
      
      {/* 1. HOME SCREEN */}
      {currentScreen === "home" && (
        <View style={styles.screen}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>D</Text>
              </View>
              <Text style={styles.headerTitle}>DIGIDISH</Text>
            </View>

            <TouchableOpacity 
              style={styles.configBtn} 
              onPress={() => setShowConfigModal(true)}
            >
              <Text style={styles.configBtnText}>Config Server</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            
            {/* Restaurant dropdown select */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Select Restaurant</Text>
              <View style={styles.pickerContainer}>
                {restaurants.length === 0 ? (
                  <Text style={styles.emptyText}>No restaurants discovered. Tap Config Server.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
                    {restaurants.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => handleSelectRestaurant(r.id)}
                        style={[
                          styles.chip,
                          selectedRestId === r.id && styles.chipActive
                        ]}
                      >
                        <Text style={[
                          styles.chipText,
                          selectedRestId === r.id && styles.chipTextActive
                        ]}>
                          {r.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Actions card */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Scan Physical Menu</Text>
              <Text style={styles.cardDesc}>
                Take a picture of a printed food menu card to generate a clean structured view.
              </Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={openCamera}>
                  <Text style={styles.actionBtnText}>Open Camera</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={pickImage}>
                  <Text style={styles.actionBtnTextSecondary}>Import Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Digitized listings */}
            <View style={styles.listingsSection}>
              <Text style={styles.listingsHeader}>Recent Digitizations</Text>
              
              {isLoading ? (
                <ActivityIndicator size="small" color="#F43F5E" style={{ marginVertical: 20 }} />
              ) : menus.length === 0 ? (
                <Text style={styles.emptyListText}>No digitized menus yet for this restaurant.</Text>
              ) : (
                menus.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.menuRow}
                    onPress={() => viewMenuDetails(m.id)}
                  >
                    <View>
                      <Text style={styles.menuRowTitle}>{m.title}</Text>
                      <Text style={styles.menuRowDate}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.menuRowRight}>
                      <Text style={[
                        styles.statusBadge,
                        m.status === "published" && styles.statusPublished,
                        m.status === "ready" && styles.statusReady
                      ]}>
                        {m.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

          </ScrollView>
        </View>
      )}

      {/* 2. CAMERA SCREEN */}
      {currentScreen === "camera" && (
        <View style={styles.cameraContainer}>
          <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef}>
            <View style={styles.cameraOverlay}>
              
              <View style={styles.cameraHeader}>
                <TouchableOpacity 
                  style={styles.camCancelBtn} 
                  onPress={() => setCurrentScreen("home")}
                >
                  <Text style={styles.camCancelText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.camTitle}>Align Restaurant Menu</Text>
                <View style={{ width: 60 }} />
              </View>

              {/* Viewfinder borders */}
              <View style={styles.viewfinder} />

              <View style={styles.cameraFooter}>
                <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>

            </View>
          </CameraView>
        </View>
      )}

      {/* 3. PROCESSING LOADER SCREEN */}
      {currentScreen === "processing" && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#F43F5E" style={{ marginBottom: 20 }} />
          <Text style={styles.loaderTitle}>DIGIDISH Engine</Text>
          <Text style={styles.loaderStep}>{processingStep}</Text>
        </View>
      )}

      {/* 4. DIGITAL VIEWER (ZOMATO-STYLE) */}
      {currentScreen === "viewer" && activeMenu && (
        <View style={styles.screen}>
          {/* Header */}
          <View style={styles.viewerHeader}>
            <TouchableOpacity 
              style={styles.viewerBackBtn} 
              onPress={() => { setCurrentScreen("home"); if (selectedRestId) loadMenus(selectedRestId); }}
            >
              <Text style={styles.viewerBackText}>Home</Text>
            </TouchableOpacity>
            <View style={styles.viewerTitleGroup}>
              <Text style={styles.viewerTitle}>{activeMenu.title}</Text>
              <Text style={styles.viewerSubtitle}>Structured Menu View</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          {/* Sticky Horizontal tabs list */}
          <View style={styles.horizontalTabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeMenu.sections.map((sec) => (
                <TouchableOpacity
                  key={sec.id}
                  onPress={() => setActiveTab(sec.id)}
                  style={[
                    styles.horizontalTab,
                    activeTab === sec.id && styles.horizontalTabActive
                  ]}
                >
                  <Text style={[
                    styles.horizontalTabText,
                    activeTab === sec.id && styles.horizontalTabTextActive
                  ]}>
                    {sec.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Active section list */}
          <ScrollView style={styles.viewerList}>
            {activeMenu.sections
              .filter((sec) => sec.id === activeTab)
              .map((sec) => (
                <View key={sec.id} style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>{sec.name}</Text>
                  
                  {sec.items.length === 0 ? (
                    <Text style={styles.emptySectionText}>No dishes parsed in this category.</Text>
                  ) : (
                    sec.items.map((item) => (
                      <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemCardLeft}>
                          {/* Veg dot badging */}
                          <View style={styles.vegRow}>
                            <View style={[
                              styles.vegIndicatorBorder,
                              { borderColor: item.isVeg === true ? "#10B981" : item.isVeg === false ? "#EF4444" : "#94A3B8" }
                            ]}>
                              <View style={[
                                styles.vegIndicatorDot,
                                { backgroundColor: item.isVeg === true ? "#10B981" : item.isVeg === false ? "#EF4444" : "#94A3B8" }
                              ]} />
                            </View>
                            <Text style={styles.vegText}>
                              {item.isVeg === true ? "Vegetarian" : item.isVeg === false ? "Non-Veg" : "Dish"}
                            </Text>
                          </View>
                          
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemPrice}>
                            {item.currency === "USD" ? "$" : item.currency === "EUR" ? "€" : "₹"}
                            {item.price}
                          </Text>
                          <Text style={styles.itemDesc}>{item.description || "Freshly cooked to order."}</Text>
                        </View>
                        
                        {/* Mock image container */}
                        <View style={styles.itemCardRight}>
                          <View style={styles.mockImg}>
                            <Text style={styles.mockImgText}>Food</Text>
                          </View>
                          {!item.isAvailable && (
                            <View style={styles.soldOutOverlay}>
                              <Text style={styles.soldOutText}>SOLD OUT</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              ))}
          </ScrollView>
        </View>
      )}

      {/* CONFIG BASEURL MODAL */}
      <Modal
        visible={showConfigModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalHeader}>Server URL Configuration</Text>
            <Text style={styles.modalDesc}>
              Set the IP address of your Next.js running server (e.g. http://192.168.1.50:3000). Do not use localhost on physical devices.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={apiBaseUrl}
              onChangeText={setApiBaseUrl}
              placeholder="http://192.168.1.100:3000"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={styles.modalBtnCancel} 
                onPress={() => setShowConfigModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalBtnSave} 
                onPress={() => {
                  setShowConfigModal(false);
                  loadRestaurants();
                }}
              >
                <Text style={styles.modalBtnSaveText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#0A0A0C",
  },
  screen: {
    flex: 1,
    backgroundColor: "#0A0A0C",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E24",
    backgroundColor: "#0C0C10",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    height: 30,
    width: 30,
    backgroundColor: "#F43F5E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  configBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2D2D38",
    backgroundColor: "#13131A",
  },
  configBtnText: {
    color: "#D1D5DB",
    fontSize: 11,
    fontWeight: "bold",
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E1E24",
    backgroundColor: "#121218",
    padding: 16,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1A24",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#2C2C3A",
  },
  chipActive: {
    backgroundColor: "#F43F5E",
    borderColor: "#F43F5E",
  },
  chipText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "bold",
  },
  chipTextActive: {
    color: "#fff",
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F43F5E",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnSecondary: {
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2D2D38",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  actionBtnTextSecondary: {
    color: "#D1D5DB",
    fontWeight: "bold",
    fontSize: 13,
  },
  listingsSection: {
    marginTop: 10,
  },
  listingsHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  emptyListText: {
    fontSize: 12,
    color: "#5E5E75",
    textAlign: "center",
    marginVertical: 30,
  },
  emptyText: {
    color: "#5E5E75",
    fontSize: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E1E24",
    backgroundColor: "#121218",
    marginBottom: 12,
  },
  menuRowTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  menuRowDate: {
    color: "#5E5E75",
    fontSize: 10,
    marginTop: 4,
  },
  menuRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    fontSize: 9,
    color: "#3B82F6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusPublished: {
    color: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  statusReady: {
    color: "#F59E0B",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cameraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  camCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  camCancelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  camTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  viewfinder: {
    alignSelf: "center",
    width: width * 0.85,
    height: width * 1.1,
    borderWidth: 2,
    borderColor: "#fff",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  cameraFooter: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingBottom: 20,
  },
  shutterBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0C",
    padding: 30,
  },
  loaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  loaderStep: {
    fontSize: 12,
    color: "#F43F5E",
    textAlign: "center",
    fontWeight: "bold",
    opacity: 0.85,
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E24",
    backgroundColor: "#0C0C10",
  },
  viewerBackBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  viewerBackText: {
    color: "#F43F5E",
    fontWeight: "bold",
    fontSize: 14,
  },
  viewerTitleGroup: {
    alignItems: "center",
  },
  viewerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewerSubtitle: {
    color: "#5E5E75",
    fontSize: 10,
    marginTop: 2,
  },
  horizontalTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E24",
    backgroundColor: "#0C0C10",
    paddingVertical: 8,
  },
  horizontalTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#14141C",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#1E1E2C",
  },
  horizontalTabActive: {
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderColor: "#F43F5E",
  },
  horizontalTabText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "bold",
  },
  horizontalTabTextActive: {
    color: "#F43F5E",
  },
  viewerList: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "extrabold",
    color: "#fff",
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#F43F5E",
    paddingBottom: 4,
    width: 100,
  },
  emptySectionText: {
    fontSize: 12,
    color: "#5E5E75",
    fontStyle: "italic",
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E1E24",
    backgroundColor: "#121218",
    marginBottom: 16,
    gap: 12,
  },
  itemCardLeft: {
    flex: 1,
  },
  vegRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  vegIndicatorBorder: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderRadius: 2,
  },
  vegIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  vegText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
  },
  itemName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "extrabold",
    marginBottom: 4,
  },
  itemPrice: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  itemDesc: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "300",
  },
  itemCardRight: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  mockImg: {
    flex: 1,
    backgroundColor: "#1E1E24",
    alignItems: "center",
    justifyContent: "center",
  },
  mockImgText: {
    color: "#5E5E75",
    fontSize: 12,
    fontWeight: "bold",
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOutText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "extrabold",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalBody: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2D2D38",
    backgroundColor: "#13131A",
    padding: 20,
  },
  modalHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#1C1C24",
    borderWidth: 1,
    borderColor: "#2A2A38",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 13,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2D2D38",
  },
  modalBtnCancelText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalBtnSave: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F43F5E",
  },
  modalBtnSaveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
