Add a device-runnable Storybook for the React Native package so the components can be verified with VoiceOver and TalkBack, not only in react-native-web:

1. apps/rn-storybook: an Expo app (latest SDK compatible with the installed react-native; if the workspace's react-native version is incompatible with Expo, say so and stop rather than upgrading anything) using @storybook/react-native (on-device UI), pointing at packages/rn/src/**/*.stories.tsx via the storybook.requires file. Include react-native-svg (job 80). The app wraps stories in the package's ThemeProvider with a theme + mode switcher in the Storybook addons panel (calm-precise / warm-friendly, light / dark).
2. Root scripts: `storybook:device` that starts Expo (`expo start`) and prints the QR code; document in README.md how to open it in Expo Go on a phone on the same network.
3. Keep the existing react-native-web Storybook (port 6009) as is; the gates keep using it.
Do not modify anything under packages/*/src or generated/. Run `pnpm --filter rn-storybook typecheck` (add the script) and make it pass.
