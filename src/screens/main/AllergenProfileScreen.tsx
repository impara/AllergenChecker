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
import { List, Title, Switch, TextInput, Snackbar, Divider } from 'react-native-paper';
import Animated, { FadeInUp, AnimateProps } from 'react-native-reanimated';
import { getUserAllergens, updateUserAllergens, AllergenProfile } from '../../config/firebase';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { MaterialCommunityIcons } from '@expo/vector-icons';


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
    <>
      <ScrollView style={styles.container}>
        <Title style={styles.title}></Title>

        <View style={styles.customAllergenContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.customAllergenInput}
              value={newAllergen}
              onChangeText={setNewAllergen}
              placeholder="Add custom allergen"
              onSubmitEditing={addCustomAllergen}
              returnKeyType="done"
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
              <List.Item
                title={allergen}
                titleStyle={styles.allergenText}
                right={() => (
                  <Switch
                    value={checkedAllergens[allergen]?.selected || false}
                    onValueChange={() => toggleAllergen(allergen)}
                    color="#6200ee"
                  />
                )}
              />
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
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Slightly lighter background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    margin: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  customAllergenContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customAllergenInput: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light background for input field
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50, // Adjust height for better appearance
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#6200ee', // Use your primary color
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    backgroundColor: '#dd2c00',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  allergenText: {
    fontSize: 18,
    color: '#333', // Darker color for better contrast
    fontWeight: '500', // Slightly bold for better readability
  },
  divider: {
    backgroundColor: '#e0e0e0', // Subtle line color for separators
    height: 1,
    marginHorizontal: 16,
  },
  snackbar: {
    backgroundColor: '#333', // Darker background for snackbar
    color: '#fff',
  },
});

export default AllergenProfileScreen;

