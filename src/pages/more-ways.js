import { navigate } from '../lib/router.js';
export default async function render() {
  navigate('myway', { replace: true });
  return document.createElement('div');
}
