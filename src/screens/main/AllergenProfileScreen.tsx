import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  ViewProps,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { List, Title, Switch, Snackbar, Divider } from 'react-native-paper';
import Animated, { FadeInUp, AnimateProps } from 'react-native-reanimated';
import { getUserAllergens, updateUserAllergens, AllergenProfile } from '../../config/firebase';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import { SafeAreaView } from 'react-native-safe-area-context';

const defaultAllergens = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
];

const AnimatedView = Animated.createAnimatedComponent(View) as React.ComponentType<
  AnimateProps<ViewProps> & {
    children?: React.ReactNode;
  }
>;

const AllergenProfileScreen: React.FC = () => {
  const [checkedAllergens, setCheckedAllergens] = useState<AllergenProfile>({});
  const [allergenList, setAllergenList] = useState<string[]>(defaultAllergens);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const undoActionRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAllergen, setNewAllergen] = useState('');

  useEffect(() => {
    loadAllergenProfile();
  }, []);

  const loadAllergenProfile = async () => {
    try {
      const userAllergens = await getUserAllergens();
      setCheckedAllergens(userAllergens);

      // Get all allergens (default + custom) from user's allergen profile
      const allUserAllergens = Object.keys(userAllergens);
      const customAllergens = allUserAllergens.filter((key) => !defaultAllergens.includes(key));

      // Update the allergen list with custom allergens at the top
      setAllergenList([...customAllergens, ...defaultAllergens]);
    } catch (error) {
      console.error('Error loading allergen profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAllergen = async (allergen: string) => {
    const updatedAllergens = {
      ...checkedAllergens,
      [allergen]: {
        selected: !checkedAllergens[allergen]?.selected,
      },
    };
    setCheckedAllergens(updatedAllergens as AllergenProfile);
    await saveAllergenProfile(updatedAllergens as AllergenProfile);
    
    // Add toast message for toggling allergen
    showSnackbar(`${allergen} ${updatedAllergens[allergen].selected ? 'enabled' : 'disabled'}`);
  };

  const saveAllergenProfile = async (allergens: AllergenProfile) => {
    try {
      // Remove properties with undefined values
      const cleanedAllergens = Object.fromEntries(
        Object.entries(allergens).filter(([_, value]) => value !== undefined)
      );
      await updateUserAllergens(cleanedAllergens);
    } catch (error) {
      console.error('Error saving allergen profile:', error);
      Alert.alert('Error', 'Failed to save allergen profile.');
    }
  };  

  const addCustomAllergen = () => {
    const trimmedAllergen = newAllergen.trim();
    const allergenExists = allergenList.some(
      (item) => item.toLowerCase() === trimmedAllergen.toLowerCase()
    );

    if (trimmedAllergen !== '' && !allergenExists) {
      const updatedAllergenList = [trimmedAllergen, ...allergenList];
      setAllergenList(updatedAllergenList);

      const updatedAllergens = {
        ...checkedAllergens,
        [trimmedAllergen]: {
          selected: true,
        },
      };
      setCheckedAllergens(updatedAllergens as AllergenProfile);
      saveAllergenProfile(updatedAllergens as AllergenProfile);
      setNewAllergen('');
      showSnackbar('Allergen added');
    } else if (allergenExists) {
      Alert.alert('Allergen already exists', 'This allergen is already in your list.');
    } else {
      Alert.alert('Invalid Input', 'Please enter an allergen name.');
    }
  };

  const deleteAllergen = (allergen: string) => {
    Alert.alert(
      'Delete Allergen',
      `Are you sure you want to delete "${allergen}" from your allergen list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedAllergenList = allergenList.filter((item) => item !== allergen);
            const previousAllergenData = checkedAllergens[allergen];
            setAllergenList(updatedAllergenList);

            const updatedAllergens = { ...checkedAllergens };
            delete updatedAllergens[allergen];
            setCheckedAllergens(updatedAllergens);

            await saveAllergenProfile(updatedAllergens);

            undoActionRef.current = () => {
              setAllergenList([allergen, ...updatedAllergenList]);
              setCheckedAllergens({
                ...updatedAllergens,
                [allergen]: previousAllergenData,
              });
              saveAllergenProfile({
                ...updatedAllergens,
                [allergen]: previousAllergenData,
              });
            };

            showSnackbar('Allergen deleted');
          },
        },
      ]
    );
  };

  const renderRightActions = (progress: any, dragX: any, allergen: string) => {
    return (
      <View style={styles.rightAction}>
        <Text style={styles.actionText}>Delete</Text>
      </View>
    );
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setIsSnackbarVisible(true);
  };

  const onDismissSnackbar = () => {
    setIsSnackbarVisible(false);
    undoActionRef.current = null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Title>Loading...</Title>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.customAllergenContainer}>
          <View style={styles.inputRow}>
            <Input
              value={newAllergen}
              onChangeText={setNewAllergen}
              placeholder="Add custom allergen"
              placeholderTextColor="#A0A0A0"
              style={styles.input}
            />
            <TouchableOpacity onPress={addCustomAllergen} style={styles.addButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {allergenList.map((allergen, index) => (
          <AnimatedView
            key={allergen}
            entering={FadeInUp.delay(index * 50).duration(300).springify()}
          >
            <Swipeable
              renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, allergen)}
              onSwipeableRightOpen={() => deleteAllergen(allergen)}
            >
              <View style={styles.allergenItem}>
                <List.Item
                  title={allergen}
                  titleStyle={styles.allergenText}
                  right={() => (
                    <Switch
                      value={checkedAllergens[allergen]?.selected || false}
                      onValueChange={() => toggleAllergen(allergen)}
                      color="#6750A4"
                    />
                  )}
                />
              </View>
              <Divider style={styles.divider} />
            </Swipeable>
          </AnimatedView>
        ))}
      </ScrollView>

      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={onDismissSnackbar}
        action={
          undoActionRef.current
            ? {
                label: 'Undo',
                onPress: () => {
                  if (undoActionRef.current) {
                    undoActionRef.current();
                    undoActionRef.current = null;
                  }
                },
              }
            : undefined
        }
        duration={5000}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8, // Reduced top padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24, // Slightly reduced font size
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16, // Reduced bottom margin
    textAlign: 'center',
  },
  customAllergenContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0, // Explicitly set border width to 0
  },
  addButton: {
    backgroundColor: '#6750A4',
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  allergenItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rightAction: {
    backgroundColor: '#ff3d00',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    padding: 20,
  },
  allergenText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 0,
  },
  snackbar: {
    backgroundColor: '#323232',
  },
  snackbarText: {
    color: '#ffffff',
  },
});

export default AllergenProfileScreen;