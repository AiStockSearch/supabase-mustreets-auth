import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuthHook } from './useAuthHooks';

const AUTH_CONTEXT = 'AUTH_CONTEXT';
const ReactAuthContext = React.createContext(AUTH_CONTEXT);

const WrapperAuthContext = (props: {
  children: React.ReactNode;
  oldContext: any;
}) => {
  const value = useAuthHook() as any;
  const valueProvider = Object.assign([props.oldContext ?? {}, value]);

  return (
    <React.StrictMode>
      <ReactAuthContext.Provider value={valueProvider}>
        <View style={StyleSheet.absoluteFill}>
          {props.children}
        </View>
      </ReactAuthContext.Provider>
    </React.StrictMode>
  );
};

const Screen = React.lazy(() => import('./screen'))

const Component = (props: React.JSX.IntrinsicAttributes) => {
  return (
    <React.Suspense fallback={<View />}>
      <Screen {...props} />
    </React.Suspense>
  )
}

export {
  AUTH_CONTEXT,
  ReactAuthContext,
  Component,
  WrapperAuthContext,
  useAuthHook
};

