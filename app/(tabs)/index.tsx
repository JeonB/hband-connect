import { Redirect } from 'expo-router';

/**
 * Root index: always redirect to intro so the app opens on inPHR intro, not the template tabs.
 */
export default function Index() {
  return <Redirect href="/connect" />;
}
