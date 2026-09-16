import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-Bb3rYm-L.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Button-QLx-usSq.js";import{n as a,t as o}from"./AlertDialog-BLYK2x3Z.js";function s({onConfirm:e,onCancel:t,...n}){let[r,a]=(0,c.useState)(n.open??!1);return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(i,{label:`Delete files`,variant:`danger`,onClick:()=>a(!0)}),(0,l.jsx)(o,{heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,confirmLabel:`Delete files`,...n,open:r,onConfirm:()=>{e?.(),a(!1)},onCancel:e=>{t?.(e),a(!1)}})]})}var c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{c=t(),a(),r(),l=n(),u={title:`AlertDialog/React`,component:o,args:{open:!1,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,tone:`danger`,confirmLabel:`Delete files`,confirmDisabled:!1},render:e=>(0,l.jsx)(s,{...e}),tags:[`autodocs`]},d={},f={args:{tone:`danger`}},p={args:{tone:`warning`,heading:`Discard unsaved changes?`,description:`Your edits since the last save will be lost.`,confirmLabel:`Discard changes`}},m={args:{tone:`info`,heading:`Leave this page?`,description:`Filters you set here will not be kept.`,confirmLabel:`Leave page`}},h={args:{tone:`warning`,heading:`Discard unsaved changes?`,description:`Your edits since the last save will be lost.`,confirmLabel:`Discard changes`,cancelLabel:`Keep editing`}},g={args:{heading:`Delete your account?`,description:`Type the account name below to confirm. This cannot be undone.`,confirmLabel:`Delete account`,confirmDisabled:!0}},_={args:{open:!0},render:e=>(0,l.jsx)(s,{...e})},v=[`Default`,`ToneDanger`,`ToneWarning`,`ToneInfo`,`CustomCancelLabel`,`ConfirmDisabled`,`Keyboard`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Discard unsaved changes?',
    description: 'Your edits since the last save will be lost.',
    confirmLabel: 'Discard changes'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    heading: 'Leave this page?',
    description: 'Filters you set here will not be kept.',
    confirmLabel: 'Leave page'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Discard unsaved changes?',
    description: 'Your edits since the last save will be lost.',
    confirmLabel: 'Discard changes',
    cancelLabel: 'Keep editing'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Delete your account?',
    description: 'Type the account name below to confirm. This cannot be undone.',
    confirmLabel: 'Delete account',
    confirmDisabled: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => <AlertDialogHarness {...args} />
}`,..._.parameters?.docs?.source},description:{story:`Open/present with its trigger and its three focusable children (Cancel, Confirm, and the trigger left behind), for the keyboard gate.`,..._.parameters?.docs?.description}}}})))()}y();export{g as ConfirmDisabled,h as CustomCancelLabel,d as Default,_ as Keyboard,f as ToneDanger,m as ToneInfo,p as ToneWarning,v as __namedExportsOrder,u as default};