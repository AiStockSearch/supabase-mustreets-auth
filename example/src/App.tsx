import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Component, WrapperAuthContext } from '@supabase/mustreets-auth'



export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  return (
    <WrapperAuthContext oldContext={{}}>
      <View style={styles.container}>
        <Component />
      </View>
    </WrapperAuthContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
