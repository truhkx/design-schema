import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Text-Dgpz9DWN.js";import{t as o}from"./Link-CFGwxdql.js";import{E as s}from"./iframe-CsoUKhN4.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),i(),s(),o(),a(),c={title:`Alert/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`dismiss`]}},argTypes:{tone:{control:`select`,options:[`info`,`success`,`warning`,`danger`]},live:{control:`select`,options:[`status`,`alert`,`off`]},dismissible:{control:`boolean`}},args:{tone:`info`,heading:`Changes saved`,live:`off`,dismissible:!1,body:`Your notification preferences apply to every device you are signed in on.`},render:e=>n`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert
        tone=${e.tone}
        live=${e.live}
        heading=${r(e.heading)}
        ?dismissible=${e.dismissible}
        @dismiss=${e=>e.target.remove()}
      >
        <ds-text>${e.body}</ds-text>
      </ds-alert>
    </div>
  `},l={},u={args:{tone:`info`,heading:`Scheduled maintenance`,body:`Sync pauses on Sunday from 02:00 to 03:00 UTC.`}},d={args:{tone:`success`,heading:`Changes saved`,body:`Your preferences are up to date.`}},f={args:{tone:`warning`,heading:`Trial ends in 3 days`,body:`Add a payment method to keep your workspace after the trial.`}},p={args:{tone:`danger`,live:`alert`,heading:`Payment failed`,body:`The card ending in 4242 was declined. Update the card or try another one.`}},m={args:{live:`status`,tone:`success`}},h={args:{live:`alert`,tone:`danger`,heading:`Payment failed`}},g={args:{live:`off`}},_={args:{dismissible:!0}},v={args:{heading:void 0,body:`You are offline. Changes will sync when you reconnect.`}},y={render:e=>n`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=${e.tone} live=${e.live} heading="Trial ends in 3 days" ?dismissible=${e.dismissible}>
        <ds-text
          >Add a payment method to keep your workspace.
          <ds-link href="#billing" label="Go to billing"></ds-link></ds-text
        >
      </ds-alert>
    </div>
  `},b={render:e=>n`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=${e.tone} live=${e.live} ?dismissible=${e.dismissible}>
        <span slot="heading">2 of 3 invitations sent</span>
        <ds-text>One address was rejected by the recipient's server.</ds-text>
      </ds-alert>
    </div>
  `},x=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`LiveStatus`,`LiveAlert`,`LiveOff`,`DismissibleTrue`,`WithoutHeading`,`WithLink`,`RichHeading`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    heading: 'Scheduled maintenance',
    body: 'Sync pauses on Sunday from 02:00 to 03:00 UTC.'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    heading: 'Changes saved',
    body: 'Your preferences are up to date.'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Trial ends in 3 days',
    body: 'Add a payment method to keep your workspace after the trial.'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    live: 'alert',
    heading: 'Payment failed',
    body: 'The card ending in 4242 was declined. Update the card or try another one.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'status',
    tone: 'success'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'alert',
    tone: 'danger',
    heading: 'Payment failed'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'off'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    heading: undefined,
    body: 'You are offline. Changes will sync when you reconnect.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=\${args.tone} live=\${args.live} heading="Trial ends in 3 days" ?dismissible=\${args.dismissible}>
        <ds-text
          >Add a payment method to keep your workspace.
          <ds-link href="#billing" label="Go to billing"></ds-link></ds-text
        >
      </ds-alert>
    </div>
  \`
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=\${args.tone} live=\${args.live} ?dismissible=\${args.dismissible}>
        <span slot="heading">2 of 3 invitations sent</span>
        <ds-text>One address was rejected by the recipient's server.</ds-text>
      </ds-alert>
    </div>
  \`
}`,...b.parameters?.docs?.source}}}})))()}S();export{l as Default,_ as DismissibleTrue,h as LiveAlert,g as LiveOff,m as LiveStatus,b as RichHeading,p as ToneDanger,u as ToneInfo,d as ToneSuccess,f as ToneWarning,y as WithLink,v as WithoutHeading,x as __namedExportsOrder,c as default};