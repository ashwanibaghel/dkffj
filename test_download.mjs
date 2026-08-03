import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tgszzjbvpcznndrfkkov.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function testDownload() {
  const { data, error } = await supabase.storage.from('aadhaar').download('cpal0314_gmail_com_1785742726422/idproof_1785742726423.jpg');
  if (error) {
    console.error('Download error:', error);
  } else {
    console.log('Success! File size:', data.size, 'type:', data.type);
  }
}
testDownload();
