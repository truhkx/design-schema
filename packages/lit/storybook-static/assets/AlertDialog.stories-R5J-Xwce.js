import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-DM0-zK5H.js";import{C as o}from"./iframe-DJFLK4ZL.js";function s(e){e.currentTarget.open=!1}function c(e){let t=e.currentTarget.nextElementSibling;t&&(t.open=!0)}function l(e){return i`
    <ds-button variant="secondary" label="Open alert dialog" @press=${c}></ds-button>
    <ds-alert-dialog
      ?open=${e.open}
      heading=${e.heading}
      description=${e.description}
      tone=${e.tone??`danger`}
      confirm-label=${e.confirmLabel}
      cancel-label=${n(e.cancelLabel)}
      ?confirm-disabled=${e.confirmDisabled??!1}
      @confirm=${s}
      @cancel=${s}
    ></ds-alert-dialog>
  `}var u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),r(),o(),a(),u={title:`AlertDialog/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`confirm`,`cancel`]}},argTypes:{tone:{control:`select`,options:[`danger`,`warning`,`info`]}},args:{open:!0,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,tone:`danger`,confirmLabel:`Delete files`,confirmDisabled:!1},render:l},d={},f={args:{tone:`danger`}},p={args:{tone:`warning`}},m={args:{tone:`info`}},h={args:{confirmDisabled:!0}},g={args:{open:!0,tone:`danger`,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,confirmLabel:`Delete files`}},_={args:{open:!0,tone:`warning`,heading:`Leave without saving?`,description:`Your changes to this draft will be lost.`,confirmLabel:`Leave`,cancelLabel:`Keep editing`}},v={args:{open:!0,tone:`danger`,heading:`Cancel your subscription?`,description:`Your workspace stays read-only after the current billing period ends.`,confirmLabel:`Cancel subscription`,confirmDisabled:!0}},y={args:{open:!0,tone:`info`,heading:`Publish to the team?`,description:`Everyone in the workspace will be able to see this page.`,confirmLabel:`Publish`}},b={},x=[`Default`,`ToneDanger`,`ToneWarning`,`ToneInfo`,`ConfirmDisabled`,`DeleteFiles`,`LeaveWithoutSaving`,`TypedConfirmation`,`PublishToTheTeam`,`Keyboard`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    confirmDisabled: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave',
    cancelLabel: 'Keep editing'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Cancel your subscription?',
    description: 'Your workspace stays read-only after the current billing period ends.',
    confirmLabel: 'Cancel subscription',
    confirmDisabled: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source},description:{story:`Open with its trigger. The dialog has exactly two focusable children (Cancel, then Confirm): an\r
alert dialog carries no other controls, so the keyboard gate checks Escape and Tab / Shift+Tab\r
wrapping between those two.`,...b.parameters?.docs?.description}}}})))()}S();export{h as ConfirmDisabled,d as Default,g as DeleteFiles,b as Keyboard,_ as LeaveWithoutSaving,y as PublishToTheTeam,f as ToneDanger,m as ToneInfo,p as ToneWarning,v as TypedConfirmation,x as __namedExportsOrder,u as default};