import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();

  // State Variables
  const [serverUrl, setServerUrl] = useState('http://192.168.0.204:5000');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempServerUrl, setTempServerUrl] = useState('http://192.168.0.204:5000');

  const [categories, setCategories] = useState([]);
  const [reels, setReels] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingReels, setIsLoadingReels] = useState(false);

  // FAB Menu state
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Modal forms state
  const [activeModal, setActiveModal] = useState('none'); // 'none' | 'add_category' | 'edit_category' | 'add_reel' | 'edit_reel'
  
  // Category Form Inputs
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState('');

  // Reel Form Inputs
  const [reelTitleInput, setReelTitleInput] = useState('');
  const [reelUrlInput, setReelUrlInput] = useState('');
  const [reelCategoryIdInput, setReelCategoryIdInput] = useState('');
  const [editingReelId, setEditingReelId] = useState('');

  // Fetch all categories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`${serverUrl}/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Error', `Failed to connect to backend at ${serverUrl}`);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch reels for the selected category
  const fetchReels = async () => {
    setIsLoadingReels(true);
    try {
      let url = `${serverUrl}/api/reels`;
      if (selectedCategoryId && selectedCategoryId !== 'all') {
        url += `?categoryId=${selectedCategoryId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch reels');
      }
      const data = await response.json();
      setReels(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingReels(false);
    }
  };

  // Run on mount or when serverUrl changes
  useEffect(() => {
    fetchCategories();
  }, [serverUrl]);

  // Run when selected category or serverUrl changes
  useEffect(() => {
    fetchReels();
  }, [selectedCategoryId, serverUrl]);

  // Save Category
  const handleSaveCategory = async () => {
    if (!categoryNameInput.trim()) {
      Alert.alert('Validation Error', 'Category name cannot be empty');
      return;
    }

    try {
      let response;
      if (activeModal === 'add_category') {
        response = await fetch(`${serverUrl}/api/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryNameInput }),
        });
      } else {
        response = await fetch(`${serverUrl}/api/categories/${editingCategoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryNameInput }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      Alert.alert('Success', `Category ${activeModal === 'add_category' ? 'added' : 'updated'} successfully`);
      setCategoryNameInput('');
      setActiveModal('none');
      fetchCategories();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = (catId, catName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete category "${catName}"? This will also delete all saved reels in this category.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${serverUrl}/api/categories/${catId}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete category');
              }
              Alert.alert('Success', 'Category deleted');
              if (selectedCategoryId === catId) {
                setSelectedCategoryId('all');
              }
              fetchCategories();
              fetchReels();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  // Save Reel
  const handleSaveReel = async () => {
    if (!reelTitleInput.trim()) {
      Alert.alert('Validation Error', 'Reel title cannot be empty');
      return;
    }
    if (!reelUrlInput.trim()) {
      Alert.alert('Validation Error', 'Reel link URL cannot be empty');
      return;
    }
    if (!reelCategoryIdInput) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    try {
      let response;
      const payload = {
        title: reelTitleInput.trim(),
        url: reelUrlInput.trim(),
        categoryId: reelCategoryIdInput,
      };

      if (activeModal === 'add_reel') {
        response = await fetch(`${serverUrl}/api/reels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${serverUrl}/api/reels/${editingReelId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save reel');
      }

      Alert.alert('Success', `Reel ${activeModal === 'add_reel' ? 'saved' : 'updated'} successfully`);
      setReelTitleInput('');
      setReelUrlInput('');
      setReelCategoryIdInput('');
      setActiveModal('none');
      fetchReels();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Delete Reel
  const handleDeleteReel = (reelId, reelTitle) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${reelTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${serverUrl}/api/reels/${reelId}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete reel');
              }
              Alert.alert('Success', 'Reel deleted');
              fetchReels();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  // Open URL in external app/browser
  const handleOpenUrl = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', `Cannot open this link URL: ${url}`);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  // Pre-populate input values for editing
  const openEditCategoryModal = (catId, catName) => {
    setEditingCategoryId(catId);
    setCategoryNameInput(catName);
    setActiveModal('edit_category');
  };

  const openEditReelModal = (reel) => {
    setEditingReelId(reel.id);
    setReelTitleInput(reel.title);
    setReelUrlInput(reel.url);
    setReelCategoryIdInput(reel.categoryId);
    setActiveModal('edit_reel');
  };

  // Helpers for category naming mapping
  const getCategoryName = (id) => {
    const found = categories.find((c) => c.id === id);
    return found ? found.name : 'Unknown Category';
  };

  // Selected Category Object
  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>REELS VAULT</Text>
          <Text style={styles.headerSubtitle}>organize your feeds</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            setTempServerUrl(serverUrl);
            setIsSettingsOpen(true);
          }}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL CATEGORIES BAR */}
      <View style={styles.categoriesBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategoryId === 'all' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategoryId('all')}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategoryId === 'all' && styles.categoryTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryPill,
                selectedCategoryId === item.id && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategoryId(item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategoryId === item.id && styles.categoryTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ACTIVE CATEGORY BANNER (with Rename / Delete actions) */}
      <View style={styles.activeCategoryContainer}>
        <View style={styles.activeCategoryHeaderRow}>
          <Text style={styles.activeCategoryLabel}>
            {selectedCategoryId === 'all' ? 'All Saved Links' : selectedCategoryObj?.name}
          </Text>
          
          {selectedCategoryId !== 'all' && selectedCategoryObj && (
            <View style={styles.categoryActionRow}>
              <TouchableOpacity
                style={styles.categoryActionBtn}
                onPress={() => openEditCategoryModal(selectedCategoryObj.id, selectedCategoryObj.name)}
              >
                <Text style={styles.categoryActionBtnText}>✎ Rename</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.categoryActionBtn, styles.categoryActionBtnDanger]}
                onPress={() => handleDeleteCategory(selectedCategoryObj.id, selectedCategoryObj.name)}
              >
                <Text style={[styles.categoryActionBtnText, styles.categoryActionBtnTextDanger]}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.itemsCountLabel}>
          {reels.length} {reels.length === 1 ? 'link' : 'links'} found
        </Text>
      </View>

      {/* REELS LIST */}
      <View style={styles.listContainer}>
        {isLoadingReels || isLoadingCategories ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.stateText}>Loading items...</Text>
          </View>
        ) : reels.length === 0 ? (
          <View style={styles.centeredState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>Empty Category</Text>
            <Text style={styles.emptySubtitle}>No saved reels or shorts links here.</Text>
            <Text style={styles.emptySubtitle}>Tap the floating button below to save one!</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reelsScrollContent}
          >
            {reels.map((item) => (
              <View key={item.id} style={styles.reelCard}>
                <TouchableOpacity
                  style={styles.reelCardMain}
                  onPress={() => handleOpenUrl(item.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reelCardHeader}>
                    <Text style={styles.reelTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.openIndicator}>↗</Text>
                  </View>
                  <Text style={styles.reelUrl} numberOfLines={1}>{item.url}</Text>
                  
                  {selectedCategoryId === 'all' && (
                    <View style={styles.cardTag}>
                      <Text style={styles.cardTagText}>{getCategoryName(item.categoryId)}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.cardDivider} />
                
                {/* Reel Card Action Bar */}
                <View style={styles.cardActionBar}>
                  <Text style={styles.cardDate}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <View style={styles.cardActionButtons}>
                    <TouchableOpacity
                      style={styles.cardActionBtn}
                      onPress={() => openEditReelModal(item)}
                    >
                      <Text style={styles.cardActionBtnText}>✎ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cardActionBtn}
                      onPress={() => handleDeleteReel(item.id, item.title)}
                    >
                      <Text style={[styles.cardActionBtnText, styles.cardActionBtnDangerText]}>🗑 Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* FAB AND OVERLAY OPTIONS */}
      {isFabOpen && (
        <TouchableOpacity
          style={styles.fabBackdrop}
          activeOpacity={1}
          onPress={() => setIsFabOpen(false)}
        >
          <View style={styles.fabOptionsContainer}>
            <TouchableOpacity
              style={styles.fabOptionItem}
              onPress={() => {
                setIsFabOpen(false);
                setCategoryNameInput('');
                setActiveModal('add_category');
              }}
            >
              <Text style={styles.fabOptionIcon}>📁</Text>
              <Text style={styles.fabOptionText}>Add Category</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabOptionItem}
              onPress={() => {
                setIsFabOpen(false);
                setReelTitleInput('');
                setReelUrlInput('');
                // Default to selected category if not 'all'
                setReelCategoryIdInput(selectedCategoryId !== 'all' ? selectedCategoryId : (categories[0]?.id || ''));
                setActiveModal('add_reel');
              }}
            >
              <Text style={styles.fabOptionIcon}>🔗</Text>
              <Text style={styles.fabOptionText}>Add Reel Link</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* MAIN FAB */}
      <TouchableOpacity
        style={[styles.mainFab, isFabOpen && styles.mainFabOpen]}
        onPress={() => setIsFabOpen(!isFabOpen)}
        activeOpacity={0.8}
      >
        <Text style={[styles.mainFabIcon, isFabOpen && styles.mainFabIconOpen]}>
          {isFabOpen ? '✕' : '＋'}
        </Text>
      </TouchableOpacity>

      {/* MODAL: ADD / EDIT CATEGORY */}
      <Modal
        visible={activeModal === 'add_category' || activeModal === 'edit_category'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal('none')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {activeModal === 'add_category' ? 'Add New Category' : 'Rename Category'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Cooking, Coding, Workouts"
              placeholderTextColor="#999999"
              value={categoryNameInput}
              onChangeText={setCategoryNameInput}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => {
                  setCategoryNameInput('');
                  setActiveModal('none');
                }}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleSaveCategory}
              >
                <Text style={styles.modalBtnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD / EDIT REEL LINK */}
      <Modal
        visible={activeModal === 'add_reel' || activeModal === 'edit_reel'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal('none')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>
              {activeModal === 'add_reel' ? 'Add Saved Link' : 'Edit Saved Link'}
            </Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Cute dog video, React Hooks tutorial"
              placeholderTextColor="#999999"
              value={reelTitleInput}
              onChangeText={setReelTitleInput}
            />

            <Text style={styles.inputLabel}>Reel or Short URL Link</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://www.instagram.com/reel/..."
              placeholderTextColor="#999999"
              value={reelUrlInput}
              onChangeText={setReelUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Category</Text>
            {categories.length === 0 ? (
              <View style={styles.noCategoriesWarning}>
                <Text style={styles.warningText}>⚠️ Please add a category first!</Text>
              </View>
            ) : (
              <View style={styles.modalCategoryPickerContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerPillsScroll}
                >
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.pickerPill,
                        reelCategoryIdInput === c.id && styles.pickerPillActive,
                      ]}
                      onPress={() => setReelCategoryIdInput(c.id)}
                    >
                      <Text
                        style={[
                          styles.pickerPillText,
                          reelCategoryIdInput === c.id && styles.pickerPillTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={[styles.modalActions, { marginTop: 20 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => {
                  setReelTitleInput('');
                  setReelUrlInput('');
                  setReelCategoryIdInput('');
                  setActiveModal('none');
                }}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleSaveReel}
                disabled={categories.length === 0}
              >
                <Text style={styles.modalBtnPrimaryText}>Save Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: CONNECTION SETTINGS */}
      <Modal
        visible={isSettingsOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>API Server Endpoint</Text>
            <Text style={styles.inputLabel}>Backend Server URL:</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="http://192.168.0.204:5000"
              placeholderTextColor="#999999"
              value={tempServerUrl}
              onChangeText={setTempServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.settingsHint}>
              Ensure your computer and mobile phone/emulator are connected to the exact same Wi-Fi network.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setIsSettingsOpen(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => {
                  setServerUrl(tempServerUrl);
                  setIsSettingsOpen(false);
                }}
              >
                <Text style={styles.modalBtnPrimaryText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// Minimalist Monochrome Styles
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '300',
    marginTop: -2,
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  settingsIcon: {
    fontSize: 20,
    color: '#000000',
  },
  categoriesBarContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EAEAEE',
  },
  categoryPillActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  activeCategoryContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  activeCategoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCategoryLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  categoryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryActionBtnDanger: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFE0E0',
  },
  categoryActionBtnText: {
    fontSize: 12,
    color: '#444444',
    fontWeight: '600',
  },
  categoryActionBtnTextDanger: {
    color: '#D32F2F',
  },
  itemsCountLabel: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
  },
  reelsScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Safe space for floating FAB
  },
  reelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 16,
    overflow: 'hidden',
  },
  reelCardMain: {
    padding: 16,
  },
  reelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    paddingRight: 8,
  },
  openIndicator: {
    fontSize: 18,
    color: '#888888',
    fontWeight: 'bold',
  },
  reelUrl: {
    fontSize: 13,
    color: '#888888',
    marginTop: 6,
  },
  cardTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  cardTagText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  cardActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAFABA', // slightly off-white to ground it
    backgroundColor: '#FAFAFA',
  },
  cardDate: {
    fontSize: 12,
    color: '#999999',
  },
  cardActionButtons: {
    flexDirection: 'row',
  },
  cardActionBtn: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  cardActionBtnText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  cardActionBtnDangerText: {
    color: '#D32F2F',
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  stateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#888888',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  mainFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    zIndex: 999,
  },
  mainFabOpen: {
    backgroundColor: '#333333',
  },
  mainFabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  mainFabIconOpen: {
    fontSize: 18,
  },
  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 99,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fabOptionsContainer: {
    marginBottom: 96,
    marginRight: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  fabOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 160,
  },
  fabOptionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  fabOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 6,
  },
  modalContentLarge: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 6,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  modalCategoryPickerContainer: {
    height: 48,
    marginTop: 4,
  },
  pickerPillsScroll: {
    alignItems: 'center',
  },
  pickerPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerPillActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  pickerPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  pickerPillTextActive: {
    color: '#FFFFFF',
  },
  noCategoriesWarning: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEBAA',
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  modalBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444444',
  },
  modalBtnPrimary: {
    backgroundColor: '#000000',
    marginLeft: 8,
  },
  modalBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsHint: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default App;
