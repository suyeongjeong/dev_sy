import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ContactsScreen from './src/screens/ContactsScreen';
import SendSMSScreen from './src/screens/SendSMSScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';

            if (route.name === 'Contacts') {
              iconName = 'contacts';
            } else if (route.name === 'SendSMS') {
              iconName = 'message';
            } else if (route.name === 'History') {
              iconName = 'history';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen
          name="Contacts"
          component={ContactsScreen}
          options={{ title: '연락처' }}
        />
        <Tab.Screen
          name="SendSMS"
          component={SendSMSScreen}
          options={{ title: '문자발송' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: '발송이력' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
