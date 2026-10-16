import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import rpcHandler from './api/genlayer-rpc.mjs';
export default defineConfig({plugins:[react(),{name:'slatefold-read-proxy',configureServer(server){server.middlewares.use('/genlayer-rpc',rpcHandler);}}],server:{port:5177},test:{environment:'jsdom',include:['src/**/*.test.{ts,tsx}'],restoreMocks:true}});
