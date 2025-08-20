import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: false,
	prerender: false,
	clientOnly: true,
	buildDirectory: 'build/client',
} satisfies Config;
