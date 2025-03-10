import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../navigation/ProfileStack';

type HelpSupportScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'HelpSupport'
>;

type FAQItem = {
  question: string;
  answer: string;
  isExpanded: boolean;
};

export function HelpSupportScreen() {
  const navigation = useNavigation<HelpSupportScreenNavigationProp>();
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      question: 'How do I book a ride?',
      answer:
        'To book a ride, simply open the app, enter your destination, choose your preferred vehicle type, and tap "Book Now". You can track your ride in real-time once confirmed.',
      isExpanded: false,
    },
    {
      question: 'How do I contact my driver?',
      answer:
        'Once your ride is confirmed, you can contact your driver through the app using the chat or call feature. Their contact information will be available in the ride details.',
      isExpanded: false,
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We accept various payment methods including credit/debit cards, PayPal, and other digital payment solutions. You can manage your payment methods in the app settings.',
      isExpanded: false,
    },
    {
      question: 'How do I report an issue with my ride?',
      answer:
        'You can report an issue through the app by going to your ride history, selecting the specific ride, and tapping "Report an Issue". Our support team will assist you promptly.',
      isExpanded: false,
    },
  ]);

  const toggleFAQ = (index: number) => {
    setFaqItems(prev =>
      prev.map((item, i) => ({
        ...item,
        isExpanded: i === index ? !item.isExpanded : false,
      })),
    );
  };

  const handleChatSupport = () => {
    // TODO: Implement chat support
    Alert.alert('Chat Support', 'This feature will be available soon!');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@example.com').catch(() => {
      Alert.alert('Error', 'Could not open email client');
    });
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890').catch(() => {
      Alert.alert('Error', 'Could not open phone app');
    });
  };

  const handleUserGuide = () => {
    // TODO: Implement user guide
    Alert.alert('User Guide', 'This feature will be available soon!');
  };

  const handleVideoTutorials = () => {
    // TODO: Implement video tutorials
    Alert.alert('Video Tutorials', 'This feature will be available soon!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleChatSupport}>
            <View style={styles.contactInfo}>
              <Icon name="chat" size={24} color="#007AFF" />
              <Text style={styles.contactText}>Chat with Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmailSupport}>
            <View style={styles.contactInfo}>
              <Icon name="email" size={24} color="#007AFF" />
              <Text style={styles.contactText}>Email Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleCallSupport}>
            <View style={styles.contactInfo}>
              <Icon name="phone" size={24} color="#007AFF" />
              <Text style={styles.contactText}>Call Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Icon
                  name={item.isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#666"
                />
              </View>
              {item.isExpanded && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help Center</Text>
          <TouchableOpacity style={styles.helpItem} onPress={handleUserGuide}>
            <View style={styles.helpInfo}>
              <Icon name="book-open-variant" size={24} color="#333" />
              <Text style={styles.helpText}>User Guide</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpItem}
            onPress={handleVideoTutorials}>
            <View style={styles.helpInfo}>
              <Icon name="video" size={24} color="#333" />
              <Text style={styles.helpText}>Video Tutorials</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    lineHeight: 20,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  helpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});
