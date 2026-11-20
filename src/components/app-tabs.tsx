import { NativeTabs } from 'expo-router/native-tabs';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';

import { FloatingSessionBar } from '@/components/ui/floating-session-bar';
import { Colors } from '@/constants/theme';
import { StudySessionProvider } from '@/context/study-session-context';
import { SubjectsProvider } from "@/context/subjects-context";
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (

    <View style={styles.container}>
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        iconColor={{ default: colors.textSecondary, selected: colors.accent }}
        labelStyle={{ selected: { color: colors.text } }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require('@/assets/images/tabIcons/home.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="estudiar">
          <NativeTabs.Trigger.Label>Estudiar</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require('@/assets/images/tabIcons/library.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="mi-perfil">
          <NativeTabs.Trigger.Label>Yo</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={require('@/assets/images/tabIcons/user.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      </NativeTabs>

      <FloatingSessionBar tabBarHeight={Platform.OS === 'ios' ? 66 : 64} />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});