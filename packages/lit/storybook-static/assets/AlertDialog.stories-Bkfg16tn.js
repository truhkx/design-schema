import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{S as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{t(),i(),a(),o={title:`AlertDialog/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`confirm`,`cancel`]}},argTypes:{tone:{control:`select`,options:[`danger`,`warning`,`info`]}},args:{open:!0,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,tone:`danger`,confirmLabel:`Delete files`,cancelLabel:void 0,confirmDisabled:!1},render:e=>n`
    <ds-alert-dialog
      ?open=${e.open}
      heading=${e.heading}
      description=${e.description}
      tone=${e.tone}
      confirm-label=${e.confirmLabel}
      cancel-label=${r(e.cancelLabel)}
      ?confirm-disabled=${e.confirmDisabled}
    ></ds-alert-dialog>
  `},s={},c={args:{tone:`danger`}},l={args:{tone:`warning`,heading:`Leave without saving?`,description:`Your changes will be lost.`,confirmLabel:`Leave page`}},u={args:{tone:`info`,heading:`Switch workspaces?`,description:`You will need to sign in again to switch back.`,confirmLabel:`Switch workspace`}},d={args:{heading:`Discard draft?`,description:`Your draft will be permanently deleted.`,confirmLabel:`Discard draft`,cancelLabel:`Keep editing`}},f={args:{confirmDisabled:!0}},p={render:()=>n`
    <button type="button" id="alert-dialog-trigger">Delete files</button>
    <ds-alert-dialog
      open
      tone="danger"
      heading="Delete 3 files?"
      description="They will be removed from all shared folders. This cannot be undone."
      confirm-label="Delete files"
    ></ds-alert-dialog>
  `},m=[`Default`,`ToneDanger`,`ToneWarning`,`ToneInfo`,`CancelLabel`,`ConfirmDisabled`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes will be lost.',
    confirmLabel: 'Leave page'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    heading: 'Switch workspaces?',
    description: 'You will need to sign in again to switch back.',
    confirmLabel: 'Switch workspace'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Discard draft?',
    description: 'Your draft will be permanently deleted.',
    confirmLabel: 'Discard draft',
    cancelLabel: 'Keep editing'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    confirmDisabled: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <button type="button" id="alert-dialog-trigger">Delete files</button>
    <ds-alert-dialog
      open
      tone="danger"
      heading="Delete 3 files?"
      description="They will be removed from all shared folders. This cannot be undone."
      confirm-label="Delete files"
    ></ds-alert-dialog>
  \`
}`,...p.parameters?.docs?.source},description:{story:`Renders open with its trigger and at least three focusable children so the\r
keyboard gate can verify Tab/Shift+Tab wrapping and Escape.`,...p.parameters?.docs?.description}}}})))()}h();export{d as CancelLabel,f as ConfirmDisabled,s as Default,p as Keyboard,c as ToneDanger,u as ToneInfo,l as ToneWarning,m as __namedExportsOrder,o as default};