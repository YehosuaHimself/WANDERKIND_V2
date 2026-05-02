import { navigate } from '../lib/router.js';
export default async function render() {
  navigate('me/verification', { replace: true });
  return document.createElement('div');
}
