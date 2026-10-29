import { useEffect, useState } from 'react';
import supabase from '../config/supabaseClient';

export default function TestConnection() {
    const [status, setStatus] = useState<string>('Testing...');

    useEffect(() => {
        const run = async () => {
            // Test 1: Auth service reachable
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth error:', error);
                setStatus(`❌ Error: ${error.message}`);
                return;
            }

            console.log('Auth response:', data);
            setStatus('✅ Connected to Supabase');
        };

        run();
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            <h1>Supabase Connection Test</h1>
            <p>{status}</p>
        </div>
    );
}