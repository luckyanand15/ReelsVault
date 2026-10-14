import { createNavigationContainerRef } from '@react-navigation/native';

// Lets code outside screens (e.g. AuthContext) navigate.
export const navigationRef = createNavigationContainerRef();

export const resetTo = routeName => {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: routeName }] });
  }
};
