import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { INGREDIENTS, DISHES, MOCK_PATIENT_USER } from './constants';

export async function setupDemoData() {
  // Add mock patient user
  try {
    await setDoc(doc(db, 'users', MOCK_PATIENT_USER.id), {
      uid: MOCK_PATIENT_USER.id,
      email: `${MOCK_PATIENT_USER.username}@example.com`,
      displayName: MOCK_PATIENT_USER.name,
      role: 'patient',
      photoURL: MOCK_PATIENT_USER.avatar
    });
  } catch (err) {
    console.error('Error creating mock user:', err);
    // Don't throw here to allow other data to try and load
  }

  // Add ingredients
  for (const ingredient of INGREDIENTS) {
    try {
      await setDoc(doc(db, 'ingredients', ingredient.id), ingredient);
    } catch (err) {
      console.error(`Error creating ingredient ${ingredient.name}:`, err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `ingredients/${ingredient.id}`);
      } catch (e) {
        // Logged but not re-thrown to continue loop
      }
    }
  }

  // Add dishes
  for (const dish of DISHES) {
    try {
      await setDoc(doc(db, 'dishes', dish.id), dish);
    } catch (err) {
      console.error(`Error creating dish ${dish.name}:`, err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `dishes/${dish.id}`);
      } catch (e) {
        // Logged but not re-thrown to continue loop
      }
    }
  }
}
