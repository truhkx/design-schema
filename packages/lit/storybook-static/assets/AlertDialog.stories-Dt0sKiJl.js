import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-B3rVveNU.js";import{C as o}from"./iframe-C6sywzE2.js";function s(e){e.currentTarget.open=!1}function c(e){let t=e.currentTarget.nextElementSibling;t&&(t.open=!0)}var l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),r(),o(),a(),l={title:`AlertDialog/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`confirm`,`cancel`]}},argTypes:{tone:{control:`inline-radio`,options:[`danger`,`warning`,`info`]}},args:{open:!0,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,tone:`danger`,confirmLabel:`Delete files`,confirmDisabled:!1},render:e=>i`
    <ds-button label=${e.heading} @press=${c}></ds-button>
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
  `},u={},d={args:{tone:`danger`}},f={args:{tone:`warning`}},p={args:{tone:`info`}},m={args:{confirmDisabled:!0}},h={args:{open:!1}},g={args:{open:!0}},_={args:{open:!0,tone:`danger`,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,confirmLabel:`Delete files`,cancelLabel:void 0,confirmDisabled:!1}},v={args:{open:!0,tone:`warning`,heading:`Leave without saving?`,description:`Your changes to this draft will be lost.`,confirmLabel:`Leave`,cancelLabel:`Keep editing`,confirmDisabled:!1}},y={args:{open:!0,tone:`danger`,heading:`Cancel your subscription?`,description:`Your workspace stays read-only after the current billing period ends.`,confirmLabel:`Cancel subscription`,cancelLabel:void 0,confirmDisabled:!0}},b={args:{open:!0,tone:`info`,heading:`Publish to the team?`,description:`Everyone in the workspace will be able to see this page.`,confirmLabel:`Publish`,cancelLabel:void 0,confirmDisabled:!1}},x=[`Default`,`ToneDanger`,`ToneWarning`,`ToneInfo`,`ConfirmDisabled`,`Closed`,`Keyboard`,`DeleteFiles`,`LeaveWithoutSaving`,`TypedConfirmation`,`PublishToTheTeam`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    confirmDisabled: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...g.parameters?.docs?.source},description:{story:`Open with its trigger. The dialog has exactly two focusable children, Cancel and Confirm — there\r
is no slot for more — so Tab wraps across those two and the trigger sits behind the inert page.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files',
    cancelLabel: undefined,
    confirmDisabled: false
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave',
    cancelLabel: 'Keep editing',
    confirmDisabled: false
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Cancel your subscription?',
    description: 'Your workspace stays read-only after the current billing period ends.',
    confirmLabel: 'Cancel subscription',
    cancelLabel: undefined,
    confirmDisabled: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish',
    cancelLabel: undefined,
    confirmDisabled: false
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{h as Closed,m as ConfirmDisabled,u as Default,_ as DeleteFiles,g as Keyboard,v as LeaveWithoutSaving,b as PublishToTheTeam,d as ToneDanger,p as ToneInfo,f as ToneWarning,y as TypedConfirmation,x as __namedExportsOrder,l as default};