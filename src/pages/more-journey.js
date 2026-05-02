import { navigate } from '../lib/router.js';
export default async function render() {
  navigate('me/journey', { replace: true });
  return document.createElement('div');
}
