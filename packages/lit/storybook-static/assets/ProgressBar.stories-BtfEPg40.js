import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Stack-CZSvFm0E.js";import{t as o}from"./ProgressBar-DaAFMEhb.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),o(),a(),s={title:`ProgressBar/Lit`,tags:[`autodocs`],argTypes:{tone:{control:`select`,options:[`neutral`,`success`,`danger`]},announce:{control:`select`,options:[`none`,`milestones`,`complete`]},value:{control:{type:`range`,min:0,max:100,step:1}},showValue:{control:`boolean`},hideLabel:{control:`boolean`}},parameters:{actions:{handles:[]}},args:{label:`Uploading photos`,value:42,min:0,max:100,showValue:!0,hideLabel:!1,tone:`neutral`,announce:`complete`},render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-progress-bar
        label=${e.label}
        value=${r(e.value)}
        min=${e.min}
        max=${e.max}
        tone=${e.tone}
        announce=${e.announce}
        ?hide-label=${e.hideLabel}
        ?hide-value=${!e.showValue}
      ></ds-progress-bar>
    </div>
  `},c={},l={args:{tone:`neutral`}},u={args:{tone:`success`,value:100}},d={args:{tone:`danger`,value:58}},f={args:{announce:`none`}},p={args:{announce:`milestones`}},m={args:{announce:`complete`}},h={args:{value:void 0}},g={args:{value:100,tone:`success`}},_={args:{hideLabel:!0}},v={args:{showValue:!1}},y={render:()=>n`
    <ds-stack gap="4" style="inline-size: min(100%, 24rem)">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  `},b=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneDanger`,`AnnounceNone`,`AnnounceMilestones`,`AnnounceComplete`,`Indeterminate`,`Complete`,`HideLabel`,`HideValue`,`Tones`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'neutral'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    value: 100
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    value: 58
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'none'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'milestones'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    announce: 'complete'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: undefined
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    tone: 'success'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: false
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="4" style="inline-size: min(100%, 24rem)">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  \`
}`,...y.parameters?.docs?.source}}}})))()}x();export{m as AnnounceComplete,p as AnnounceMilestones,f as AnnounceNone,g as Complete,c as Default,_ as HideLabel,v as HideValue,h as Indeterminate,d as ToneDanger,l as ToneNeutral,u as ToneSuccess,y as Tones,b as __namedExportsOrder,s as default};