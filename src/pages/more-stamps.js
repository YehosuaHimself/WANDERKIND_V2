import { navigate } from '../lib/router.js';
export default async function render() {
  navigate('me/stamps-overview', { replace: true });
  return document.createElement('div');
}
