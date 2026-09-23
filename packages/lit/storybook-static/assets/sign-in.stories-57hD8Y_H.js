import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{n as r}from"./iframe-C6sywzE2.js";function i(){return n`
    <ds-stack gap="6" align="stretch">
      <ds-stack gap="1">
        <ds-heading level="1">Sign in</ds-heading>
        <ds-text tone="muted">Use the email you signed up with.</ds-text>
      </ds-stack>

      <ds-form name="sign-in" label="Sign in">
        <ds-input
          label="Email address"
          name="email"
          type="email"
          autocomplete="email"
          required
        ></ds-input>
        <ds-input
          label="Password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        ></ds-input>
        <ds-stack direction="horizontal" gap="2" align="center" justify="between" wrap>
          <ds-button type="submit" label="Sign in"></ds-button>
          <ds-button variant="ghost" label="Forgot password?"></ds-button>
        </ds-stack>
      </ds-form>
    </ds-stack>
  `}function a(){return(a=e((()=>{t(),r()})))()}var o,s,c,l;function u(){return(u=e((()=>{t(),a(),o={title:`Demo/Sign in/Lit`,parameters:{actions:{handles:[`submit`,`invalid`,`press`]},layout:`centered`},render:()=>n`<div style="inline-size: min(100%, 24rem)">${i()}</div>`},s={},c={render:()=>n`
    <div data-mode="dark" style="inline-size: min(100%, 24rem); padding: var(--space-6); background: var(--color-background)">
      ${i()}
    </div>
  `},l=[`Default`,`DarkMode`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div data-mode="dark" style="inline-size: min(100%, 24rem); padding: var(--space-6); background: var(--color-background)">
      \${renderSignIn()}
    </div>
  \`
}`,...c.parameters?.docs?.source}}}})))()}u();export{c as DarkMode,s as Default,l as __namedExportsOrder,o as default};