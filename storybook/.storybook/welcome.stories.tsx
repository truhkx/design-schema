import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Welcome = () => (
  <main style={{ fontFamily: 'system-ui', maxWidth: 640, lineHeight: 1.5 }}>
    <h1>Design Schema previews</h1>
    <p>
      Every component is generated from one Markdown doc for three platforms. Use the sidebar to open the same
      story under React, Lit, and React Native and compare them; the Mode toolbar switches light and dark
      everywhere.
    </p>
  </main>
);

const meta = { title: 'Welcome', component: Welcome } satisfies Meta<typeof Welcome>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
