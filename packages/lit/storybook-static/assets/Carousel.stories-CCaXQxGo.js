import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Card-Dlyr1ZnO.js";import{l as o}from"./iframe-CsoUKhN4.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),o(),a(),s=[{heading:`Trail runner`,body:`Grippy sole, breathable mesh, built for wet rock.`},{heading:`Everyday backpack`,body:`A padded laptop sleeve and one zip pocket for keys.`},{heading:`Insulated bottle`,body:`Keeps cold drinks cold for a full day on the trail.`},{heading:`Packable jacket`,body:`Folds into its own pocket; blocks wind, not rain.`}],c=()=>s.map(e=>n`
      <ds-carousel-slide heading=${e.heading}>
        <ds-card heading=${e.heading} heading-level="3">${e.body}</ds-card>
      </ds-carousel-slide>
    `),l={title:`Carousel/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{picker:{control:`select`,options:[`dots`,`tabs`,`none`]},perView:{control:`number`},interval:{control:`number`},activeIndex:{control:`number`},loop:{control:`boolean`},autoplay:{control:`boolean`},snap:{control:`boolean`}},args:{label:`Featured products`,perView:1,loop:!1,autoplay:!1,interval:6e3,picker:`dots`,activeIndex:void 0,snap:!0},render:e=>n`
    <div style="max-inline-size: 32rem;">
      <ds-carousel
        label=${e.label}
        per-view=${e.perView}
        interval=${e.interval}
        picker=${e.picker}
        active-index=${r(e.activeIndex)}
        ?loop=${e.loop}
        ?autoplay=${e.autoplay}
        ?no-snap=${!e.snap}
      >
        ${c()}
      </ds-carousel>
    </div>
  `},u={},d={args:{picker:`dots`}},f={args:{picker:`tabs`}},p={args:{picker:`none`}},m={args:{loop:!0}},h={args:{perView:3}},g={args:{autoplay:!0,interval:6e3}},_={args:{snap:!1}},v={args:{activeIndex:2,picker:`tabs`}},y={args:{picker:`tabs`,perView:1}},b=[`Default`,`PickerDots`,`PickerTabs`,`PickerNone`,`Loop`,`PerViewThree`,`Autoplay`,`NoSnap`,`WithActiveIndex`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'dots'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'tabs'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'none'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    loop: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    perView: 3
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    autoplay: true,
    interval: 6000
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    snap: false
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    activeIndex: 2,
    picker: 'tabs'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'tabs',
    perView: 1
  }
}`,...y.parameters?.docs?.source},description:{story:`Renders with the picker present and at least three focusable dots/tabs\r
plus the previous/next controls, so the keyboard gate can verify arrow\r
navigation, wrapping, Home/End and Enter/Space activation.`,...y.parameters?.docs?.description}}}})))()}x();export{g as Autoplay,u as Default,y as Keyboard,m as Loop,_ as NoSnap,h as PerViewThree,d as PickerDots,p as PickerNone,f as PickerTabs,v as WithActiveIndex,b as __namedExportsOrder,l as default};