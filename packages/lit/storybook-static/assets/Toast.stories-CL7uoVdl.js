import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-DM0-zK5H.js";import{S as o,b as s,x as c}from"./iframe-DJFLK4ZL.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{t(),r(),c(),a(),l={title:`Toast/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`dismiss`]}},argTypes:{tone:{control:`select`,options:[`neutral`,`success`,`warning`,`danger`]},duration:{control:`select`,options:[`short`,`long`,`persistent`]},dismissible:{control:`boolean`}},args:{message:`Message sent`,tone:`neutral`,duration:`short`,dismissible:!0},beforeEach:()=>()=>s(),render:e=>i`
    <ds-toast
      message=${e.message}
      tone=${e.tone}
      action-label=${n(e.actionLabel)}
      duration=${e.duration}
      toast-id=${n(e.toastId)}
      ?no-dismiss=${!e.dismissible}
    ></ds-toast>
  `},u={},d={args:{tone:`neutral`}},f={args:{tone:`success`}},p={args:{tone:`warning`}},m={args:{tone:`danger`}},h={args:{duration:`short`}},g={args:{duration:`long`}},_={args:{duration:`persistent`}},v={args:{message:`3 files moved to Archive`,actionLabel:`Undo`,duration:`persistent`}},y={args:{message:`Changes saved`,tone:`success`}},b={args:{message:`Export ready`,actionLabel:`View`,duration:`long`}},x={args:{message:`Upload failed`,tone:`danger`,actionLabel:`Retry`,duration:`persistent`}},S={args:{dismissible:!1}},C={render:e=>i`
    <ds-button
      label="Show toast"
      @press=${()=>void o({message:e.message,tone:e.tone,actionLabel:e.actionLabel,duration:e.duration,dismissible:e.dismissible,toastId:e.toastId})}
    ></ds-button>
  `},w={render:()=>i`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-toast-region style="position: static; inset: auto;">
        <ds-toast message="3 files moved to Archive" action-label="Undo" duration="persistent"></ds-toast>
      </ds-toast-region>
      <button type="button">After</button>
    </div>
  `},T=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`DurationShort`,`DurationLong`,`DurationPersistent`,`UndoADelete`,`Saved`,`BackgroundResult`,`FailedUpload`,`NotDismissible`,`Imperative`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'neutral'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'short'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'long'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'persistent'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    message: '3 files moved to Archive',
    actionLabel: 'Undo',
    duration: 'persistent'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Changes saved',
    tone: 'success'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Export ready',
    actionLabel: 'View',
    duration: 'long'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Upload failed',
    tone: 'danger',
    actionLabel: 'Retry',
    duration: 'persistent'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-button
      label="Show toast"
      @press=\${() => void toast({
    message: args.message,
    tone: args.tone,
    actionLabel: args.actionLabel,
    duration: args.duration,
    dismissible: args.dismissible,
    toastId: args.toastId
  })}
    ></ds-button>
  \`
}`,...C.parameters?.docs?.source},description:{story:`The imperative API: each press shows the story's args as a toast in the auto-created region.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-toast-region style="position: static; inset: auto;">
        <ds-toast message="3 files moved to Archive" action-label="Undo" duration="persistent"></ds-toast>
      </ds-toast-region>
      <button type="button">After</button>
    </div>
  \`
}`,...w.parameters?.docs?.source},description:{story:"A toast present in its region with focusable content before and after it,\r\nso the keyboard gate can check that `F6` moves focus to the toast's action\r\nbutton and back, `Escape` dismisses, and `Tab` moves between the action and\r\ndismiss buttons and out of the region.",...w.parameters?.docs?.description}}}})))()}E();export{b as BackgroundResult,u as Default,g as DurationLong,_ as DurationPersistent,h as DurationShort,x as FailedUpload,C as Imperative,w as Keyboard,S as NotDismissible,y as Saved,m as ToneDanger,d as ToneNeutral,f as ToneSuccess,p as ToneWarning,v as UndoADelete,T as __namedExportsOrder,l as default};