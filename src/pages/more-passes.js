import { navigate } from '../lib/router.js';
export default async function render() {
  navigate('me/passes', { replace: true });
  return document.createElement('div');
}
