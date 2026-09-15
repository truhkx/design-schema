import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{b as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{t(),i(),a(),o={title:`Toast/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`dismiss`]}},argTypes:{tone:{control:`select`,options:[`neutral`,`success`,`warning`,`danger`]},duration:{control:`select`,options:[`short`,`long`,`persistent`]},dismissible:{control:`boolean`}},args:{message:`Message sent`,tone:`neutral`,duration:`short`,dismissible:!0},render:e=>n`
    <ds-toast
      message=${e.message}
      tone=${e.tone}
      action-label=${r(e.actionLabel)}
      duration=${e.duration}
      ?no-dismiss=${!e.dismissible}
    ></ds-toast>
  `},s={},c={args:{tone:`neutral`,message:`Preferences updated`}},l={args:{tone:`success`,message:`Message sent`}},u={args:{tone:`warning`,message:`Connection is unstable`}},d={args:{tone:`danger`,message:`Export failed`,duration:`persistent`}},f={args:{duration:`short`}},p={args:{duration:`long`}},m={args:{duration:`persistent`}},h={args:{message:`3 files moved to Archive`,actionLabel:`Undo`,duration:`persistent`}},g={args:{message:`Syncing…`,dismissible:!1}},_={render:()=>n`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-toast-region style="position: static; inset: auto;">
        <ds-toast message="3 files moved to Archive" action-label="Undo" duration="persistent"></ds-toast>
      </ds-toast-region>
      <button type="button">After</button>
    </div>
  `},v=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`DurationShort`,`DurationLong`,`DurationPersistent`,`WithAction`,`NotDismissible`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'neutral',
    message: 'Preferences updated'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    message: 'Message sent'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    message: 'Connection is unstable'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    message: 'Export failed',
    duration: 'persistent'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'short'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'long'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'persistent'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    message: '3 files moved to Archive',
    actionLabel: 'Undo',
    duration: 'persistent'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Syncing…',
    dismissible: false
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-toast-region style="position: static; inset: auto;">
        <ds-toast message="3 files moved to Archive" action-label="Undo" duration="persistent"></ds-toast>
      </ds-toast-region>
      <button type="button">After</button>
    </div>
  \`
}`,..._.parameters?.docs?.source},description:{story:"Renders present alongside its region and three focusable siblings, so the\r\nkeyboard gate can verify `F6` moves focus into the toast's action and\r\ndismiss buttons, `Escape` dismisses and returns focus, and `Tab` moves\r\nbetween the two buttons and out again.",..._.parameters?.docs?.description}}}})))()}y();export{s as Default,p as DurationLong,m as DurationPersistent,f as DurationShort,_ as Keyboard,g as NotDismissible,d as ToneDanger,c as ToneNeutral,l as ToneSuccess,u as ToneWarning,h as WithAction,v as __namedExportsOrder,o as default};